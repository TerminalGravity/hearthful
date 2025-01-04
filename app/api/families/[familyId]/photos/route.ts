import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { uploadToS3 } from '@/lib/s3';

export async function POST(
  req: Request,
  { params }: { params: { familyId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const albumId = formData.get('albumId') as string;

    if (!files || files.length === 0) {
      return new NextResponse("No files provided", { status: 400 });
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

    // Verify album belongs to family
    const album = await db.photoAlbum.findFirst({
      where: {
        id: albumId,
        familyId: params.familyId,
      },
    });

    if (!album) {
      return new NextResponse("Album not found", { status: 404 });
    }

    const uploadedPhotos = await Promise.all(
      files.map(async (file) => {
        const key = `${params.familyId}/${albumId}/${Date.now()}-${file.name}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        await uploadToS3(key, buffer, file.type);

        return db.photo.create({
          data: {
            key,
            url: `https://hearthful-pics.s3.amazonaws.com/${key}`,
            albumId,
            uploadedById: userId,
          },
        });
      })
    );

    return NextResponse.json(uploadedPhotos);
  } catch (error) {
    console.error('[PHOTO_UPLOAD]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 