import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadToS3, getSignedFileUrl } from "@/lib/s3";

export async function POST(
  req: Request,
  { params }: { params: { familyId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user is a member of the family
    const member = await prisma.familyMember.findFirst({
      where: {
        userId,
        familyId: params.familyId,
      },
    });

    if (!member) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tags = JSON.parse(formData.get("tags") as string) as string[];
    const files = formData.getAll("photos") as File[];

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    if (!files.length) {
      return new NextResponse("At least one photo is required", { status: 400 });
    }

    // Upload photos to S3 and create album
    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const key = await uploadToS3(buffer, file.name, file.type);
      const url = await getSignedFileUrl(key);
      return { key, url };
    });

    const uploadedPhotos = await Promise.all(uploadPromises);

    // Create album in database
    const album = await prisma.photoAlbum.create({
      data: {
        title,
        description,
        tags,
        familyId: params.familyId,
        createdById: userId,
        photos: {
          create: uploadedPhotos.map((photo, index) => ({
            key: photo.key,
            url: photo.url,
            isCover: index === 0, // First photo is the cover
            uploadedById: userId,
          })),
        },
      },
      include: {
        photos: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error("[PHOTO_ALBUM_CREATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
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

    // Check if the user is a member of the family
    const member = await prisma.familyMember.findFirst({
      where: {
        userId,
        familyId: params.familyId,
      },
    });

    if (!member) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const albums = await prisma.photoAlbum.findMany({
      where: {
        familyId: params.familyId,
      },
      include: {
        photos: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(albums);
  } catch (error) {
    console.error("[PHOTO_ALBUMS_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 