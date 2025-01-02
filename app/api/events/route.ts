import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

const headers = {
  'Content-Type': 'application/json',
};

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers }
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
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(events, { headers });
  } catch (error) {
    console.error("[EVENTS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log("[EVENTS_POST] Starting event creation...");
    const { userId } = await auth();
    console.log("[EVENTS_POST] User ID:", userId);
    
    if (!userId) {
      console.log("[EVENTS_POST] Unauthorized - no user ID");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers }
      );
    }

    const body = await req.json();
    console.log("[EVENTS_POST] Request body:", JSON.stringify(body, null, 2));
    
    const { 
      name, 
      description, 
      date, 
      familyId, 
      hostId,
      type,
      participants,
      details 
    } = body;

    // Log required fields
    console.log("[EVENTS_POST] Validating required fields:", {
      name,
      date,
      familyId,
      hostId,
      type,
    });

    if (!name || !date || !familyId || !hostId || !type) {
      const missingFields = [
        !name && "name",
        !date && "date",
        !familyId && "familyId",
        !hostId && "hostId",
        !type && "type",
      ].filter(Boolean);
      
      console.log("[EVENTS_POST] Missing required fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400, headers }
      );
    }

    // Verify user is member of the family
    console.log("[EVENTS_POST] Verifying family membership for user:", userId, "in family:", familyId);
    const membership = await db.familyMember.findFirst({
      where: {
        userId,
        familyId,
      },
    });

    if (!membership) {
      console.log("[EVENTS_POST] User is not a member of the family");
      return NextResponse.json(
        { error: "Not a member of this family" },
        { status: 403, headers }
      );
    }

    // Verify all participants are members of the family
    console.log("[EVENTS_POST] Verifying participants:", participants);
    const validParticipants = await db.familyMember.findMany({
      where: {
        id: {
          in: participants,
        },
        familyId: familyId,
      },
    });

    console.log("[EVENTS_POST] Valid participants found:", validParticipants.length, "out of", participants.length);
    if (validParticipants.length !== participants.length) {
      const invalidParticipants = participants.filter(
        id => !validParticipants.find(vp => vp.id === id)
      );
      console.log("[EVENTS_POST] Invalid participants:", invalidParticipants);
      return NextResponse.json(
        { error: "One or more participants are not members of this family" },
        { status: 400, headers }
      );
    }

    // Create the event
    console.log("[EVENTS_POST] Creating event with data:", {
      name,
      description,
      date: new Date(date),
      type,
      familyId,
      hostId,
      participantCount: participants.length,
    });

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
      },
    });

    console.log("[EVENTS_POST] Event created successfully:", event.id);
    return NextResponse.json(event, { headers });
  } catch (error) {
    console.error("[EVENTS_POST] Error details:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      error,
    });
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log("[EVENTS_POST] Prisma error code:", error.code);
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: "Invalid participant ID" },
          { status: 400, headers }
        );
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: "Invalid family or host ID" },
          { status: 400, headers }
        );
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("[EVENTS_POST] Returning error:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers }
    );
  }
} 