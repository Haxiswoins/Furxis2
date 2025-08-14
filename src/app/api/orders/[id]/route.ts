import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Order } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { getSiteContent } from '@/lib/data-service';
import { getContracts } from '@/lib/data-service';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'orders.json');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function getOrdersHandler(): Promise<Order[]> {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}

async function getOrderByIdHandler(id: string): Promise<Order | null> {
    const orders = await getOrdersHandler();
    return orders.find(o => o.id === id) || null;
}

async function deleteOrderHandler(id: string): Promise<void> {
    const orders = await getOrdersHandler();
    const filtered = orders.filter(o => o.id !== id);
    if (orders.length === filtered.length) throw new Error('Order not found');
    await fs.writeFile(filePath, JSON.stringify(filtered, null, 2), 'utf8');
}

async function updateOrderHandler(id: string, data: Partial<Order>): Promise<Order> {
    const orders = await getOrdersHandler();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const originalOrder = orders[index];
    const updatedOrder = { ...originalOrder, ...data };
    orders[index] = updatedOrder;

    if (originalOrder.status !== '待确认' && updatedOrder.status === '待确认' && updatedOrder.orderType === '委托订单') {
         try {
            const contracts = await getContracts();
            const userEmail = updatedOrder.applicationData?.email;
            
            if(contracts.commissionConfirmationEmail && userEmail) {
                let emailHtml = contracts.commissionConfirmationEmail.replace('{productName}', updatedOrder.productName);
                await sendEmail({
                    to: userEmail,
                    from: 'notification@suitopia.club',
                    subject: `您的委托申请已通过初审！`,
                    html: emailHtml
                });
            }
         } catch(e) {
            console.error("Failed to send commission confirmation email:", e);
         }
    }
    await fs.writeFile(filePath, JSON.stringify(orders, null, 2), 'utf8');
    return updatedOrder;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await getOrderByIdHandler(params.id);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error(`[API/ORDERS/GET_BY_ID] Failed to read data for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to read data' }, { status: 500 });
  }
}

const applicationDataSchema = z.object({
    userName: z.string(),
    age: z.string(),
    phone: z.string(),
    qq: z.string(),
    email: z.string(),
    height: z.string(),
    weight: z.string(),
    province: z.string(),
    city: z.string(),
    district: z.string(),
    addressDetail: z.string(),
    referenceImageUrl: z.string().nullable().optional(),
}).optional();

const patchSchema = z.object({
  total: z.string().optional(),
  status: z.enum(['申请中', '待确认', '已确认', '排队中', '制作中', '取消中', '已发货', '已完成', '已取消']).optional(),
  shippingTrackingId: z.string().optional().nullable(),
  applicationData: applicationDataSchema,
  shippingAddress: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validation = patchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.errors }, { status: 400 });
    }
    
    const updatedOrder = await updateOrderHandler(params.id, validation.data);
    return NextResponse.json(updatedOrder);

  } catch (error) {
    console.error(`[API/ORDERS/PATCH] Failed to write data for ID ${params.id}:`, error);
     if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteOrderHandler(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API/ORDERS/DELETE] Failed to delete data for ID ${params.id}:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}
