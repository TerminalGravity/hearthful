import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        displayName: true,
        email: true,
        preferences: true,
      },
    });

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    if (error instanceof Error) {
      console.error("[PREFERENCES_GET]", error.message);
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        displayName: body.displayName,
        email: body.email,
        preferences: {
          theme: body.theme,
          language: body.language,
          emailFrequency: body.emailFrequency,
          eventsUpdates: body.eventsUpdates,
          photosUpdates: body.photosUpdates,
          mealsUpdates: body.mealsUpdates,
          gamesUpdates: body.gamesUpdates,
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof Error) {
      console.error("[PREFERENCES_PUT]", error.message);
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
} 