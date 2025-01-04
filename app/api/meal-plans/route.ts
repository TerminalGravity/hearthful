import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { userId } = session;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startDate, endDate, familyId, recipes } = await req.json();

    // Create the meal plan
    const mealPlan = await prisma.mealPlan.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdBy: userId,
        familyId,
      },
    });

    // Add recipes to the meal plan
    if (recipes && recipes.length > 0) {
      await prisma.mealPlanRecipe.createMany({
        data: recipes.map((recipe: any) => ({
          mealPlanId: mealPlan.id,
          recipeId: recipe.recipeId,
          date: new Date(recipe.date),
          mealType: recipe.mealType,
          servings: recipe.servings,
          notes: recipe.notes,
        })),
      });
    }

    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error('Failed to create meal plan:', error);
    return NextResponse.json({ error: 'Failed to create meal plan' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { userId } = session;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get('familyId');

    if (!familyId) {
      return NextResponse.json({ error: 'Family ID is required' }, { status: 400 });
    }

    // Verify user is member of the family
    const membership = await prisma.familyMember.findFirst({
      where: {
        userId,
        familyId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this family' }, { status: 403 });
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where: {
        familyId,
      },
      include: {
        recipes: {
          include: {
            recipe: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(mealPlans);
  } catch (error) {
    console.error('Failed to fetch meal plans:', error);
    return NextResponse.json({ error: 'Failed to fetch meal plans' }, { status: 500 });
  }
} 