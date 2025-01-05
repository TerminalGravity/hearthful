import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db-utils";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const albumId = formData.get('albumId') as string | null;

    if (!files || files.length === 0) {
      return new NextResponse("No files provided", { status: 400 });
    }

    // If albumId is provided, verify it exists and user has access
    if (albumId) {
      const album = await db.photoAlbum.findFirst({
        where: {
          id: albumId,
          family: {
            members: {
              some: {
                userId,
              },
            },
          },
        },
      });

      if (!album) {
        return new NextResponse("Album not found or access denied", { status: 403 });
      }
    }

    // Process each file
    const photos = await Promise.all(
      files.map(async (file) => {
        // TODO: Implement actual file upload to cloud storage
        // For now, just store the file name
        return await db.photo.create({
          data: {
            url: file.name, // Replace with actual uploaded URL
            userId,
            albumId: albumId || undefined,
          },
        });
      })
    );

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error uploading photos:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 