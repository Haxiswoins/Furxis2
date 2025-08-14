import { NextRequest, NextResponse } from 'next/server';
import type { Order } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'orders.json');

async function getOrdersHandler(): Promise<Order[]> {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    let orders = await getOrdersHandler();

    if (userId) {
      orders = orders.filter(order => order.userId === userId);
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('[API/ORDERS/GET] Failed to read data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to read data' }, { status: 500 });
  }
}
