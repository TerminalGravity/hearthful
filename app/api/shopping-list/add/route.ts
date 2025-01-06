import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const addToShoppingListSchema = z.object({
  familyId: z.string(),
  items: z.array(z.object({
    name: z.string(),
    amount: z.string(),
    unit: z.string().optional(),
  })),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { userId } = session;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to continue' },
        { status: 401 }
      );
    }

    const json = await req.json();
    const { familyId, items } = addToShoppingListSchema.parse(json);

    // Verify the user is a member of the family
    const familyMember = await db.familyMember.findFirst({
      where: {
        userId,
        familyId,
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: 'Not a member of this family' },
        { status: 403 }
      );
    }

    // Add items to the shopping list
    const shoppingList = await db.shoppingList.upsert({
      where: {
        familyId,
      },
      create: {
        familyId,
        items: items,
        createdById: userId,
        updatedById: userId,
      },
      update: {
        items: {
          push: items,
        },
        updatedById: userId,
      },
    });

    return NextResponse.json(shoppingList);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to add items to shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to add items to shopping list' },
      { status: 500 }
    );
  }
} 