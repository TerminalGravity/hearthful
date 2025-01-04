'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Divider, Spinner, Select, SelectItem } from '@nextui-org/react';
import { CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useMealPlans } from '@/hooks/use-meal-plans';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const { families, currentFamily, isLoading: isFamiliesLoading } = useCurrentFamily();
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

  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleFamilyChange = (familyId: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('familyId', familyId);
    router.push(`/meals?${params.toString()}`);
  };

  const handleAddMealClick = (date: Date) => {
    setSelectedDate(date);
    setIsAddMealOpen(true);
  };

  const handleAddMeal = async (mealData: {
    recipeId: string;
    date: Date;
    mealType: string;
    servings: number;
    notes?: string;
  }) => {
    if (!currentFamily) return;
    await addMealToDate(mealData);
    if (onRecipeAdded) {
      onRecipeAdded();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (isFamiliesLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select
          label="Select Family"
          placeholder="Choose a family"
          selectedKeys={currentFamily ? [currentFamily.id] : []}
          onChange={(e) => handleFamilyChange(e.target.value)}
          className="max-w-xs"
        >
          {families?.map((family: any) => (
            <SelectItem key={family.id} value={family.id}>
              {family.name}
            </SelectItem>
          ))}
        </Select>

        {currentFamily && (
          <Button 
            color="primary"
            variant="flat"
            startContent={<CalendarDaysIcon className="h-5 w-5" />}
          >
            Generate Weekly Plan
          </Button>
        )}
      </div>

      {!currentFamily ? (
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">Please select a family to view meal plans.</p>
        </div>
      ) : isMealPlansLoading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4">
          {weekPlan.map((date, index) => {
            const dayRecipes = getRecipesForDate(date);

            return (
              <Card key={index} className="w-full">
                <CardHeader className="flex justify-between items-center px-4 py-2">
                  <h3 className="text-lg font-medium">{formatDate(date)}</h3>
                  <Button 
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={() => handleAddMealClick(date)}
                  >
                    <PlusIcon className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <Divider />
                <CardBody className="px-4 py-2">
                  {dayRecipes.length === 0 ? (
                    <p className="text-gray-500 text-sm">No meals planned</p>
                  ) : (
                    <div className="space-y-2">
                      {dayRecipes.map((mealRecipe: MealPlanRecipe) => (
                        <div 
                          key={mealRecipe.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{mealRecipe.recipe.name}</p>
                            <p className="text-sm text-gray-500">
                              {mealRecipe.mealType} • {mealRecipe.servings} servings
                            </p>
                          </div>
                          <Button 
                            size="sm"
                            variant="light"
                            color="primary"
                            onClick={() => {/* View recipe handler */}}
                          >
                            View Recipe
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
      )}

      {selectedDate && (
        <AddMealModal
          isOpen={isAddMealOpen}
          onClose={() => {
            setIsAddMealOpen(false);
            setSelectedDate(null);
          }}
          onAdd={handleAddMeal}
          date={selectedDate}
        />
      )}
    </div>
  );
} 