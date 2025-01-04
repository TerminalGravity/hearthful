import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Recipe = {
  id: string;
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  dietaryInfo: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  familyId: string;
};

type CreateRecipeInput = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
type UpdateRecipeInput = Partial<Omit<Recipe, 'createdAt' | 'updatedAt' | 'createdBy' | 'familyId'>>;

export function useRecipes(familyId: string) {
  const queryClient = useQueryClient();

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes', familyId],
    queryFn: async () => {
      const response = await fetch(`/api/recipes?familyId=${familyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      return response.json();
    },
  });

  const createRecipe = useMutation({
    mutationFn: async (recipe: CreateRecipeInput) => {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        throw new Error('Failed to create recipe');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', familyId] });
    },
  });

  const updateRecipe = useMutation({
    mutationFn: async ({ id, ...data }: UpdateRecipeInput & { id: string }) => {
      const response = await fetch('/api/recipes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      });

      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', familyId] });
    },
  });

  const deleteRecipe = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/recipes?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', familyId] });
    },
  });

  return {
    recipes,
    isLoading,
    createRecipe: createRecipe.mutate,
    updateRecipe: updateRecipe.mutate,
    deleteRecipe: deleteRecipe.mutate,
    isCreating: createRecipe.isPending,
    isUpdating: updateRecipe.isPending,
    isDeleting: deleteRecipe.isPending,
  };
} 