import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  enjoyment: z.enum(['positive', 'negative']),
  comments: z.string(),
  suggestions: z.string(),
  eventId: z.string(),
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
    const validatedData = feedbackSchema.parse(json);

    // Check if the event exists and the user has access to it
    const event = await db.event.findFirst({
      where: {
        id: validatedData.eventId,
        family: {
          members: {
            some: {
              userId: session.userId,
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      );
    }

    // Check if the user has already provided feedback for this event
    const existingFeedback = await db.feedback.findFirst({
      where: {
        eventId: validatedData.eventId,
        userId: session.userId,
      },
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'You have already provided feedback for this event' },
        { status: 400 }
      );
    }

    const feedback = await db.feedback.create({
      data: {
        ...validatedData,
        userId: session.userId,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
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
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Check if the user has access to the event
    const event = await db.event.findFirst({
      where: {
        id: eventId,
        family: {
          members: {
            some: {
              userId: session.userId,
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      );
    }

    const feedback = await db.feedback.findMany({
      where: {
        eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
} 