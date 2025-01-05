import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { uploadToS3 } from '@/lib/s3-utils';
import { db } from '@/lib/db-utils';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const albumId = formData.get('albumId') as string;
    const familyId = formData.get('familyId') as string;
    const caption = formData.get('caption') as string;

    if (!files.length || !familyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user belongs to the family
    const familyMember = await db.familyMember.findFirst({
      where: {
        userId,
        familyId,
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: 'User does not belong to this family' },
        { status: 403 }
      );
    }

    // If albumId is provided, verify it belongs to the family
    if (albumId) {
      const album = await db.photoAlbum.findFirst({
        where: {
          id: albumId,
          familyId,
        },
      });

      if (!album) {
        return NextResponse.json(
          { error: 'Album not found or does not belong to this family' },
          { status: 404 }
        );
      }
    }

    // Upload photos and create records
    const photos = await Promise.all(
      files.map(async (file) => {
        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        const { key, url } = await uploadToS3(buffer, file.name, file.type);

        // Create photo record in database
        return await db.photo.create({
          data: {
            url,
            caption,
            userId,
            albumId: albumId || null,
          },
          include: {
            album: {
              include: {
                family: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            user: {
              select: {
                name: true,
              },
            },
          },
        });
      })
    );

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
} 