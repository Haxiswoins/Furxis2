import { NextRequest, NextResponse } from 'next/server';
import type { CommissionStyle, ApplicationData, Order } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { getSiteContent } from '@/lib/data-service';


const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'orders.json');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function createCommissionApplicationHandler(userId: string, commissionStyle: CommissionStyle, applicationData: ApplicationData): Promise<Order> {
    const orders = JSON.parse(await fs.readFile(filePath, 'utf8'));
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

    orders.push(newOrder);

    try {
        const siteContent = await getSiteContent();
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
    
    await fs.writeFile(filePath, JSON.stringify(orders, null, 2), 'utf8');
    return newOrder;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, commissionStyle, applicationData } = await req.json() as { userId: string, commissionStyle: CommissionStyle, applicationData: ApplicationData };

     if (!userId || !commissionStyle || !applicationData) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newOrder = await createCommissionApplicationHandler(userId, commissionStyle, applicationData);
    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
     console.error(error);
    return NextResponse.json({ message: 'Error creating commission application' }, { status: 500 });
  }
}
