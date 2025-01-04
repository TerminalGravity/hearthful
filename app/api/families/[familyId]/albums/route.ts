import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: { familyId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description, tags } = await req.json();

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Verify family membership
    const member = await db.familyMember.findFirst({
      where: {
        userId,
        familyId: params.familyId,
      },
    });

    if (!member) {
      return new NextResponse("Not a family member", { status: 403 });
    }

    const album = await db.photoAlbum.create({
      data: {
        title,
        description,
        tags: tags || [],
        familyId: params.familyId,
        createdById: userId,
      },
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error('[ALBUM_CREATE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { familyId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify family membership
    const member = await db.familyMember.findFirst({
      where: {
        userId,
        familyId: params.familyId,
      },
    });

    if (!member) {
      return new NextResponse("Not a family member", { status: 403 });
    }

    const albums = await db.photoAlbum.findMany({
      where: {
        familyId: params.familyId,
      },
      include: {
        photos: {
          where: {
            isCover: true,
          },
          take: 1,
        },
        createdBy: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(albums);
  } catch (error) {
    console.error('[ALBUMS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 