'use client';

import { useState, useMemo } from 'react';
import { Card, CardBody, Checkbox, Button, Divider } from '@nextui-org/react';
import { useMealPlans } from '@/hooks/use-meal-plans';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { PrinterIcon, ShareIcon } from '@heroicons/react/24/outline';

type MealPlanRecipe = {
  recipe: {
    id: string;
    name: string;
    ingredients: string[];
  };
};

type Ingredient = {
  name: string;
  checked: boolean;
  recipes: string[];
};

export function ShoppingList() {
  const { currentFamily } = useCurrentFamily();
  const { getCurrentWeekPlan } = useMealPlans(currentFamily?.id || '');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const ingredients = useMemo(() => {
    const currentPlan = getCurrentWeekPlan();
    if (!currentPlan) return [];

    const ingredientMap = new Map<string, Ingredient>();

    currentPlan.recipes.forEach((mealRecipe: MealPlanRecipe) => {
      mealRecipe.recipe.ingredients.forEach((ingredient: string) => {
        const normalizedIngredient = ingredient.toLowerCase().trim();
        if (ingredientMap.has(normalizedIngredient)) {
          ingredientMap.get(normalizedIngredient)?.recipes.push(mealRecipe.recipe.name);
        } else {
          ingredientMap.set(normalizedIngredient, {
            name: ingredient,
            checked: checkedItems.has(normalizedIngredient),
            recipes: [mealRecipe.recipe.name],
          });
        }
      });
    });

    return Array.from(ingredientMap.values());
  }, [getCurrentWeekPlan, checkedItems]);

  const handleToggleItem = (ingredient: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(ingredient)) {
      newCheckedItems.delete(ingredient);
    } else {
      newCheckedItems.add(ingredient);
    }
    setCheckedItems(newCheckedItems);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = ingredients
      .map((ingredient) => `${ingredient.name} (${ingredient.recipes.join(', ')})`)
      .join('\n');

    try {
      await navigator.share({
        title: 'Shopping List',
        text,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!currentFamily) {
    return (
      <div className="text-center p-4">
        <p>Please select a family to view shopping list.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Shopping List</h2>
        <div className="flex gap-2">
          <Button
            variant="flat"
            startContent={<PrinterIcon className="h-4 w-4" />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="flat"
            startContent={<ShareIcon className="h-4 w-4" />}
            onClick={handleShare}
          >
            Share
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          {ingredients.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No ingredients needed for this week's meal plan.
            </div>
          ) : (
            <div className="divide-y">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      isSelected={checkedItems.has(ingredient.name.toLowerCase())}
                      onValueChange={() => handleToggleItem(ingredient.name.toLowerCase())}
                    />
                    <div className="flex-grow">
                      <p className={checkedItems.has(ingredient.name.toLowerCase()) ? 'line-through text-gray-400' : ''}>
                        {ingredient.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Used in: {ingredient.recipes.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
} 