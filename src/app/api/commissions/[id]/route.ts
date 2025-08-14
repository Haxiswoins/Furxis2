import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCommissionOptionByIdHandler, saveCommissionOptionHandler, deleteCommissionOptionHandler } from '@/lib/data-handler';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const commission = await getCommissionOptionByIdHandler(params.id);
    if (!commission) {
      return NextResponse.json({ message: 'Commission option not found' }, { status: 404 });
    }
    return NextResponse.json(commission);
  } catch (error) {
    console.error(`[API/COMMISSIONS/GET_BY_ID] Failed to read data for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to read data' }, { status: 500 });
  }
}

const putSchema = z.object({
    name: z.string(),
    category: z.string(),
    price: z.string(),
    status: z.enum(['开放中', '已结束', '即将开放']),
    description: z.string(),
    tags: z.array(z.string()),
    imageUrl: z.string(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validation = putSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.errors }, { status: 400 });
    }
    
    const updatedOption = await saveCommissionOptionHandler(validation.data, params.id);
    return NextResponse.json(updatedOption);
  } catch (error) {
    console.error(`[API/COMMISSIONS/PUT] Failed to write data for ID ${params.id}:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteCommissionOptionHandler(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API/COMMISSIONS/DELETE] Failed to delete data for ID ${params.id}:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}
