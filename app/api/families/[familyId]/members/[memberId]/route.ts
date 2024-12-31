import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { familyId: string; memberId: string } }
) {
  try {
    const { familyId, memberId } = await Promise.resolve(params);
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user is an admin of this family
    const adminMembership = await db.familyMember.findFirst({
      where: {
        userId,
        familyId,
        role: "ADMIN",
      },
    });

    if (!adminMembership) {
      return new NextResponse("Not authorized to update member roles", { status: 403 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !["ADMIN", "MEMBER"].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    // Update the member's role
    const updatedMember = await db.familyMember.update({
      where: {
        id: memberId,
        familyId,
      },
      data: {
        role,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("[MEMBER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { familyId: string; memberId: string } }
) {
  try {
    const { familyId, memberId } = await Promise.resolve(params);
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user is an admin of this family
    const adminMembership = await db.familyMember.findFirst({
      where: {
        userId,
        familyId,
        role: "ADMIN",
      },
    });

    if (!adminMembership) {
      return new NextResponse("Not authorized to remove members", { status: 403 });
    }

    // Check if trying to remove the last admin
    const member = await db.familyMember.findUnique({
      where: {
        id: memberId,
      },
    });

    if (member?.role === "ADMIN") {
      const adminCount = await db.familyMember.count({
        where: {
          familyId,
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        return new NextResponse("Cannot remove the last admin", { status: 400 });
      }
    }

    // Remove the member
    await db.familyMember.delete({
      where: {
        id: memberId,
        familyId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[MEMBER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 