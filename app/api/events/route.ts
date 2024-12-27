import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: {
        family: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        family: true,
        host: true,
        participants: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("[EVENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, date, familyId, type, details, participants } = body;

    if (!name || !date || !familyId || !type) {
      return new NextResponse(
        "Missing required fields: name, date, familyId, and type are required",
        { status: 400 }
      );
    }

    // Validate the date
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return new NextResponse("Invalid date format", { status: 400 });
    }

    // Get the family member record for the user
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        userId,
        familyId,
      },
    });

    if (!familyMember) {
      return new NextResponse("Not a member of this family", { status: 403 });
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: eventDate,
        familyId,
        hostId: familyMember.id,
        type: type.toUpperCase(),
        details,
        participants: {
          connect: participants?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        family: true,
        host: true,
        participants: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[EVENTS_POST]", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
} 