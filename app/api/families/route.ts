import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.userId;
    
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
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: "asc",
          },
          take: 3,
          select: {
            id: true,
            name: true,
            date: true,
            description: true,
          },
        },
        meals: {
          orderBy: {
            createdAt: "desc",
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
        createdAt: "desc",
      },
    });

    return NextResponse.json(families);
  } catch (error) {
    console.error("[FAMILIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;
    const user = await currentUser();
    
    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, members } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Create the family and its members in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the family
      const family = await tx.family.create({
        data: {
          name,
          description: description || "",
        },
      });

      // Create the admin member (current user)
      await tx.familyMember.create({
        data: {
          familyId: family.id,
          userId: userId,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user.emailAddresses[0].emailAddress.split('@')[0],
          email: user.emailAddresses[0].emailAddress,
          role: "ADMIN",
          preferences: members.find(m => m.email === user.emailAddresses[0].emailAddress)?.preferences || {},
        },
      });

      // Create other members
      if (members?.length) {
        await Promise.all(
          members
            .filter(m => m.email !== user.emailAddresses[0].emailAddress)
            .map(async (member) => {
              return tx.familyMember.create({
                data: {
                  familyId: family.id,
                  userId: member.email,
                  name: member.name,
                  email: member.email,
                  role: "MEMBER",
                  preferences: member.preferences || {},
                },
              });
            })
        );
      }

      return family;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[FAMILIES_POST]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error", 
      { status: 500 }
    );
  }
} 