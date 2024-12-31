import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const events = await db.event.findMany({
      where: {
        family: {
          members: {
            some: {
              userId: userId,
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
        participants: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            role: true,
          },
        },
        host: {
          select: {
            id: true,
            email: true,
            displayName: true,
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    const { 
      name, 
      description, 
      date, 
      familyId, 
      hostId,
      type,
      participants = [],
      details 
    } = body;

    if (!name || !date || !familyId || !hostId || !type) {
      const missingFields = [
        !name && "name",
        !date && "date",
        !familyId && "familyId",
        !hostId && "hostId",
        !type && "type",
      ].filter(Boolean);
      
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify user is member of the family
    const membership = await db.familyMember.findFirst({
      where: {
        userId,
        familyId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this family" },
        { status: 403 }
      );
    }

    // Verify all participants are members of the family
    const validParticipants = await db.familyMember.findMany({
      where: {
        id: {
          in: participants,
        },
        familyId: familyId,
      },
    });

    if (validParticipants.length !== participants.length) {
      return NextResponse.json(
        { error: "One or more participants are not members of this family" },
        { status: 400 }
      );
    }

    // Create the event
    const event = await db.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        type,
        details,
        familyId,
        hostId,
        participants: {
          connect: participants.map((id: string) => ({ id })),
        },
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        participants: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            role: true,
          },
        },
        host: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: "Invalid participant ID" },
          { status: 400 }
        );
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: "Invalid family or host ID" },
          { status: 400 }
        );
      }
    }

    console.error("[EVENTS_POST]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
} 