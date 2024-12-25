import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { familyId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user is a member of this family
    const membership = await db.familyMember.findFirst({
      where: {
        familyId: params.familyId,
        userId,
      },
    });

    if (!membership) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get the family with all its details
    const family = await db.family.findUnique({
      where: {
        id: params.familyId,
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            preferences: true,
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

    if (!family) {
      return new NextResponse("Family not found", { status: 404 });
    }

    return NextResponse.json(family);
  } catch (error) {
    console.error("[FAMILY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 