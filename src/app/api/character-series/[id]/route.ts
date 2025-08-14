
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import path from 'path';
import { promises as fs } from 'fs';
import type { CharacterSeries } from '@/types';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'characterSeries.json');

async function readData(): Promise<CharacterSeries[]> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeData(data: CharacterSeries[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const series = await readData();
    const item = series.find(s => s.id === params.id);

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

    let series = await readData();
    const index = series.findIndex(s => s.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Character series not found' }, { status: 404 });
    }

    series[index] = { ...series[index], ...validation.data };
    await writeData(series);

    return NextResponse.json(series[index]);
  } catch (error) {
    console.error(`[API/CHARACTER-SERIES/PUT] Failed for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let series = await readData();
    const originalLength = series.length;
    const filteredSeries = series.filter(s => s.id !== params.id);

    if (originalLength === filteredSeries.length) {
      return NextResponse.json({ message: 'Character series not found' }, { status: 404 });
    }

    await writeData(filteredSeries);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API/CHARACTER-SERIES/DELETE] Failed for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
