import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { headers } from 'next/headers';

const eventSchema = z.object({
  name: z.string(),
  description: z.string(),
  date: z.string(),
  location: z.string(),
  type: z.enum(['meal', 'game', 'other']),
  participants: z.array(z.string()),
  mealId: z.string().optional(),
  gameId: z.string().optional(),
  tags: z.array(z.string()),
  familyId: z.string(),
  hostId: z.string(),
});

export async function POST(req: Request) {
  try {
    const headersList = headers();
    const session = await auth({ headers: headersList });
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to continue' },
        { status: 401 }
      );
    }

    let json;
    try {
      const body = await req.text();
      json = JSON.parse(body);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    try {
      const validatedData = eventSchema.parse(json);

      // Verify the user is a member of the family
      const familyMember = await db.familyMember.findFirst({
        where: {
          userId: session.userId,
          familyId: validatedData.familyId,
        },
      });

      if (!familyMember) {
        return NextResponse.json(
          { error: 'Not a member of this family' },
          { status: 403 }
        );
      }

      // Create the event
      const event = await db.event.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          date: new Date(validatedData.date),
          location: validatedData.location,
          type: validatedData.type,
          details: {},
          tags: validatedData.tags,
          familyId: validatedData.familyId,
          userId: session.userId,
          hostId: validatedData.hostId,
          participants: [], // We'll connect participants through the relation
          familyMembers: {
            connect: validatedData.participants.map(id => ({ id })),
          },
          ...(validatedData.mealId ? {
            meals: {
              connect: { id: validatedData.mealId }
            }
          } : {}),
          ...(validatedData.gameId ? {
            games: {
              connect: { id: validatedData.gameId }
            }
          } : {}),
        },
        include: {
          familyMembers: true,
          host: true,
          family: true,
          meals: true,
          games: true,
        },
      });

      return NextResponse.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid event data', details: error.errors },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Database error', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const headersList = headers();
    const session = await auth({ headers: headersList });
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
      include: {
        meals: true,
        games: true,
        familyMembers: true,
        host: true,
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