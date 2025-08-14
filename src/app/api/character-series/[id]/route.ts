import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCharacterSeriesByIdHandler, saveCharacterSeriesHandler, deleteCharacterSeriesHandler } from '@/lib/data-handler';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await getCharacterSeriesByIdHandler(params.id);
    if (!item) {
      return NextResponse.json({ message: 'Character series not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error(`[API/CHARACTER-SERIES/GET_BY_ID] Failed for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

const putSchema = z.object({
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validation = putSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.errors }, { status: 400 });
    }
    
    const updatedSeries = await saveCharacterSeriesHandler(validation.data, params.id);
    return NextResponse.json(updatedSeries);
  } catch (error) {
    console.error(`[API/CHARACTER-SERIES/PUT] Failed for ID ${params.id}:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteCharacterSeriesHandler(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API/CHARACTER-SERIES/DELETE] Failed for ID ${params.id}:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
