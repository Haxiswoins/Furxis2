import { NextRequest, NextResponse } from 'next/server';
import type { Order } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { getSiteContent } from '@/lib/data-service';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'orders.json');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function cancelOrderHandler(id: string, reason: string): Promise<Order> {
    const orders = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const index = orders.findIndex((o: Order) => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const order = orders[index];
    order.status = '取消中';
    order.cancellationReason = reason;

    try {
        const siteContent = await getSiteContent();
        if (siteContent.adminEmail) {
            await sendEmail({
                to: siteContent.adminEmail,
                from: 'notification@suitopia.club', 
                subject: `[取消申请] 用户申请取消订单 #${order.orderNumber}`,
                html: `
                    <h1>新的取消申请</h1>
                    <p>用户已申请取消一个订单。请登录后台查看并处理。</p>
                    <ul>
                        <li><strong>订单号:</strong> ${order.orderNumber}</li>
                        <li><strong>产品名称:</strong> ${order.productName}</li>
                        <li><strong>用户ID:</strong> ${order.userId}</li>
                        <li><strong>取消原因:</strong> ${reason}</li>
                    </ul>
                    <p>请<a href="${BASE_URL}/admin/orders/edit/${order.id}">点击这里</a>处理订单。</p>
                `
            });
        }
    } catch (emailError) {
        console.error("Failed to send cancellation notification email:", emailError);
    }
    
    await fs.writeFile(filePath, JSON.stringify(orders, null, 2), 'utf8');
    return order;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { reason } = await req.json();
        if (!reason) {
            return NextResponse.json({ message: 'Cancellation reason is required' }, { status: 400 });
        }
        
        const updatedOrder = await cancelOrderHandler(params.id, reason);
        return NextResponse.json(updatedOrder);

    } catch (error) {
        console.error("Error in API route /api/orders/[id]/cancel:", error);
        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json({ message: 'Error updating order' }, { status: 500 });
    }
}
