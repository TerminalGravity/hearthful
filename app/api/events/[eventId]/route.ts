import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const eventUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['meal', 'game']).optional(),
  participants: z.array(z.string()).optional(),
  details: z.object({
    mealType: z.string().optional(),
    cuisine: z.string().optional(),
    dietaryNotes: z.string().optional(),
    gameType: z.string().optional(),
    duration: z.number().optional(),
    equipment: z.array(z.string()).optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to continue' },
        { status: 401 }
      );
    }

    const json = await req.json();
    const validatedData = eventUpdateSchema.parse(json);

    const event = await db.event.findUnique({
      where: {
        id: params.eventId,
        userId: session.userId,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const updatedEvent = await db.event.update({
      where: {
        id: params.eventId,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to continue' },
        { status: 401 }
      );
    }

    const event = await db.event.findUnique({
      where: {
        id: params.eventId,
        userId: session.userId,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    await db.event.delete({
      where: {
        id: params.eventId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
} 