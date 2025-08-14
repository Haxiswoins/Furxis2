import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Character } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'characters.json');

async function getCharactersHandler(): Promise<Character[]> {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}

async function getCharacterByIdHandler(id: string): Promise<Character | null> {
    const characters = await getCharactersHandler();
    return characters.find(c => c.id === id) || null;
}

async function saveCharacterHandler(characterData: Omit<Character, 'id'>, id?: string): Promise<Character> {
    const characters = await getCharactersHandler();
    if (id) {
        const index = characters.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Character not found');
        const updatedCharacter = { ...characters[index], ...characterData };
        characters[index] = updatedCharacter;
        await fs.writeFile(filePath, JSON.stringify(characters, null, 2), 'utf8');
        return updatedCharacter;
    } else {
        const newCharacter: Character = { id: `char_${Date.now()}`, ...characterData };
        characters.push(newCharacter);
        await fs.writeFile(filePath, JSON.stringify(characters, null, 2), 'utf8');
        return newCharacter;
    }
}

async function deleteCharacterHandler(id: string): Promise<void> {
    const characters = await getCharactersHandler();
    const filtered = characters.filter(c => c.id !== id);
    if (characters.length === filtered.length) throw new Error('Character not found');
    await fs.writeFile(filePath, JSON.stringify(filtered, null, 2), 'utf8');
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
