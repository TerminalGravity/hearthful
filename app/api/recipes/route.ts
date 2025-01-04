import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const {
      name,
      description,
      ingredients,
      instructions,
      servings,
      prepTime,
      cookTime,
      dietaryInfo,
      familyId,
    } = await req.json();

    const recipe = await prisma.recipe.create({
      data: {
        name,
        description,
        ingredients,
        instructions,
        servings,
        prepTime,
        cookTime,
        dietaryInfo,
        createdBy: userId,
        familyId,
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Failed to create recipe:', error);
    return new Response('Failed to create recipe', { status: 500 });
  }
}

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get('familyId');

    if (!familyId) {
      return new Response('Family ID is required', { status: 400 });
    }

    const recipes = await prisma.recipe.findMany({
      where: {
        familyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return new Response('Failed to fetch recipes', { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const {
      id,
      name,
      description,
      ingredients,
      instructions,
      servings,
      prepTime,
      cookTime,
      dietaryInfo,
    } = await req.json();

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        name,
        description,
        ingredients,
        instructions,
        servings,
        prepTime,
        cookTime,
        dietaryInfo,
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Failed to update recipe:', error);
    return new Response('Failed to update recipe', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response('Recipe ID is required', { status: 400 });
    }

    await prisma.recipe.delete({
      where: { id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    return new Response('Failed to delete recipe', { status: 500 });
  }
} 