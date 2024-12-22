import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { uploadToS3, deleteFromS3, getSignedFileUrl } from "@/lib/s3";

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const caption = formData.get("caption") as string;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const key = await uploadToS3(buffer, file.name, file.type);

    // Get signed URL for the uploaded file
    const url = await getSignedFileUrl(key);

    // TODO: Save photo metadata to database
    // Store: eventId, userId, key, caption, url, timestamp

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("[PHOTO_UPLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // TODO: Get photos from database
    // For each photo, generate a signed URL

    const photos = [
      // Example data
      {
        id: "1",
        url: "https://example.com/photo1.jpg",
        caption: "Family dinner",
        uploadedBy: "John Doe",
        timestamp: new Date().toISOString(),
      },
    ];

    return NextResponse.json(photos);
  } catch (error) {
    console.error("[GET_PHOTOS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { photoId } = await request.json();

    if (!photoId) {
      return new NextResponse("No photo ID provided", { status: 400 });
    }

    // TODO: Get photo key from database
    const key = "example-key";

    // Delete from S3
    await deleteFromS3(key);

    // TODO: Delete photo metadata from database

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE_PHOTO_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 