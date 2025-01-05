import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-utils';
import { auth } from '@clerk/nextjs';
import { z } from 'zod';

const createAlbumSchema = z.object({
  name: z.string().min(1, 'Album name is required'),
  description: z.string().optional(),
  familyId: z.string().min(1, 'Family ID is required'),
  tags: z.array(z.string()).optional(),
  eventId: z.string().optional(),
  mealId: z.string().optional(),
  gameId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createAlbumSchema.parse(body);

    // Verify user is a member of the family
    const familyMember = await db.familyMember.findFirst({
      where: {
        userId,
        familyId: validatedData.familyId,
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: 'Not a member of this family' },
        { status: 403 }
      );
    }

    // Create the album with relations
    const album = await db.photoAlbum.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        familyId: validatedData.familyId,
        createdById: userId,
        tags: validatedData.tags || [],
        ...(validatedData.eventId && { eventId: validatedData.eventId }),
        ...(validatedData.mealId && { mealId: validatedData.mealId }),
        ...(validatedData.gameId && { gameId: validatedData.gameId }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        meal: {
          select: {
            id: true,
            name: true,
          },
        },
        game: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            photos: true,
          },
        },
      },
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error('Error creating album:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create album' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get('familyId');
    const eventId = searchParams.get('eventId');
    const mealId = searchParams.get('mealId');
    const gameId = searchParams.get('gameId');

    if (!familyId) {
      return NextResponse.json(
        { error: 'Family ID is required' },
        { status: 400 }
      );
    }

    // Verify user is a member of the family
    const familyMember = await db.familyMember.findFirst({
      where: {
        userId,
        familyId,
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: 'Not a member of this family' },
        { status: 403 }
      );
    }

    // Get all albums for the family with optional filters
    const albums = await db.photoAlbum.findMany({
      where: {
        familyId,
        ...(eventId && { eventId }),
        ...(mealId && { mealId }),
        ...(gameId && { gameId }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        meal: {
          select: {
            id: true,
            name: true,
          },
        },
        game: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            photos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
} 