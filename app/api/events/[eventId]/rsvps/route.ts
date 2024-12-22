import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await req.json();

    if (!status || !["YES", "NO", "MAYBE"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    // Check if the event exists and get the familyId
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      select: { familyId: true },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Check if the user is a member of the family
    const member = await prisma.familyMember.findFirst({
      where: {
        userId,
        familyId: event.familyId,
      },
    });

    if (!member) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Create or update RSVP
    const rsvp = await prisma.rSVP.upsert({
      where: {
        userId_eventId: {
          userId,
          eventId: params.eventId,
        },
      },
      update: {
        status,
      },
      create: {
        userId,
        eventId: params.eventId,
        status,
      },
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
    });

    return NextResponse.json(rsvp);
  } catch (error) {
    console.error("[RSVP_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the event exists and get the familyId
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      select: { familyId: true },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Check if the user is a member of the family
    const member = await prisma.familyMember.findFirst({
      where: {
        userId,
        familyId: event.familyId,
      },
    });

    if (!member) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const rsvps = await prisma.rSVP.findMany({
      where: {
        eventId: params.eventId,
      },
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
    });

    return NextResponse.json(rsvps);
  } catch (error) {
    console.error("[RSVP_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 