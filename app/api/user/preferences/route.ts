import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    let preferences = await db.userPreference.findUnique({
      where: { userId },
      select: {
        displayName: true,
        email: true,
        theme: true,
        language: true,
        emailFrequency: true,
        eventsUpdates: true,
        photosUpdates: true,
        mealsUpdates: true,
        gamesUpdates: true,
      },
    });

    if (!preferences) {
      preferences = await db.userPreference.create({
        data: {
          userId,
          theme: "system",
          language: "en",
          emailFrequency: "daily",
          eventsUpdates: true,
          photosUpdates: true,
          mealsUpdates: true,
          gamesUpdates: true,
        },
        select: {
          displayName: true,
          email: true,
          theme: true,
          language: true,
          emailFrequency: true,
          eventsUpdates: true,
          photosUpdates: true,
          mealsUpdates: true,
          gamesUpdates: true,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const preferences = await db.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...body,
      },
      update: body,
      select: {
        displayName: true,
        email: true,
        theme: true,
        language: true,
        emailFrequency: true,
        eventsUpdates: true,
        photosUpdates: true,
        mealsUpdates: true,
        gamesUpdates: true,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 