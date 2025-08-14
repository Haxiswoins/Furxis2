
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import path from 'path';
import { promises as fs } from 'fs';
import type { Order, ApplicationData } from '@/types';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'orders.json');

async function readData(): Promise<Order[]> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeData(data: Order[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orders = await readData();
    const order = orders.find(o => o.id === params.id);

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
  status: z.enum(['申请中', '待确认', '排队中', '制作中', '取消中', '已发货', '已完成', '已取消']).optional(),
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

    let orders = await readData();
    const index = orders.findIndex(o => o.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    orders[index] = { ...orders[index], ...validation.data };
    await writeData(orders);

    return NextResponse.json(orders[index]);
  } catch (error) {
    console.error(`[API/ORDERS/PATCH] Failed to write data for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let orders = await readData();
    const originalLength = orders.length;
    const filteredOrders = orders.filter(o => o.id !== params.id);

    if (originalLength === filteredOrders.length) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    await writeData(filteredOrders);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API/ORDERS/DELETE] Failed to delete data for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}
