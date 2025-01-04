import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await auth();
    const { userId } = session;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipeId, date, mealType, servings, notes } = await req.json();

    // Verify the meal plan exists and user has access
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: params.planId,
        family: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found or access denied' },
        { status: 404 }
      );
    }

    // Add the recipe to the meal plan
    const mealPlanRecipe = await prisma.mealPlanRecipe.create({
      data: {
        mealPlanId: params.planId,
        recipeId,
        date: new Date(date),
        mealType,
        servings,
        notes,
      },
      include: {
        recipe: true,
      },
    });

    return NextResponse.json(mealPlanRecipe);
  } catch (error) {
    console.error('Failed to add recipe to meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to add recipe to meal plan' },
      { status: 500 }
    );
  }
} 