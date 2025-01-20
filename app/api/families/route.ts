import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { validateRequest } from "@/app/middleware/validate";
import { familySchema } from "@/app/lib/validations";
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const headersList = headers();
    const session = await auth({ headers: headersList });
    const userId = session.userId;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const validation = await validateRequest(req, familySchema);
    if (!validation.success) {
      return new NextResponse(validation.error, { status: 400 });
    }

    const { name, description } = validation.data;

    const family = await db.family.create({
      data: {
        name,
        description: description || "",
        members: {
          create: {
            userId,
            role: "ADMIN",
            name: "Admin", // You might want to get this from Clerk
            email: "", // You might want to get this from Clerk
          },
        },
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json(family);
  } catch (error) {
    console.error("[FAMILIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const headersList = headers();
    const session = await auth({ headers: headersList });
    const userId = session.userId;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const families = await db.family.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            events: true,
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