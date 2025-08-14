
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
        const { reason } = await req.json();
        if (!reason) {
            return NextResponse.json({ message: 'Cancellation reason is required' }, { status: 400 });
        }

        const orders = await readData<Order[]>(ordersFilePath);
        const index = orders.findIndex(o => o.id === params.id);

        if (index === -1) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }
        
        const order = orders[index];
        order.status = '取消中';
        order.cancellationReason = reason;

        await writeData(ordersFilePath, orders);

        // Send email notification
        try {
            const siteContent = await readData<SiteContent>(siteContentFilePath);
            if (siteContent.adminEmail) {
                await sendEmail({
                    to: siteContent.adminEmail,
                    from: 'notification@suitopia.club', // Must be a verified domain on your email provider
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
            // Do not block the main flow if email fails
        }
        
        return NextResponse.json(orders[index]);

    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json({ message: 'Error updating order' }, { status: 500 });
    }
}
