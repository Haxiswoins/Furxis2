import { NextRequest, NextResponse } from 'next/server';
import { cancelOrderHandler } from '@/lib/data-handler';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { reason } = await req.json();
        if (!reason) {
            return NextResponse.json({ message: 'Cancellation reason is required' }, { status: 400 });
        }
        
        const updatedOrder = await cancelOrderHandler(params.id, reason);
        return NextResponse.json(updatedOrder);

    } catch (error) {
        console.error("Error in API route /api/orders/[id]/cancel:", error);
        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json({ message: 'Error updating order' }, { status: 500 });
    }
}
