import { NextRequest, NextResponse } from 'next/server';
import type { Order } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { getSiteContent } from '@/lib/data-service';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'orders.json');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function confirmCommissionOrderHandler(id: string): Promise<Order> {
    const orders = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const index = orders.findIndex((o: Order) => o.id === id);
    if (index === -1) throw new Error('Order not found');
    const order = orders[index];
    if (order.status !== '待确认') throw new Error('Order cannot be confirmed');

    order.status = '已确认';

    try {
        const siteContent = await getSiteContent();
        if (siteContent.adminEmail) {
            await sendEmail({
                to: siteContent.adminEmail,
                from: 'notification@suitopia.club',
                subject: `[订单已确认] 用户已确认订单 #${order.orderNumber}`,
                html: `
                    <h1>订单已确认</h1>
                    <p>用户已确认了他们的委托订单，状态已更新为“已确认”。</p>
                    <ul>
                        <li><strong>订单号:</strong> ${order.orderNumber}</li>
                        <li><strong>产品名称:</strong> ${order.productName}</li>
                        <li><strong>用户ID:</strong> ${order.userId}</li>
                    </ul>
                    <p>请<a href="${BASE_URL}/admin/orders/edit/${order.id}">点击这里</a>查看订单详情。</p>
                `
            });
        }
    } catch (emailError) {
        console.error("Failed to send order confirmation email to admin:", emailError);
    }
    
    await fs.writeFile(filePath, JSON.stringify(orders, null, 2), 'utf8');
    return order;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const updatedOrder = await confirmCommissionOrderHandler(params.id);
        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Error confirming order:", error);
        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json({ message: 'Error confirming order' }, { status: 500 });
    }
}
