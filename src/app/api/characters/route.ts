import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCharactersHandler, saveCharacterHandler } from '@/lib/data-handler';

export async function GET() {
  try {
    const data = await getCharactersHandler();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/CHARACTERS/GET] Failed to read data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to read data' }, { status: 500 });
  }
}

const postSchema = z.object({
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = postSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.errors }, { status: 400 });
    }

    const newCharacter = await saveCharacterHandler(validation.data);
    return NextResponse.json(newCharacter, { status: 201 });
  } catch (error) {
    console.error('[API/CHARACTERS/POST] Failed to write data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}
