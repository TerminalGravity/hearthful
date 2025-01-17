import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const { userId } = await auth();
    const familyId = params.familyId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify user is member of family
    const familyMember = await db.familyMember.findFirst({
      where: {
        userId,
        familyId,
      },
    });

    if (!familyMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const albumId = formData.get('albumId') as string | null;

    const photos = await Promise.all(
      files.map(async (file) => {
        // Handle file upload logic here
        // For now, just store the file name
        return await db.photo.create({
          data: {
            url: file.name, // Replace with actual uploaded URL
            userId,
            familyId,
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