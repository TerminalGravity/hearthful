'use client';

import { useChat, Message } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { useRecipes } from '@/hooks/use-recipes';
import { toast } from 'sonner';
import { Button, Card, ScrollShadow, Input, Chip, Spinner } from '@nextui-org/react';
import { 
  PlusIcon, 
  UserCircleIcon, 
  ComputerDesktopIcon,
  ChevronDownIcon,
  ClockIcon,
  FireIcon,
  UserGroupIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface MealChatProps {
  onRecipeGenerated: (recipe: any) => void;
  onRecipeAddedToPlan: () => void;
}

interface Recipe {
  name: string;
  description: string;
  ingredients: { item: string; amount: string; unit?: string }[];
  instructions: { step: number; text: string }[];
  servings: number;
  prepTime: number;
  cookTime: number;
  dietaryInfo: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  calories?: number;
}

interface MealPlan {
  days: number;
  mealsPerDay: number;
  plan: {
    day: number;
    meals: {
      mealType: string;
      suggestion: string;
    }[];
  }[];
}

interface ShoppingList {
  categories: {
    name: string;
    items: string[];
  }[];
  additionalItems: string[];
  totalItems: number;
  estimatedCost: string;
}

function RecipeCard({ recipe, onSave, isSaving }: { recipe: Recipe; onSave: () => void; isSaving: boolean }) {
  return (
    <Card className="p-6 space-y-4 w-full bg-gradient-to-br from-primary-50 to-background">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-primary">{recipe.name}</h3>
          <p className="text-sm text-gray-600">{recipe.description}</p>
        </div>
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          color="primary"
          onClick={onSave}
          isLoading={isSaving}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <ClockIcon className="h-4 w-4" />
          <span>Prep: {recipe.prepTime}m</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <FireIcon className="h-4 w-4" />
          <span>Cook: {recipe.cookTime}m</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <UserGroupIcon className="h-4 w-4" />
          <span>Serves: {recipe.servings}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <SparklesIcon className="h-4 w-4" />
          <span>{recipe.difficulty}</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {recipe.dietaryInfo.map((info, i) => (
          <Chip 
            key={i} 
            size="sm" 
            variant="flat" 
            color="primary"
            classNames={{
              base: "bg-primary-100",
              content: "text-primary-700 font-medium",
            }}
          >
            {info}
          </Chip>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2 text-primary-700">Ingredients</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="text-gray-700">
                {ing.amount} {ing.unit} {ing.item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-2 text-primary-700">Instructions</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            {recipe.instructions.map((inst) => (
              <li key={inst.step} className="text-gray-700">
                {inst.text}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Card>
  );
}

function MealPlanCard({ plan }: { plan: MealPlan }) {
  return (
    <Card className="p-6 space-y-4 w-full bg-gradient-to-br from-primary-50 to-background">
      <div className="space-y-4">
        {plan.plan.map((day) => (
          <div key={day.day} className="space-y-2">
            <h4 className="font-medium text-primary-700">Day {day.day}</h4>
            <div className="space-y-2">
              {day.meals.map((meal, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Chip size="sm" variant="flat" color="primary">
                    {meal.mealType}
                  </Chip>
                  <span className="text-gray-700">{meal.suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ShoppingListCard({ list }: { list: ShoppingList }) {
  return (
    <Card className="p-6 space-y-4 w-full bg-gradient-to-br from-primary-50 to-background">
      <div className="space-y-4">
        {list.categories.map((category, i) => (
          <div key={i} className="space-y-2">
            <h4 className="font-medium text-primary-700">{category.name}</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {category.items.map((item, j) => (
                <li key={j} className="text-gray-700">{item}</li>
              ))}
            </ul>
          </div>
        ))}
        {list.additionalItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-primary-700">Additional Items</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {list.additionalItems.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
          <span>Total Items: {list.totalItems}</span>
          <span>Estimated Cost: {list.estimatedCost}</span>
        </div>
      </div>
    </Card>
  );
}

function ChatMessage({ 
  message, 
  onSaveRecipe, 
  isSaving 
}: { 
  message: Message; 
  onSaveRecipe: (content: string) => void;
  isSaving: boolean;
}) {
  let content: any = null;
  
  try {
    if (message.content.includes('"name":')) {
      const match = message.content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if ('name' in parsed) {
          content = { type: 'recipe', data: parsed };
        }
      }
    } else if (message.content.includes('"days":')) {
      const match = message.content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if ('days' in parsed) {
          content = { type: 'mealPlan', data: parsed };
        }
      }
    } else if (message.content.includes('"categories":')) {
      const match = message.content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if ('categories' in parsed) {
          content = { type: 'shoppingList', data: parsed };
        }
      }
    }
  } catch (e) {
    console.error('Failed to parse message content:', e);
  }

  const isUser = message.role === 'user';

  return (
    <div 
      className={clsx(
        'group flex gap-3 text-gray-600 text-sm',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
          <ComputerDesktopIcon className="h-4 w-4 text-primary" />
        </div>
      )}
      
      <div className={clsx(
        'flex flex-col max-w-[85%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        {content ? (
          <>
            {content.type === 'recipe' && (
              <RecipeCard 
                recipe={content.data} 
                onSave={() => onSaveRecipe(message.content)}
                isSaving={isSaving}
              />
            )}
            {content.type === 'mealPlan' && (
              <MealPlanCard plan={content.data} />
            )}
            {content.type === 'shoppingList' && (
              <ShoppingListCard list={content.data} />
            )}
          </>
        ) : (
          <Card 
            className={clsx(
              'px-4 py-2',
              isUser ? 'bg-primary text-white' : 'bg-gray-100'
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </Card>
        )}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
          <UserCircleIcon className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  );
}

export function MealChat({ onRecipeGenerated, onRecipeAddedToPlan }: MealChatProps) {
  const { currentFamily } = useCurrentFamily();
  const { createRecipe } = useRecipes(currentFamily?.id);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: "👋 Hi! I'm your meal planning assistant. I can help you:\n\n• Generate personalized recipes\n• Create weekly meal plans\n• Make shopping lists\n\nWhat would you like to do?",
      },
    ],
    body: {
      familyId: currentFamily?.id,
    },
    onResponse: (response) => {
      // Check if the response was successful
      if (!response.ok) {
        toast.error('Failed to get response. Please try again.');
      }
    },
    onFinish: (message) => {
      // If the message contains a recipe, check if we should save it
      if (message.content.includes('"name":')) {
        try {
          const recipeMatch = message.content.match(/\{[\s\S]*\}/);
          if (recipeMatch) {
            const recipe = JSON.parse(recipeMatch[0]);
            if (recipe.name && recipe.autoSave) {
              handleSaveRecipe(message.content);
            }
          }
        } catch (e) {
          console.error('Failed to parse recipe:', e);
        }
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error('An error occurred. Please try again.');
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSaveRecipe = async (message: string) => {
    try {
      const recipeMatch = message.match(/\{[\s\S]*\}/);
      if (!recipeMatch) return;

      const recipe = JSON.parse(recipeMatch[0]);
      setIsSaving(true);

      const savedRecipe = await createRecipe({
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions.map((instruction: any) => instruction.text),
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        dietaryInfo: recipe.dietaryInfo,
        familyId: currentFamily?.id,
      });

      onRecipeGenerated(savedRecipe);
      toast.success('Recipe saved to library!');
    } catch (error) {
      console.error('Failed to save recipe:', error);
      toast.error('Failed to save recipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-xl">
        <div className="text-center space-y-4">
          <ComputerDesktopIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <div className="space-y-2">
            <p className="text-xl font-medium text-gray-700">Select a Family</p>
            <p className="text-sm text-gray-500">
              Please select a family to start planning meals together.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-xl bg-background">
      <ScrollShadow ref={scrollRef} className="flex-grow p-4 space-y-6">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            onSaveRecipe={handleSaveRecipe}
            isSaving={isSaving}
          />
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center">
              <ComputerDesktopIcon className="h-4 w-4 text-primary" />
            </div>
            <Card className="px-4 py-2 bg-gray-100">
              <Spinner size="sm" color="primary" />
            </Card>
          </div>
        )}
      </ScrollShadow>

      <div className="p-4 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSubmit}>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me about recipes, meal plans, or shopping lists..."
            size="lg"
            radius="lg"
            classNames={{
              input: "text-sm",
              inputWrapper: "shadow-sm",
            }}
            endContent={
              <Button 
                type="submit"
                isIconOnly
                color="primary"
                size="sm"
                isLoading={isLoading}
                className="mr-1"
              >
                <ChevronDownIcon className="h-4 w-4 rotate-180" />
              </Button>
            }
          />
        </form>
      </div>
    </div>
  );
} 