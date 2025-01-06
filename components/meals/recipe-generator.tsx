'use client';

import { useState } from 'react';
import { Button, Select, SelectItem, Input, Card, Chip, Textarea } from '@nextui-org/react';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { useRecipes } from '@/hooks/use-recipes';
import { toast } from 'sonner';
import { Selection } from '@nextui-org/react';

interface RecipeGeneratorProps {
  onRecipeGenerated: (recipe: any) => void;
  onRecipeAddedToPlan: () => void;
}

interface GeneratedRecipe {
  name: string;
  description: string;
  ingredients: Array<{
    item: string;
    amount: string;
    unit?: string;
  }>;
  instructions: Array<{
    step: number;
    text: string;
  }>;
  servings: number;
  prepTime: number;
  cookTime: number;
  dietaryInfo: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  calories?: number;
}

interface Preferences {
  dietary: Selection;
  mealType: Selection;
  cuisine: Selection;
  servings: number;
  maxPrepTime: number;
  difficulty: string;
  numberOfRecipes: number;
  additionalNotes: string;
  participants: string[];
}

interface FamilyMember {
  id: string;
  name: string;
  preferences?: {
    dietaryRestrictions?: string[];
    allergies?: string[];
    preferences?: string[];
  };
}

const dietaryOptions = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Gluten-Free', value: 'gluten-free' },
  { label: 'Dairy-Free', value: 'dairy-free' },
  { label: 'Nut-Free', value: 'nut-free' },
  { label: 'Low-Carb', value: 'low-carb' },
  { label: 'Keto', value: 'keto' },
  { label: 'Paleo', value: 'paleo' },
  { label: 'Halal', value: 'halal' },
  { label: 'Kosher', value: 'kosher' },
];

const mealTypes = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snack', value: 'snack' },
  { label: 'Dessert', value: 'dessert' },
  { label: 'Appetizer', value: 'appetizer' },
  { label: 'Side Dish', value: 'side' },
];

const cuisineTypes = [
  { label: 'American', value: 'american' },
  { label: 'Italian', value: 'italian' },
  { label: 'Mexican', value: 'mexican' },
  { label: 'Chinese', value: 'chinese' },
  { label: 'Japanese', value: 'japanese' },
  { label: 'Indian', value: 'indian' },
  { label: 'Mediterranean', value: 'mediterranean' },
  { label: 'Thai', value: 'thai' },
  { label: 'French', value: 'french' },
  { label: 'Greek', value: 'greek' },
];

