import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const preferences = await db.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences if they don't exist
      const defaultPreferences = await db.userPreference.create({
        data: { userId },
      });
      return NextResponse.json(defaultPreferences);
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
    const { theme, language, emailFrequency, notifications } = body;

    const preferences = await db.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        theme,
        language,
        emailFrequency,
        notifications,
      },
      update: {
        theme,
        language,
        emailFrequency,
        notifications,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 