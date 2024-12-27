import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const events = await db.event.findMany({
      where: {
        family: {
          members: {
            some: {
              userId: session.userId,
            },
          },
        },
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        host: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        participants: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Return empty array if no events found
    if (!events) {
      return NextResponse.json([]);
    }

    // Transform dates to ISO strings to ensure proper JSON serialization
    const sanitizedEvents = events.map(event => ({
      ...event,
      date: event.date.toISOString(),
      createdAt: event.createdAt?.toISOString(),
      updatedAt: event.updatedAt?.toISOString(),
    }));

    return NextResponse.json(sanitizedEvents);
  } catch (error) {
    console.error("[EVENTS_GET]", error instanceof Error ? error.message : "Unknown error");
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, date, familyId, type, details, participants, hostId } = body;

    if (!name || !date || !familyId || !type || !hostId) {
      return new NextResponse(
        "Missing required fields: name, date, familyId, type, and hostId are required",
        { status: 400 }
      );
    }

    // Validate the date
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return new NextResponse("Invalid date format", { status: 400 });
    }

    // Get the family member record for the user to verify membership
    const familyMember = await db.familyMember.findFirst({
      where: {
        userId: session.userId,
        familyId,
      },
    });

    if (!familyMember) {
      return new NextResponse("Not a member of this family", { status: 403 });
    }

    // Create the event
    const event = await db.event.create({
      data: {
        name,
        description: description || "",
        date: eventDate,
        type: type.toUpperCase(),
        details,
        family: {
          connect: { id: familyId }
        },
        host: {
          connect: { id: hostId }
        },
        participants: participants?.length ? {
          connect: participants.map(id => ({ id }))
        } : undefined
      },
      include: {
        family: {
          select: {
            id: true,
            name: true
          }
        },
        host: true,
        participants: true,
      }
    });

    // Transform dates for JSON serialization
    const sanitizedEvent = {
      ...event,
      date: event.date.toISOString(),
      createdAt: event.createdAt?.toISOString(),
      updatedAt: event.updatedAt?.toISOString(),
    };

    return NextResponse.json(sanitizedEvent);
  } catch (error) {
    console.error("[EVENTS_POST]", error instanceof Error ? error.message : "Unknown error");
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error", 
      { status: 500 }
    );
  }
} 