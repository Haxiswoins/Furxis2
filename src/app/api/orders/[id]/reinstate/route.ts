import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import type { Order } from '@/types';

const jsonDirectory = path.join(process.cwd(), 'data');
const ordersFilePath = path.join(jsonDirectory, 'orders.json');

async function readOrders(): Promise<Order[]> {
    const fileContents = await fs.readFile(ordersFilePath, 'utf8');
    return JSON.parse(fileContents);
}

async function writeOrders(data: Order[]): Promise<void> {
    await fs.writeFile(ordersFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const orders = await readOrders();
        const index = orders.findIndex(o => o.id === params.id);
        if (index === -1) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        orders[index].status = '申请中';
        orders[index].cancellationReason = '';

        await writeOrders(orders);
        return NextResponse.json(orders[index]);

    } catch (error) {
        console.error("Error reinstating order:", error);
        return NextResponse.json({ message: 'Error updating order' }, { status: 500 });
    }
}
