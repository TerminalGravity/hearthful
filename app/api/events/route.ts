import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const eventSchema = z.object({
  name: z.string(),
  description: z.string(),
  date: z.string(),
  location: z.string(),
  type: z.enum(['meal', 'game']),
  participants: z.array(z.string()),
  details: z.object({
    mealType: z.string().optional(),
    cuisine: z.string().optional(),
    dietaryNotes: z.string().optional(),
    gameType: z.string().optional(),
    duration: z.number().optional(),
    equipment: z.array(z.string()).optional(),
  }),
  tags: z.array(z.string()),
  familyId: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to continue' },
        { status: 401 }
      );
    }

    const json = await req.json();
    const validatedData = eventSchema.parse(json);

    const event = await db.event.create({
      data: {
        ...validatedData,
        userId: session.userId,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to continue' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get('familyId');

    if (!familyId) {
      return NextResponse.json(
        { error: 'Family ID is required' },
        { status: 400 }
      );
    }

    const events = await db.event.findMany({
      where: {
        familyId,
        userId: session.userId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
} 