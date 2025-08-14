import { NextRequest, NextResponse } from 'next/server';
import type { Order } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'orders.json');

async function reinstateOrderHandler(id: string): Promise<Order> {
    const orders = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const index = orders.findIndex((o: Order) => o.id === id);
    if (index === -1) throw new Error('Order not found');

    orders[index].status = '申请中';
    orders[index].cancellationReason = '';

    await fs.writeFile(filePath, JSON.stringify(orders, null, 2), 'utf8');
    return orders[index];
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const updatedOrder = await reinstateOrderHandler(params.id);
        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Error reinstating order:", error);
        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json({ message: 'Error updating order' }, { status: 500 });
    }
}
