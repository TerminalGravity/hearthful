import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs';
import { z } from 'zod';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set runtime to edge for best performance
export const runtime = 'edge';

const eventSchema = z.object({
  type: z.enum(['meal', 'game']),
  name: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  participants: z.array(z.string()).optional(),
  details: z.object({
    mealType: z.string().optional(),
    cuisine: z.string().optional(),
    dietaryNotes: z.string().optional(),
    gameType: z.string().optional(),
    duration: z.number().optional(),
    equipment: z.array(z.string()).optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  autoSave: z.boolean().optional(),
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, familyId } = await req.json();

  if (!familyId) {
    return new Response('Family ID is required', { status: 400 });
  }

  // Ask OpenAI for a streaming chat completion
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are an event planning assistant for families. You help create and manage family events like meals and game nights.

When a user asks to create an event:
1. Include all relevant details based on the event type (meal or game)
2. Set autoSave to true if the event details are complete

Example events you can help create:
- Family dinners with cuisine preferences and dietary notes
- Game nights with duration and required equipment
- Holiday celebrations with location and participant details

Keep responses friendly and focused on helping families plan enjoyable events together.`,
      },
      ...messages,
    ],
    functions: [
      {
        name: 'generateEvent',
        description: 'Generate a family event based on user input',
        parameters: eventSchema.shape,
      },
    ],
    function_call: 'auto',
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {
    async experimental_onFunctionCall(functionCall) {
      if (functionCall.name === 'generateEvent') {
        // Parse and validate the function arguments
        const parsedArgs = eventSchema.safeParse(functionCall.arguments);
        if (!parsedArgs.success) {
          return 'Invalid event data provided';
        }

        // Here you would typically save the event to your database
        // For now, we'll just return the validated event data
        return JSON.stringify(parsedArgs.data);
      }
      return 'Unknown function called';
    },
  });

  // Respond with the stream
  return new StreamingTextResponse(stream);
} 