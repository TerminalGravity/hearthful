import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
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

    const { name, email, role = "MEMBER", dietaryRestrictions = [], gamePreferences = [], notes = "" } = await req.json();

    if (!name || !email) {
      return new NextResponse("Name and email are required", { status: 400 });
    }

    // Check if the current user is an admin of the family
    const currentMember = await db.familyMember.findFirst({
      where: {
        userId,
        familyId: params.familyId,
        role: "ADMIN",
      },
    });

    if (!currentMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Check if the user is already a member
    const existingMember = await db.familyMember.findFirst({
      where: {
        email,
        familyId: params.familyId,
      },
    });

    if (existingMember) {
      return new NextResponse("User is already a member", { status: 400 });
    }

    // Add the member to the family
    const member = await db.familyMember.create({
      data: {
        userId: "", // This will be updated when the user signs up
        name,
        email,
        familyId: params.familyId,
        role,
        preferences: {
          dietaryRestrictions,
          gamePreferences,
          notes
        },
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("[FAMILY_MEMBERS_POST]", error);
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
    const currentMember = await db.familyMember.findFirst({
      where: {
        userId,
        familyId: params.familyId,
      },
    });

    if (!currentMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const members = await db.familyMember.findMany({
      where: {
        familyId: params.familyId,
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

    return NextResponse.json(members);
  } catch (error) {
    console.error("[FAMILY_MEMBERS_GET]", error);
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

    const { memberId } = await req.json();

    // Check if the current user is an admin of the family
    const currentMember = await db.familyMember.findFirst({
      where: {
        userId,
        familyId: params.familyId,
        role: "ADMIN",
      },
    });

    if (!currentMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Delete the member
    await db.familyMember.delete({
      where: {
        id: memberId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[FAMILY_MEMBERS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 