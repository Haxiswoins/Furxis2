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

async function getCharacterSeriesByIdHandler(id: string): Promise<CharacterSeries | null> {
    const allSeries = await getCharacterSeriesHandler();
    return allSeries.find(s => s.id === id) || null;
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

async function deleteCharacterSeriesHandler(id: string): Promise<void> {
    const allSeries = await getCharacterSeriesHandler();
    const filtered = allSeries.filter(s => s.id !== id);
    if (allSeries.length === filtered.length) throw new Error('Series not found');
    await fs.writeFile(filePath, JSON.stringify(filtered, null, 2), 'utf8');
}


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
