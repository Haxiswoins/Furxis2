import { NextRequest, NextResponse } from 'next/server';
import type { Character, ApplicationData, Order } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { getSiteContent } from '@/lib/data-service';

const jsonDirectory = path.join(process.cwd(), 'data');
const ordersFilePath = path.join(jsonDirectory, 'orders.json');
const charactersFilePath = path.join(jsonDirectory, 'characters.json');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function createAdoptionApplicationHandler(userId: string, character: Character, applicationData: ApplicationData): Promise<Order> {
    const orders = JSON.parse(await fs.readFile(ordersFilePath, 'utf8'));
    const characters = JSON.parse(await fs.readFile(charactersFilePath, 'utf8'));

    const orderNumber = `S${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
        id: `order_${Date.now()}`,
        userId,
        productName: character.name,
        orderNumber,
        orderType: '领养订单',
        status: '申请中',
        imageUrl: character.imageUrl,
        orderDate: new Date().toISOString(),
        total: character.price,
        shippingAddress: `${applicationData.province} ${applicationData.city} ${applicationData.district} ${applicationData.addressDetail}`,
        applicationData,
    };
    
    orders.push(newOrder);

    const charIndex = characters.findIndex((c: Character) => c.id === character.id);
    if (charIndex > -1) {
        characters[charIndex].applicants += 1;
    }
    
    try {
        const siteContent = await getSiteContent();
        if (siteContent.adminEmail) {
            await sendEmail({
                to: siteContent.adminEmail,
                from: 'notification@suitopia.club',
                subject: `[新领养申请] ${character.name}`,
                html: `<h1>新的领养申请</h1><p>您收到了一个新的设定领养申请。请登录后台查看并处理。</p><ul><li><strong>产品名称:</strong> ${character.name}</li><li><strong>订单号:</strong> ${newOrder.orderNumber}</li><li><strong>申请人:</strong> ${applicationData.userName}</li><li><strong>联系电话:</strong> ${applicationData.phone}</li></ul><p>请<a href="${BASE_URL}/admin/orders/edit/${newOrder.id}">点击这里</a>处理订单。</p>`
            });
        }
    } catch (emailError) {
        console.error("Failed to send new adoption notification email:", emailError);
    }

    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf8');
    return newOrder;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, character, applicationData } = await req.json() as { userId: string, character: Character, applicationData: ApplicationData };

    if (!userId || !character || !applicationData) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    
    const newOrder = await createAdoptionApplicationHandler(userId, character, applicationData);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating adoption application' }, { status: 500 });
  }
}
