import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, members } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!description) {
      return new NextResponse("Description is required", { status: 400 });
    }

    // First create the family
    const family = await db.family.create({
      data: {
        name,
        description,
      },
    });

    // Then create all family members
    const familyMembers = await Promise.all([
      // Add the current user as admin
      db.familyMember.create({
        data: {
          userId,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user.emailAddresses[0].emailAddress.split('@')[0],
          email: user.emailAddresses[0].emailAddress,
          familyId: family.id,
          role: "ADMIN",
        },
      }),
      // Add other members
      ...members.map((member: any) =>
        db.familyMember.create({
          data: {
            userId: member.email, // Using email as userId for pending members
            name: member.name,
            email: member.email,
            familyId: family.id,
            role: "MEMBER",
            preferences: {
              dietaryRestrictions: member.dietaryRestrictions || [],
              gamePreferences: member.gamePreferences || { preferredGames: [] },
            },
          },
        })
      ),
    ]);

    // Return the family with its members
    const familyWithMembers = await db.family.findUnique({
      where: { id: family.id },
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
      },
    });

    return NextResponse.json(familyWithMembers);
  } catch (error) {
    console.error("[FAMILIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all families where the current user is a member
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

    return NextResponse.json(families);
  } catch (error) {
    console.error("[FAMILIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 