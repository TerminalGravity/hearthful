import { z } from 'zod';

export const RecipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  ingredients: z.array(z.object({
    item: z.string(),
    amount: z.string(),
    unit: z.string().optional(),
  })),
  instructions: z.array(z.object({
    step: z.number(),
    text: z.string(),
  })),
  servings: z.number(),
  prepTime: z.number(),
  cookTime: z.number(),
  dietaryInfo: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  cuisine: z.string().optional(),
  calories: z.number().optional(),
  autoSave: z.boolean().optional(),
});

export const tools = [
  {
    type: 'function',
    function: {
      name: 'generateRecipe',
      description: 'Generate a detailed recipe based on user preferences and requirements',
      parameters: {
        type: 'object',
        required: ['type'],
        properties: {
          type: {
            type: 'string',
            description: 'The type or name of recipe to generate',
          },
          dietary: {
            type: 'array',
            items: { type: 'string' },
            description: 'Dietary restrictions or preferences',
          },
          servings: {
            type: 'number',
            description: 'Number of servings',
          },
          cuisine: {
            type: 'string',
            description: 'Preferred cuisine type',
          },
          difficulty: {
            type: 'string',
            enum: ['easy', 'medium', 'hard'],
            description: 'Desired difficulty level',
          },
          maxTime: {
            type: 'number',
            description: 'Maximum total cooking time in minutes',
          },
          autoSave: {
            type: 'boolean',
            description: 'Whether to automatically save the recipe',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'planMeal',
      description: 'Plan meals for a specific timeframe',
      parameters: {
        type: 'object',
        required: ['days', 'mealsPerDay'],
        properties: {
          days: {
            type: 'number',
            description: 'Number of days to plan for',
          },
          mealsPerDay: {
            type: 'number',
            description: 'Number of meals per day',
          },
          dietary: {
            type: 'array',
            items: { type: 'string' },
            description: 'Dietary restrictions',
          },
          preferences: {
            type: 'array',
            items: { type: 'string' },
            description: 'Food preferences',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generateShoppingList',
      description: 'Generate a shopping list based on recipes or meal plans',
      parameters: {
        type: 'object',
        required: ['recipes'],
        properties: {
          recipes: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of recipe names to include',
          },
          servings: {
            type: 'number',
            description: 'Number of servings to adjust for',
          },
          additionalItems: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional items to include',
          },
        },
      },
    },
  },
]; 