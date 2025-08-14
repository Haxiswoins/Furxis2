import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import path from 'path';
import { promises as fs } from 'fs';
import type { Character } from '@/types';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'characters.json');

async function readData(): Promise<Character[]> {
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

async function writeData(data: Character[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}


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
  imageUrl2: z.string().optional(),
  imageUrl3: z.string().optional(),
  imageUrl4: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const characters = await readData();
    const character = characters.find(c => c.id === params.id);

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

    let characters = await readData();
    const index = characters.findIndex(c => c.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Character not found' }, { status: 404 });
    }

    const updatedCharacter = { ...characters[index], ...validation.data };
    characters[index] = updatedCharacter;
    
    await writeData(characters);

    return NextResponse.json(characters[index]);
  } catch (error) {
    console.error(`[API/CHARACTERS/PUT] Failed to write data for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let characters = await readData();
    const originalLength = characters.length;
    const filteredCharacters = characters.filter(c => c.id !== params.id);

    if (originalLength === filteredCharacters.length) {
      return NextResponse.json({ message: 'Character not found' }, { status: 404 });
    }

    await writeData(filteredCharacters);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API/CHARACTERS/DELETE] Failed to delete data for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}
