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
