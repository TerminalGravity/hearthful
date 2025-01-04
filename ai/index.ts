import { OpenAI } from 'openai';
import { AIStream, StreamingTextResponse } from 'ai';
import { handlers } from './handlers';
import { tools } from './tools';
import { systemPrompt } from './prompts';
import { z } from 'zod';

// Create an OpenAI API client (that's edge friendly!)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'edge';

export async function OpenAIMessage(
  messages: any[],
  tools: any[],
  systemPrompt: string
) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      temperature: 0.7,
      stream: true,
      tools: tools,
    });

    // Create a stream from the response
    const stream = AIStream(response, {
      async experimental_onFunctionCall(functionCall) {
        // Get the handler for this function
        const handler = handlers[functionCall.name as keyof typeof handlers];
        if (!handler) {
          throw new Error(`No handler found for function: ${functionCall.name}`);
        }

        // Execute the handler with the provided arguments
        const result = await handler(functionCall.arguments);
        return JSON.stringify(result);
      },
      onFinal(completion) {
        console.log('Stream completed:', completion);
      },
      experimental_streamData: true,
    });

    // Return a streaming response
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

interface Tool<T extends z.ZodType> {
  name: string;
  description: string;
  parameters: T;
  execute: (args: z.infer<T>) => Promise<any>;
}

export function tool<T extends z.ZodType>(
  name: string,
  config: {
    description: string;
    parameters: T;
    execute: (args: z.infer<T>) => Promise<any>;
  }
): Tool<T> {
  return {
    name,
    description: config.description,
    parameters: config.parameters,
    execute: config.execute,
  };
}

export { tools, systemPrompt, handlers }; 