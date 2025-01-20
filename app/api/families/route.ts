import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { validateRequest } from "@/app/middleware/validate";
import { familySchema } from "@/app/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const validation = await validateRequest(req, familySchema);
    if (!validation.success) {
      return new NextResponse(validation.error, { status: 400 });
    }

    const { name, description, members } = validation.data;

    const family = await db.family.create({
      data: {
        name,
        description: description || "",
        members: {
          create: [
            {
              userId,
              role: "ADMIN",
              name: members[0].name || "Admin",
              email: members[0].email || "",
              cuisinePreferences: members[0].cuisinePreferences || [],
              dietaryRestrictions: members[0].dietaryRestrictions || [],
              drinkPreferences: members[0].drinkPreferences || [],
              gamePreferences: members[0].gamePreferences || [],
              additionalNotes: members[0].additionalNotes || "",
            },
            ...members.slice(1).map(member => ({
              userId: member.userId || "",
              role: member.role || "MEMBER",
              name: member.name || "",
              email: member.email || "",
              cuisinePreferences: member.cuisinePreferences || [],
              dietaryRestrictions: member.dietaryRestrictions || [],
              drinkPreferences: member.drinkPreferences || [],
              gamePreferences: member.gamePreferences || [],
              additionalNotes: member.additionalNotes || "",
            })),
          ],
        },
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json(family);
  } catch (error) {
    console.error("[FAMILIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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
            userId: true,
            name: true,
            email: true,
            role: true,
            cuisinePreferences: true,
            dietaryRestrictions: true,
            drinkPreferences: true,
            gamePreferences: true,
            additionalNotes: true,
          },
        },
        _count: {
          select: {
            events: true,
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