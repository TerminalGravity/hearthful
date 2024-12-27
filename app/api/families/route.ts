import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const families = await db.family.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
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
        subscription: {
          select: {
            status: true,
            stripeCurrentPeriodEnd: true,
          },
        },
      },
    });

    return NextResponse.json(families);
  } catch (error) {
    if (error instanceof Error) {
      console.error("[FAMILIES_GET]", error.message);
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const family = await db.family.create({
      data: {
        name,
        members: {
          create: {
            userId: user.id,
            role: "ADMIN",
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
      },
    });

    return NextResponse.json(family);
  } catch (error) {
    if (error instanceof Error) {
      console.error("[FAMILIES_POST]", error.message);
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
} 