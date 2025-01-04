'use client';

import { useState } from 'react';
import { Button, Select, SelectItem } from '@nextui-org/react';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { useRecipes } from '@/hooks/use-recipes';
import { toast } from 'sonner';

interface RecipeGeneratorProps {
  onRecipeGenerated: (recipe: any) => void;
  onRecipeAddedToPlan: () => void;
}

const dietaryOptions = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Gluten-Free', value: 'gluten-free' },
  { label: 'Dairy-Free', value: 'dairy-free' },
  { label: 'Nut-Free', value: 'nut-free' },
  { label: 'Low-Carb', value: 'low-carb' },
];

const mealTypes = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snack', value: 'snack' },
  { label: 'Dessert', value: 'dessert' },
];

export function RecipeGenerator({ onRecipeGenerated, onRecipeAddedToPlan }: RecipeGeneratorProps) {
  const { currentFamily } = useCurrentFamily();
  const { createRecipe } = useRecipes();
  const [isGenerating, setIsGenerating] = useState(false);
  const [preferences, setPreferences] = useState({
    dietary: new Set<string>(),
    mealType: new Set<string>(),
  });

  const handleGenerate = async () => {
    if (!currentFamily) {
      toast.error('Please select a family first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate a recipe that is ${Array.from(preferences.dietary).join(', ')} friendly, suitable for ${Array.from(preferences.mealType).join(', ')}.`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipe');
      }

      const recipe = await response.json();

      // Save the recipe to the library
      const savedRecipe = await createRecipe({
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions.map((instruction: any) => instruction.text),
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        dietaryInfo: recipe.dietaryInfo,
        familyId: currentFamily.id,
      });

      onRecipeGenerated(savedRecipe);
      toast.success('Recipe generated and saved to library!');
    } catch (error) {
      console.error('Failed to generate recipe:', error);
      toast.error('Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentFamily) {
    return (
      <div className="text-center p-4">
        <p>Please select a family to generate recipes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Dietary Restrictions"
          selectionMode="multiple"
          placeholder="Select any dietary restrictions"
          selectedKeys={preferences.dietary}
          onSelectionChange={(keys) => {
            if (keys instanceof Set) {
              setPreferences({ ...preferences, dietary: keys });
            }
          }}
        >
          {dietaryOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Meal Type"
          selectionMode="multiple"
          placeholder="Select meal type"
          selectedKeys={preferences.mealType}
          onSelectionChange={(keys) => {
            if (keys instanceof Set) {
              setPreferences({ ...preferences, mealType: keys });
            }
          }}
        >
          {mealTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="flex justify-center">
        <Button
          color="primary"
          onClick={handleGenerate}
          isLoading={isGenerating}
          className="w-full max-w-xs"
        >
          {isGenerating ? 'Generating Recipe...' : 'Generate Recipe'}
        </Button>
      </div>
    </div>
  );
} 