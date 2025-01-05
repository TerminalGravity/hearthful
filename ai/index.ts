import { z } from 'zod';

export type Tool<T extends z.ZodType> = {
  name: string;
  description: string;
  parameters: T;
  execute: (args: z.infer<T>) => Promise<any>;
};

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

export function createMessage(role: 'user' | 'assistant' | 'system', content: string) {
  return { role, content };
}

export const createSystemMessage = (content: string) => createMessage('system', content);
export const createUserMessage = (content: string) => createMessage('user', content);
export const createAssistantMessage = (content: string) => createMessage('assistant', content); 