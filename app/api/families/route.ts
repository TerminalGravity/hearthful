import { currentUser } from "@clerk/nextjs";
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createFamilySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
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

    return NextResponse.json(families);
  } catch (error) {
    console.error("[FAMILIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = createFamilySchema.parse(json);

    const family = await db.family.create({
      data: {
        name: body.name,
        description: body.description,
        members: {
          create: {
            userId: user.id,
            name: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user.username || user.emailAddresses[0].emailAddress,
            email: user.emailAddresses[0].emailAddress,
            role: "ADMIN",
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
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    return new NextResponse("Internal Error", { status: 500 });
  }
}