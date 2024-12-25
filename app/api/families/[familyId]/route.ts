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

export async function PATCH(
  req: Request,
  { params }: { params: { familyId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user is an admin of this family
    const membership = await db.familyMember.findFirst({
      where: {
        familyId: params.familyId,
        userId,
        role: "ADMIN",
      },
    });

    if (!membership) {
      return new NextResponse("Forbidden - Only admins can update families", { status: 403 });
    }

    const body = await req.json();
    const { name, description } = body;

    // Update the family
    const updatedFamily = await db.family.update({
      where: {
        id: params.familyId,
      },
      data: {
        name,
        description,
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

    return NextResponse.json(updatedFamily);
  } catch (error) {
    console.error("[FAMILY_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { familyId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user is an admin of this family
    const membership = await db.familyMember.findFirst({
      where: {
        familyId: params.familyId,
        userId,
        role: "ADMIN",
      },
    });

    if (!membership) {
      return new NextResponse("Forbidden - Only admins can delete families", { status: 403 });
    }

    // Delete the family and all related data
    await db.family.delete({
      where: {
        id: params.familyId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[FAMILY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 