import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const { familyId } = await Promise.resolve(params);
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user is a member of this family
    const membership = await db.familyMember.findFirst({
      where: {
        userId,
        familyId,
      },
    });

    if (!membership) {
      return new NextResponse("Not a member of this family", { status: 403 });
    }

    const family = await db.family.findUnique({
      where: {
        id: familyId,
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

    if (!family) {
      return new NextResponse("Family not found", { status: 404 });
    }

    return NextResponse.json(family);
  } catch (error) {
    console.error("[FAMILY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const { familyId } = await Promise.resolve(params);
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user is an admin of this family
    const membership = await db.familyMember.findFirst({
      where: {
        userId,
        familyId,
        role: "ADMIN",
      },
    });

    if (!membership) {
      return new NextResponse("Not authorized to delete this family", { status: 403 });
    }

    // Delete the family and all related data
    await db.family.delete({
      where: {
        id: familyId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[FAMILY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 