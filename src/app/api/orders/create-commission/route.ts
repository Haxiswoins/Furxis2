import { NextRequest, NextResponse } from 'next/server';
import { createCommissionApplicationHandler } from '@/lib/data-handler';
import type { CommissionStyle, ApplicationData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { userId, commissionStyle, applicationData } = await req.json() as { userId: string, commissionStyle: CommissionStyle, applicationData: ApplicationData };

     if (!userId || !commissionStyle || !applicationData) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newOrder = await createCommissionApplicationHandler(userId, commissionStyle, applicationData);
    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
     console.error(error);
    return NextResponse.json({ message: 'Error creating commission application' }, { status: 500 });
  }
}
