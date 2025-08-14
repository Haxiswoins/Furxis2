import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCharacterByIdHandler, saveCharacterHandler, deleteCharacterHandler } from '@/lib/data-handler';

const putSchema = z.object({
  seriesId: z.string(),
  name: z.string(),
  species: z.string(),
  price: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  applicants: z.number(),
  imageUrl: z.string(),
  imageUrl1: z.string(),
  imageUrl2: z.string().optional().nullable(),
  imageUrl3: z.string().optional().nullable(),
  imageUrl4: z.string().optional().nullable(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const character = await getCharacterByIdHandler(params.id);
    if (!character) {
      return NextResponse.json({ message: 'Character not found' }, { status: 404 });
    }
    return NextResponse.json(character);
  } catch (error) {
    console.error(`[API/CHARACTERS/GET_BY_ID] Failed to read data for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to read data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validation = putSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.errors }, { status: 400 });
    }

    const updatedCharacter = await saveCharacterHandler(validation.data, params.id);
    return NextResponse.json(updatedCharacter);
  } catch (error) {
    console.error(`[API/CHARACTERS/PUT] Failed for ID ${params.id}:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteCharacterHandler(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API/CHARACTERS/DELETE] Failed to delete data for ID ${params.id}:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}
