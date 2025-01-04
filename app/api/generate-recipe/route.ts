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

    const { prompt } = await req.json();

    // Use streamText with the OpenAI configuration
    return streamText({
      model: {
        provider: 'openai',
        modelId: 'gpt-4',
        apiKey: process.env.OPENAI_API_KEY!,
      },
      messages: [
        {
          role: 'system',
          content: `You are a professional chef who creates detailed, structured recipes. 
          Always respond with a JSON object that matches this schema:
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
          }`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 1000,
      responseFormat: { type: 'json_object' },
    }).toDataStreamResponse();
  } catch (error) {
    console.error('Failed to generate recipe:', error);
    return NextResponse.json({ error: 'Failed to generate recipe' }, { status: 500 });
  }
} 