export function RecipeGenerator({ onRecipeGenerated, onRecipeAddedToPlan }: RecipeGeneratorProps) {
  const { currentFamily } = useCurrentFamily();
  const { createRecipe } = useRecipes();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipe[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const [preferences, setPreferences] = useState<Preferences>({
    dietary: new Set<string>(),
    mealType: new Set<string>(),
    cuisine: new Set<string>(),
    servings: 4,
    maxPrepTime: 60,
    difficulty: 'medium',
    numberOfRecipes: 3,
    additionalNotes: '',
    participants: [],
  });

  const getParticipantRestrictions = (participants: string[]) => {
    if (!currentFamily?.members) return new Set<string>();
    
    const restrictions = new Set<string>();
    participants.forEach(participantId => {
      const member = currentFamily.members.find(m => m.id === participantId);
      if (member?.preferences) {
        member.preferences.dietaryRestrictions?.forEach(r => restrictions.add(r));
        member.preferences.allergies?.forEach(a => restrictions.add(a));
      }
    });
    return restrictions;
  };

  const handleGenerate = async () => {
    if (!currentFamily) {
      toast.error('Please select a family first');
      return;
    }

    setIsGenerating(true);
    try {
      const participantRestrictions = getParticipantRestrictions(preferences.participants);
      const allRestrictions = new Set([
        ...Array.from(preferences.dietary),
        ...Array.from(participantRestrictions),
      ]);

      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate ${preferences.numberOfRecipes} different recipes with these requirements:
            - Dietary restrictions: ${Array.from(allRestrictions).join(', ')}
            - Meal types: ${Array.from(preferences.mealType).join(', ')}
            - Cuisine types: ${Array.from(preferences.cuisine).join(', ')}
            - Number of servings: ${preferences.servings}
            - Maximum prep time: ${preferences.maxPrepTime} minutes
            - Difficulty level: ${preferences.difficulty}
            Additional notes: ${preferences.additionalNotes}`,
          count: preferences.numberOfRecipes,
          participantIds: preferences.participants,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipes');
      }

      const recipes = await response.json();
      setGeneratedRecipes(recipes);
      toast.success(`Generated ${recipes.length} recipes!`);
    } catch (error) {
      console.error('Failed to generate recipes:', error);
      toast.error('Failed to generate recipes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async (recipe: GeneratedRecipe) => {
    try {
      const savedRecipe = await createRecipe({
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions.map(instruction => instruction.text),
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        dietaryInfo: recipe.dietaryInfo,
        familyId: currentFamily!.id,
      });

      onRecipeGenerated(savedRecipe);
      toast.success('Recipe saved to library!');
    } catch (error) {
      console.error('Failed to save recipe:', error);
      toast.error('Failed to save recipe. Please try again.');
    }
  };

  const handleAddToShoppingList = async (recipe: GeneratedRecipe) => {
    try {
      const response = await fetch('/api/shopping-list/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyId: currentFamily!.id,
          items: recipe.ingredients.map(ing => ({
            name: ing.item,
            amount: ing.amount,
            unit: ing.unit,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add items to shopping list');
      }

      toast.success('Added ingredients to shopping list!');
    } catch (error) {
      console.error('Failed to add to shopping list:', error);
      toast.error('Failed to add to shopping list. Please try again.');
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
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Participants (Optional)
          </label>
          <Card className="p-4">
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {currentFamily?.members?.map((member) => (
                <label key={member.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={preferences.participants.includes(member.id)}
                    onChange={(e) => {
                      const newParticipants = e.target.checked
                        ? [...preferences.participants, member.id]
                        : preferences.participants.filter(id => id !== member.id);
                      setPreferences({ ...preferences, participants: newParticipants });
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{member.name}</span>
                  {member.preferences && (
                    <div className="flex gap-1 ml-auto">
                      {member.preferences.dietaryRestrictions?.map((restriction, i) => (
                        <Chip key={i} size="sm" variant="flat" color="warning">
                          {restriction}
                        </Chip>
                      ))}
                    </div>
                  )}
                </label>
              ))}
            </div>
          </Card>
        </div>

        <Select
          label="Dietary Restrictions"
          selectionMode="multiple"
          placeholder="Select any dietary restrictions"
          selectedKeys={preferences.dietary}
          onSelectionChange={(keys) => setPreferences({ ...preferences, dietary: keys })}
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
          onSelectionChange={(keys) => setPreferences({ ...preferences, mealType: keys })}
        >
          {mealTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Cuisine Type"
          selectionMode="multiple"
          placeholder="Select cuisine type"
          selectedKeys={preferences.cuisine}
          onSelectionChange={(keys) => setPreferences({ ...preferences, cuisine: keys })}
        >
          {cuisineTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </Select>

        <Input
          type="number"
          label="Number of Servings"
          placeholder="4"
          value={preferences.servings.toString()}
          onChange={(e) => setPreferences({ ...preferences, servings: parseInt(e.target.value) || 4 })}
          min="1"
        />

        <Input
          type="number"
          label="Maximum Prep Time (minutes)"
          placeholder="60"
          value={preferences.maxPrepTime.toString()}
          onChange={(e) => setPreferences({ ...preferences, maxPrepTime: parseInt(e.target.value) || 60 })}
          min="1"
        />

        <Select
          label="Difficulty Level"
          placeholder="Select difficulty"
          selectedKeys={new Set([preferences.difficulty])}
          onSelectionChange={(keys) => {
            const difficulty = Array.from(keys)[0]?.toString() || 'medium';
            setPreferences({ ...preferences, difficulty });
          }}
        >
          <SelectItem key="easy" value="easy">Easy</SelectItem>
          <SelectItem key="medium" value="medium">Medium</SelectItem>
          <SelectItem key="hard" value="hard">Hard</SelectItem>
        </Select>

        <Input
          type="number"
          label="Number of Recipes to Generate"
          placeholder="3"
          min="1"
          max="10"
          value={preferences.numberOfRecipes.toString()}
          onChange={(e) => setPreferences({ 
            ...preferences, 
            numberOfRecipes: Math.min(10, Math.max(1, parseInt(e.target.value) || 3))
          })}
        />

        <Textarea
          label="Additional Notes"
          placeholder="Any specific ingredients or preferences..."
          value={preferences.additionalNotes}
          onChange={(e) => setPreferences({ ...preferences, additionalNotes: e.target.value })}
          className="col-span-2"
        />
      </div>

      <div className="flex justify-center">
        <Button
          color="primary"
          onClick={handleGenerate}
          isLoading={isGenerating}
          className="w-full max-w-xs"
        >
          {isGenerating ? 'Generating Recipes...' : 'Generate Recipes'}
        </Button>
      </div>

      {generatedRecipes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Generated Recipes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedRecipes.map((recipe, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold">{recipe.name}</h4>
                  <p className="text-sm text-gray-600">{recipe.description}</p>
                  
                  {/* Dietary Information */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {recipe.dietaryInfo.map((info, i) => {
                        const isParticipantRestriction = Array.from(getParticipantRestrictions(preferences.participants)).includes(info);
                        return (
                          <Chip 
                            key={i} 
                            size="sm" 
                            variant="flat"
                            color={isParticipantRestriction ? "warning" : "default"}
                          >
                            {info}
                            {isParticipantRestriction && (
                              <span className="ml-1 text-xs">★</span>
                            )}
                          </Chip>
                        );
                      })}
                    </div>
                    
                    {/* Participant Information */}
                    {preferences.participants.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs text-gray-500">Customized for:</span>
                        {preferences.participants.map(participantId => {
                          const member = currentFamily?.members?.find(m => m.id === participantId);
                          return member ? (
                            <Chip key={participantId} size="sm" variant="dot" color="primary">
                              {member.name}
                            </Chip>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onClick={() => handleSaveRecipe(recipe)}
                      >
                        Save to Library
                      </Button>
                      <Button
                        size="sm"
                        color="secondary"
                        variant="flat"
                        onClick={() => handleAddToShoppingList(recipe)}
                      >
                        Add to Shopping List
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      {recipe.prepTime + recipe.cookTime} mins
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 