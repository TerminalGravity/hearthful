import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function GET() {
  try {
    await headers();
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    return NextResponse.json(events);
  } catch (error) {
    console.error("[EVENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await headers();
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, date, familyId } = body;

    if (!name || !date || !familyId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify user is member of the family
    const membership = await db.familyMember.findFirst({
      where: {
        userId,
        familyId,
      },
    });

    if (!membership) {
      return new NextResponse("Not a member of this family", { status: 403 });
    }

    const event = await db.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        hostId: userId,
        familyId,
      },
      include: {
        family: {
          select: {
            name: true,
          },
        },
        participants: true,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[EVENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 