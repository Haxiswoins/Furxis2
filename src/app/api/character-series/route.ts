import { NextRequest, NextResponse } from 'next/server';
import { getCharacterSeriesHandler, saveCharacterSeriesHandler } from '@/lib/data-handler';
import { z } from 'zod';
import type { CharacterSeries } from '@/types';

export async function GET() {
  try {
    const data = await getCharacterSeriesHandler();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/CHARACTER-SERIES/GET] Failed to read data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to read data' }, { status: 500 });
  }
}

const postSchema = z.object({
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = postSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.errors }, { status: 400 });
    }

    const newSeries = await saveCharacterSeriesHandler(validation.data);
    return NextResponse.json(newSeries, { status: 201 });
  } catch (error) {
    console.error('[API/CHARACTER-SERIES/POST] Failed to write data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}
