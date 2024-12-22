import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!description) {
      return new NextResponse("Description is required", { status: 400 });
    }

    // Create the family in your database
    const family = await db.family.create({
      data: {
        name,
        description,
        createdById: userId,
        members: {
          create: {
            userId,
            role: "ADMIN",
          },
        },
      },
    });

    return NextResponse.json(family);
  } catch (error) {
    console.error("[FAMILIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const families = await prisma.family.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
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
            events: true,
            meals: true,
            games: true,
          },
        },
      },
    });

    return NextResponse.json(families);
  } catch (error) {
    console.error("[FAMILIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 