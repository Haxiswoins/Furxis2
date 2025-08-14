import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCommissionStyleByIdHandler, saveCommissionStyleHandler, deleteCommissionStyleHandler } from '@/lib/data-handler';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const style = await getCommissionStyleByIdHandler(params.id);
    if (!style) {
      return NextResponse.json({ message: 'Commission style not found' }, { status: 404 });
    }
    return NextResponse.json(style);
  } catch (error) {
    console.error(`[API/COMMISSION-STYLES/GET_BY_ID] Failed for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

const putSchema = z.object({
  commissionOptionId: z.string(),
  name: z.string(),
  price: z.string(),
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

    const updatedStyle = await saveCommissionStyleHandler(validation.data, params.id);
    return NextResponse.json(updatedStyle);
  } catch (error) {
    console.error(`[API/COMMISSION-STYLES/PUT] Failed for ID ${params.id}:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteCommissionStyleHandler(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API/COMMISSION-STYLES/DELETE] Failed for ID ${params.id}:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
