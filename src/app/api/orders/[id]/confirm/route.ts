import { NextRequest, NextResponse } from 'next/server';
import { confirmCommissionOrderHandler } from '@/lib/data-handler';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const updatedOrder = await confirmCommissionOrderHandler(params.id);
        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Error confirming order:", error);
        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json({ message: 'Error confirming order' }, { status: 500 });
    }
}
