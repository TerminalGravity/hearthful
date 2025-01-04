'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Divider, Spinner } from '@nextui-org/react';
import { CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useMealPlans } from '@/hooks/use-meal-plans';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { useRouter } from 'next/navigation';
import { AddMealModal } from './add-meal-modal';

type MealPlanRecipe = {
  id: string;
  date: Date;
  mealType: string;
  servings: number;
  notes?: string;
  mealPlanId: string;
  recipeId: string;
  recipe: {
    id: string;
    name: string;
    description?: string;
    ingredients: string[];
    instructions: string[];
    servings: number;
    prepTime: number;
    cookTime: number;
    dietaryInfo: string[];
  };
};

interface MealPlanProps {
  onRecipeAdded?: () => void;
}

export function MealPlan({ onRecipeAdded }: MealPlanProps) {
  const router = useRouter();
  const { currentFamily } = useCurrentFamily();
  const { mealPlans, isLoading: isMealPlansLoading, getCurrentWeekPlan, getRecipesForDate, addMealToDate } = useMealPlans(
    currentFamily?.id || ''
  );

  const [weekPlan, setWeekPlan] = useState<Date[]>(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);

  const handleAddMealClick = (date: Date) => {
    setSelectedDate(date);
    setIsAddMealModalOpen(true);
  };

  const handleAddMeal = async (mealData: {
    recipeId: string;
    date: Date;
    mealType: string;
    servings: number;
    notes?: string;
  }) => {
    try {
      await addMealToDate(mealData);
      setIsAddMealModalOpen(false);
      if (onRecipeAdded) {
        onRecipeAdded();
      }
    } catch (error) {
      console.error('Failed to add meal:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (isMealPlansLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Weekly Meal Plan</h2>
        <Button
          color="primary"
          variant="ghost"
          startContent={<CalendarDaysIcon className="h-4 w-4" />}
        >
          Generate Weekly Plan
        </Button>
      </div>

      <div className="grid gap-4">
        {weekPlan.map((date) => {
          const recipes = getRecipesForDate(date);
          return (
            <Card key={date.toISOString()} className="w-full">
              <CardHeader className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{formatDate(date)}</h3>
                <Button
                  size="sm"
                  color="primary"
                  variant="light"
                  startContent={<PlusIcon className="h-4 w-4" />}
                  onClick={() => handleAddMealClick(date)}
                >
                  Add Meal
                </Button>
              </CardHeader>
              <Divider />
              <CardBody>
                {recipes.length === 0 ? (
                  <p className="text-gray-500">No meals planned</p>
                ) : (
                  <div className="space-y-4">
                    {recipes.map((recipe) => (
                      <div key={recipe.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{recipe.recipe.name}</p>
                          <p className="text-sm text-gray-500">
                            {recipe.mealType} • {recipe.servings} servings
                          </p>
                        </div>
                        <Button size="sm" color="danger" variant="light">
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      <AddMealModal
        isOpen={isAddMealModalOpen}
        onClose={() => setIsAddMealModalOpen(false)}
        onSubmit={handleAddMeal}
        selectedDate={selectedDate}
      />
    </div>
  );
} 