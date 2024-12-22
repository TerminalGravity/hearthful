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

    const { email, role = "MEMBER" } = await req.json();

    // Check if the current user is an admin of the family
    const currentMember = await prisma.familyMember.findFirst({
      where: {
        userId,
        familyId: params.familyId,
        role: "ADMIN",
      },
    });

    if (!currentMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Find the user by email
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if the user is already a member
    const existingMember = await prisma.familyMember.findFirst({
      where: {
        userId: invitedUser.id,
        familyId: params.familyId,
      },
    });

    if (existingMember) {
      return new NextResponse("User is already a member", { status: 400 });
    }

    // Add the user to the family
    const member = await prisma.familyMember.create({
      data: {
        userId: invitedUser.id,
        familyId: params.familyId,
        role,
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
    const currentMember = await prisma.familyMember.findFirst({
      where: {
        userId,
        familyId: params.familyId,
      },
    });

    if (!currentMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const members = await prisma.familyMember.findMany({
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
    const currentMember = await prisma.familyMember.findFirst({
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
    await prisma.familyMember.delete({
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