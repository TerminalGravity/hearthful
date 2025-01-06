import { OpenAI } from 'openai';
import { streamText } from 'ai';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { RecipeSchema } from '@/lib/types/recipe';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { userId } = session;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, count = 1 } = await req.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional chef who creates detailed, structured recipes. 
          Generate ${count} unique recipes that match the given requirements.
          Always respond with a JSON array of recipe objects that match this schema:
          {
            "name": "string",
            "description": "string",
            "ingredients": [{ "item": "string", "amount": "string", "unit": "string?" }],
            "instructions": [{ "step": number, "text": "string" }],
            "servings": number,
            "prepTime": number,
            "cookTime": number,
            "dietaryInfo": string[],
            "difficulty": "easy" | "medium" | "hard",
            "cuisine": "string?",
            "calories": number?
          }
          
          Important guidelines:
          1. Each recipe should be unique and creative
          2. Follow all dietary restrictions strictly
          3. Keep prep time within specified limits
          4. Include detailed, step-by-step instructions
          5. List ingredients with precise measurements
          6. Consider cooking difficulty level
          7. Respect cuisine preferences if specified
          8. Include alternative ingredients where appropriate
          9. Add helpful cooking tips in instructions
          10. Ensure recipes are practical and achievable`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const recipesJson = JSON.parse(completion.choices[0].message.content || '[]');
    const recipes = Array.isArray(recipesJson) ? recipesJson : [recipesJson];

    // Validate each recipe against our schema
    const validatedRecipes = recipes.map(recipe => RecipeSchema.parse(recipe));

    return NextResponse.json(validatedRecipes);
  } catch (error) {
    console.error('Failed to generate recipes:', error);
    return NextResponse.json({ error: 'Failed to generate recipes' }, { status: 500 });
  }
} 