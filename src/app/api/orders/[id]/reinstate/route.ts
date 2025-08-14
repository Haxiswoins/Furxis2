
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import type { Order } from '@/types';

const filePath = path.join(process.cwd(), 'data', 'orders.json');

async function readData(): Promise<Order[]> {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}

async function writeData(data: Order[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const orders = await readData();
        const index = orders.findIndex(o => o.id === params.id);

        if (index === -1) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        orders[index].status = '申请中';
        orders[index].cancellationReason = ''; // Clear reason

        await writeData(orders);
        return NextResponse.json(orders[index]);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating order' }, { status: 500 });
    }
}
