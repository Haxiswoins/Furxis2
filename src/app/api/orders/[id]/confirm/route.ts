import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import type { Order, SiteContent } from '@/types';
import { sendEmail } from '@/ai/flows/send-email-flow';

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');
const siteContentFilePath = path.join(process.cwd(), 'data', 'siteContent.json');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function readData<T>(filePath: string): Promise<T> {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}

async function writeData(filePath: string, data: any): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const orders = await readData<Order[]>(ordersFilePath);
        const index = orders.findIndex(o => o.id === params.id);

        if (index === -1) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }
        
        const order = orders[index];

        if (order.status !== '待确认') {
            return NextResponse.json({ message: 'Order cannot be confirmed at its current status.' }, { status: 400 });
        }

        order.status = '已确认';
        await writeData(ordersFilePath, orders);

        // Send email notification to admin
        try {
            const siteContent = await readData<SiteContent>(siteContentFilePath);
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
            // Do not block the main flow if email fails
        }
        
        return NextResponse.json(orders[index]);

    } catch (error) {
        console.error("Error confirming order:", error);
        return NextResponse.json({ message: 'Error confirming order' }, { status: 500 });
    }
}
