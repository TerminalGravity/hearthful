import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

type MealPlan = {
  id: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  familyId: string;
  recipes: MealPlanRecipe[];
};

type CreateMealPlanInput = {
  startDate: Date;
  endDate: Date;
  familyId: string;
  recipes: Array<{
    recipeId: string;
    date: Date;
    mealType: string;
    servings: number;
    notes?: string;
  }>;
};

export function useMealPlans(familyId: string) {
  const queryClient = useQueryClient();

  const { data: mealPlans, isLoading } = useQuery({
    queryKey: ['meal-plans', familyId],
    queryFn: async () => {
      const response = await fetch(`/api/meal-plans?familyId=${familyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meal plans');
      }
      return response.json();
    },
    enabled: !!familyId,
  });

  const createMealPlan = useMutation({
    mutationFn: async (mealPlan: CreateMealPlanInput) => {
      const response = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealPlan),
      });

      if (!response.ok) {
        throw new Error('Failed to create meal plan');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans', familyId] });
    },
  });

  const addMealToDate = useMutation({
    mutationFn: async (mealData: {
      recipeId: string;
      date: Date;
      mealType: string;
      servings: number;
      notes?: string;
    }) => {
      let currentPlan = getCurrentWeekPlan();
      
      // If no current plan exists, create a new weekly plan
      if (!currentPlan) {
        const startDate = new Date(mealData.date);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6); // End of week

        currentPlan = await createMealPlan.mutateAsync({
          startDate,
          endDate,
          familyId,
          recipes: [],
        });
      }

      // Add the meal to the plan
      const response = await fetch(`/api/meal-plans/${currentPlan.id}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealData),
      });

      if (!response.ok) {
        throw new Error('Failed to add meal to plan');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans', familyId] });
    },
  });

  const getCurrentWeekPlan = () => {
    if (!mealPlans) return null;

    const today = new Date();
    return mealPlans.find((plan: MealPlan) => {
      const startDate = new Date(plan.startDate);
      const endDate = new Date(plan.endDate);
      return today >= startDate && today <= endDate;
    });
  };

  const getRecipesForDate = (date: Date) => {
    const currentPlan = getCurrentWeekPlan();
    if (!currentPlan) return [];

    return currentPlan.recipes.filter((recipe) => {
      const recipeDate = new Date(recipe.date);
      return (
        recipeDate.getFullYear() === date.getFullYear() &&
        recipeDate.getMonth() === date.getMonth() &&
        recipeDate.getDate() === date.getDate()
      );
    });
  };

  return {
    mealPlans,
    isLoading,
    createMealPlan: createMealPlan.mutate,
    isCreating: createMealPlan.isPending,
    getCurrentWeekPlan,
    getRecipesForDate,
    addMealToDate: addMealToDate.mutate,
    isAddingMeal: addMealToDate.isPending,
  };
} 