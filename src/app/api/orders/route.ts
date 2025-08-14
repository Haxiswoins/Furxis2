
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import type { Order } from '@/types';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'orders.json');

async function readData(): Promise<Order[]> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    let orders = await readData();

    if (userId) {
      orders = orders.filter(order => order.userId === userId);
    }
    
    // Sort by date descending
    orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    return NextResponse.json(orders);
  } catch (error) {
    console.error('[API/ORDERS/GET] Failed to read data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to read data' }, { status: 500 });
  }
}
