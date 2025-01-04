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
});

export type GeneratedRecipe = z.infer<typeof RecipeSchema>; 