import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { z } from 'zod';
import { tool } from '@/ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateEventTool = tool('generateEvent', {
  description: 'Generate a family event based on user input',
  parameters: z.object({
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
  }),
  execute: async ({ type, ...params }) => {
    // Return a structured event object
    return {
      type,
      name: params.name || '',
      description: params.description || '',
      date: params.date || new Date().toISOString(),
      location: params.location || '',
      participants: params.participants || [],
      details: params.details || {},
      tags: params.tags || [],
      autoSave: params.autoSave || false,
    };
  },
});

const tools = [generateEventTool];

export async function POST(req: Request) {
  const { messages, familyId } = await req.json();

  if (!familyId) {
    return new Response('Family ID is required', { status: 400 });
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are an event planning assistant for families. You help create and manage family events like meals and game nights.

When a user asks to create an event:
1. Use the generateEvent tool to create a structured event object
2. Include all relevant details based on the event type (meal or game)
3. Set autoSave to true if the event details are complete

Example events you can help create:
- Family dinners with cuisine preferences and dietary notes
- Game nights with duration and required equipment
- Holiday celebrations with location and participant details

Keep responses friendly and focused on helping families plan enjoyable events together.`,
      },
      ...messages,
    ],
    tools: tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters.shape,
      },
    })),
    tool_choice: 'auto',
  });

  const stream = OpenAIStream(response, {
    async experimental_onToolCall(call) {
      const tool = tools.find((t) => t.name === call.name);
      if (!tool) return 'Tool not found';

      try {
        const result = await tool.execute(call.arguments);
        return JSON.stringify(result);
      } catch (error) {
        console.error(`Error executing tool ${tool.name}:`, error);
        return 'Failed to execute tool';
      }
    },
  });

  return new StreamingTextResponse(stream);
} 