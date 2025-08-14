import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { CharacterSeries } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'characterSeries.json');

async function getCharacterSeriesHandler(): Promise<CharacterSeries[]> {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}

async function saveCharacterSeriesHandler(seriesData: Omit<CharacterSeries, 'id'>, id?: string): Promise<CharacterSeries> {
    const allSeries = await getCharacterSeriesHandler();
    if (id) {
        const index = allSeries.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Series not found');
        const updatedSeries = { ...allSeries[index], ...seriesData };
        allSeries[index] = updatedSeries;
        await fs.writeFile(filePath, JSON.stringify(allSeries, null, 2), 'utf8');
        return updatedSeries;
    } else {
        const newSeries: CharacterSeries = { id: `series_${Date.now()}`, ...seriesData };
        allSeries.push(newSeries);
        await fs.writeFile(filePath, JSON.stringify(allSeries, null, 2), 'utf8');
        return newSeries;
    }
}

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
