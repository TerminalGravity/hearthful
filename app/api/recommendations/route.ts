import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import OpenAI from "openai";


/// implement structured outputs for AI responses
/// research using AI components for next.js ... function calling / tool usage to CRUD database
/// 

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { familyId, type } = await req.json();

    if (!familyId || !type || !["meal", "game"].includes(type)) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    // Get family's past choices
    const pastChoices = type === "meal"
      ? await prisma.meal.findMany({
          where: { familyId },
          select: {
            name: true,
            category: true,
            ingredients: true,
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        })
      : await prisma.game.findMany({
          where: { familyId },
          select: {
            name: true,
            category: true,
            minPlayers: true,
            maxPlayers: true,
            ageRange: true,
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        });

    // Prepare prompt for OpenAI
    const prompt = type === "meal"
      ? `Based on the following user preferences and past meal choices, suggest 3 new meals that this family might enjoy.
         User Preferences: ${JSON.stringify(user?.preferences || {})}
         Past Meals: ${JSON.stringify(pastChoices)}
         
         Please provide recommendations in the following JSON format:
         {
           "recommendations": [
             {
               "name": "Meal Name",
               "description": "Brief description",
               "category": "Cuisine type",
               "ingredients": ["ingredient1", "ingredient2"],
               "reasoning": "Why this meal was recommended"
             }
           ]
         }`
      : `Based on the following user preferences and past game choices, suggest 3 new games that this family might enjoy.
         User Preferences: ${JSON.stringify(user?.preferences || {})}
         Past Games: ${JSON.stringify(pastChoices)}
         
         Please provide recommendations in the following JSON format:
         {
           "recommendations": [
             {
               "name": "Game Name",
               "description": "Brief description",
               "category": "Game type",
               "minPlayers": 2,
               "maxPlayers": 6,
               "ageRange": "8+",
               "reasoning": "Why this game was recommended"
             }
           ]
         }`;

    // Get recommendations from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides personalized recommendations for family activities.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const recommendations = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("[RECOMMENDATIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 