import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all families where the user is a member
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
            role: true,
            preferences: true,
          },
        },
        events: {
          where: {
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
          take: 3,
          select: {
            id: true,
            title: true,
            startTime: true,
            description: true,
          },
        },
        meals: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 2,
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            members: true,
            events: true,
            meals: true,
            games: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
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
    const { userId } = auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, members } = body;

    // Use a transaction to ensure all operations succeed or fail together
    const result = await db.$transaction(async (tx) => {
      // Create the family
      const family = await tx.family.create({
        data: {
          name,
          description,
        },
      });

      // Create the admin member
      await tx.familyMember.create({
        data: {
          userId,
          familyId: family.id,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user.emailAddresses[0].emailAddress.split('@')[0],
          email: user.emailAddresses[0].emailAddress,
          role: "ADMIN",
        },
      });

      // Create other members sequentially to avoid connection pool issues
      for (const member of members) {
        await tx.familyMember.create({
          data: {
            familyId: family.id,
            userId: member.email, // Using email as temporary userId for pending members
            name: member.name,
            email: member.email,
            role: "MEMBER",
            preferences: {
              dietaryRestrictions: member.dietaryRestrictions || [],
              gamePreferences: member.gamePreferences || { preferredGames: [] },
            },
          },
        });
      }

      // Return the complete family data
      return tx.family.findUnique({
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
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[FAMILIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 