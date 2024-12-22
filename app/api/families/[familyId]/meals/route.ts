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

    const { name, description, ingredients, instructions, category } = await req.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const meal = await prisma.meal.create({
      data: {
        name,
        description,
        ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split('\n').filter(Boolean),
        instructions,
        category,
        familyId: params.familyId,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(meal);
  } catch (error) {
    console.error("[MEALS_POST]", error);
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

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const meals = await prisma.meal.findMany({
      where: {
        familyId: params.familyId,
        ...(category && { category }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error("[MEALS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 