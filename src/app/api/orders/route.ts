import { NextRequest, NextResponse } from 'next/server';
import { getOrdersHandler } from '@/lib/data-handler';

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
