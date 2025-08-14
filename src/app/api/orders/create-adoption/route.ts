import { NextRequest, NextResponse } from 'next/server';
import { createAdoptionApplicationHandler } from '@/lib/data-handler';
import type { Character, ApplicationData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { userId, character, applicationData } = await req.json() as { userId: string, character: Character, applicationData: ApplicationData };

    if (!userId || !character || !applicationData) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    
    const newOrder = await createAdoptionApplicationHandler(userId, character, applicationData);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating adoption application' }, { status: 500 });
  }
}
