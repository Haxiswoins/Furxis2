import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import type { CommissionStyle, ApplicationData, Order, SiteContent } from '@/types';
import { sendEmail } from '@/ai/flows/send-email-flow';

const jsonDirectory = path.join(process.cwd(), 'data');
const ordersFilePath = path.join(jsonDirectory, 'orders.json');
const siteContentFilePath = path.join(jsonDirectory, 'siteContent.json');

async function readOrders(): Promise<Order[]> {
    const fileContents = await fs.readFile(ordersFilePath, 'utf8');
    return JSON.parse(fileContents);
}

async function writeOrders(data: Order[]): Promise<void> {
    await fs.writeFile(ordersFilePath, JSON.stringify(data, null, 2), 'utf8');
}

async function readSiteContent(): Promise<SiteContent> {
    const fileContents = await fs.readFile(siteContentFilePath, 'utf8');
    return JSON.parse(fileContents);
}

export async function POST(req: NextRequest) {
  try {
    const { userId, commissionStyle, applicationData } = await req.json() as { userId: string, commissionStyle: CommissionStyle, applicationData: ApplicationData };

     if (!userId || !commissionStyle || !applicationData) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const orderNumber = `C${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: Order = {
        id: `order_${Date.now()}`,
        userId,
        productName: commissionStyle.name,
        orderNumber,
        orderType: '委托订单',
        status: '申请中',
        imageUrl: commissionStyle.imageUrl,
        orderDate: new Date().toISOString(),
        total: `${commissionStyle.price} (估价)`,
        shippingAddress: `${applicationData.province} ${applicationData.city} ${applicationData.district} ${applicationData.addressDetail}`,
        applicationData,
        referenceImageUrl: applicationData.referenceImageUrl || null,
    };

    const orders = await readOrders();
    orders.push(newOrder);
    await writeOrders(orders);

    try {
        const siteContent = await readSiteContent();
        const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        if (siteContent.adminEmail) {
            await sendEmail({
                to: siteContent.adminEmail,
                from: 'notification@suitopia.club',
                subject: `[新委托申请] ${commissionStyle.name}`,
                html: `<h1>新的委托申请</h1><p>您收到了一个新的委托申请。请登录后台查看并处理。</p><ul><li><strong>产品名称:</strong> ${commissionStyle.name}</li><li><strong>订单号:</strong> ${newOrder.orderNumber}</li><li><strong>申请人:</strong> ${applicationData.userName}</li><li><strong>联系电话:</strong> ${applicationData.phone}</li></ul><p>请<a href="${BASE_URL}/admin/orders/edit/${newOrder.id}">点击这里</a>处理订单。</p>`
            });
        }
    } catch (emailError) {
        console.error("Failed to send new commission notification email:", emailError);
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
     console.error(error);
    return NextResponse.json({ message: 'Error creating commission application' }, { status: 500 });
  }
}
