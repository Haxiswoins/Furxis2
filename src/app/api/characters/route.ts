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


export async function GET() {
  try {
    const data = await readData();
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
  imageUrl: z.string().url(),
  imageUrl1: z.string().url(),
  imageUrl2: z.string().url().optional(),
  imageUrl3: z.string().url().optional(),
  imageUrl4: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = postSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.errors }, { status: 400 });
    }

    const characters = await readData();
    const newCharacter: Character = {
      id: `char_${Date.now()}`,
      ...validation.data,
    };
    characters.push(newCharacter);
    await writeData(characters);
    
    return NextResponse.json(newCharacter, { status: 201 });
  } catch (error) {
    console.error('[API/CHARACTERS/POST] Failed to write data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}
