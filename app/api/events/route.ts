import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = auth();
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
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, date, familyId, mealType } = body;

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
        date: new Date(date),
        familyId,
        hostId: familyMember.id,
        type: "MEAL",
        details: {
          mealType,
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
    return new NextResponse("Internal error", { status: 500 });
  }
} 