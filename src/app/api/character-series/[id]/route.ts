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
        console.error("Error reading characterSeries.json", error);
        return [];
    }
}

async function writeData(data: CharacterSeries[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const allSeries = await readData();
    const item = allSeries.find(s => s.id === params.id);

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
    
    const allSeries = await readData();
    const index = allSeries.findIndex(s => s.id === params.id);
    if (index === -1) {
        return NextResponse.json({ message: 'Character series not found' }, { status: 404 });
    }

    const updatedSeries = { ...allSeries[index], ...validation.data };
    allSeries[index] = updatedSeries;
    await writeData(allSeries);
    
    return NextResponse.json(updatedSeries);
  } catch (error) {
    console.error(`[API/CHARACTER-SERIES/PUT] Failed for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const allSeries = await readData();
    const filteredSeries = allSeries.filter(s => s.id !== params.id);

    if (allSeries.length === filteredSeries.length) {
        return NextResponse.json({ message: 'Character series not found' }, { status: 404 });
    }

    await writeData(filteredSeries);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API/CHARACTER-SERIES/DELETE] Failed for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
