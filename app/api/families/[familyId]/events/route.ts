import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { familyId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user is a member of the family
    const member = await prisma.familyMember.findFirst({
      where: {
        userId,
        familyId: params.familyId,
      },
    });

    if (!member) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { title, description, startTime, endTime, location } = await req.json();

    if (!title || !startTime) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location,
        familyId: params.familyId,
        hostId: userId,
      },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[EVENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { familyId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user is a member of the family
    const member = await prisma.familyMember.findFirst({
      where: {
        userId,
        familyId: params.familyId,
      },
    });

    if (!member) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const events = await prisma.event.findMany({
      where: {
        familyId: params.familyId,
      },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            meals: true,
            games: true,
            photos: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("[EVENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 