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

    const { name, description } = await req.json();

    const album = await db.photoAlbum.create({
      data: {
        name,
        description,
        familyId,
        createdById: userId,
      },
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error('Error creating album:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
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

    const albums = await db.photoAlbum.findMany({
      where: {
        familyId,
      },
      include: {
        photos: true,
        createdBy: true,
      },
    });

    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 