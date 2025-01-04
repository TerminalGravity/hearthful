'use client';

import { useState } from 'react';
import { Tabs, Tab, Select, SelectItem } from '@nextui-org/react';
import { RecipeGenerator } from '@/components/meals/recipe-generator';
import { MealPlan } from '@/components/meals/meal-plan';
import { ShoppingList } from '@/components/meals/shopping-list';
import { RecipeLibrary } from '@/components/meals/recipe-library';
import { MealChat } from '@/components/meals/meal-chat';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  BeakerIcon, 
  BookOpenIcon, 
  ChatBubbleBottomCenterTextIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

export default function MealsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { families, currentFamily, isLoading: isFamiliesLoading } = useCurrentFamily();
  const [selectedMainTab, setSelectedMainTab] = useState('create');
  const [selectedToolTab, setSelectedToolTab] = useState('plan');

  const handleFamilyChange = (familyId: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('familyId', familyId);
    router.push(`/meals?${params.toString()}`);
  };

  const handleRecipeGenerated = (recipe: any) => {
    // Switch to the library tab to show the saved recipe
    setSelectedMainTab('library');
  };

  const handleRecipeAddedToPlan = () => {
    // Switch to the meal plan tab
    setSelectedMainTab('tools');
    setSelectedToolTab('plan');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Meal Planning</h1>
      
      {/* Family Selector */}
      <div className="mb-6">
        <Select
          label="Select Family"
          placeholder="Choose a family"
          selectedKeys={currentFamily ? [currentFamily.id] : []}
          onChange={(e) => handleFamilyChange(e.target.value)}
          className="max-w-xs"
          isLoading={isFamiliesLoading}
        >
          {families?.map((family: any) => (
            <SelectItem key={family.id} value={family.id}>
              {family.name}
            </SelectItem>
          ))}
        </Select>
      </div>

      {!currentFamily ? (
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">Please select a family to view meal plans.</p>
        </div>
      ) : (
        <Tabs 
          selectedKey={selectedMainTab} 
          onSelectionChange={(key) => setSelectedMainTab(key.toString())}
          className="mb-4"
          aria-label="Main meal planning sections"
        >
          <Tab
            key="create"
            title={
              <div className="flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>Create</span>
              </div>
            }
          >
            <div className="mt-4">
              <MealChat 
                onRecipeGenerated={handleRecipeGenerated}
                onRecipeAddedToPlan={handleRecipeAddedToPlan}
              />
            </div>
          </Tab>

          <Tab
            key="tools"
            title={
              <div className="flex items-center gap-2">
                <BeakerIcon className="h-4 w-4" />
                <span>Tools</span>
              </div>
            }
          >
            <div className="mt-4">
              <Tabs
                selectedKey={selectedToolTab}
                onSelectionChange={(key) => setSelectedToolTab(key.toString())}
                variant="underlined"
                aria-label="Meal planning tools"
              >
                <Tab
                  key="plan"
                  title={
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span>Meal Plan</span>
                    </div>
                  }
                >
                  <div className="mt-4">
                    <MealPlan onRecipeAdded={handleRecipeAddedToPlan} />
                  </div>
                </Tab>
                <Tab
                  key="recipes"
                  title={
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="h-4 w-4" />
                      <span>Recipe Generator</span>
                    </div>
                  }
                >
                  <div className="mt-4">
                    <RecipeGenerator 
                      onRecipeGenerated={handleRecipeGenerated} 
                      onRecipeAddedToPlan={handleRecipeAddedToPlan}
                    />
                  </div>
                </Tab>
                <Tab
                  key="shopping"
                  title={
                    <div className="flex items-center gap-2">
                      <ClipboardDocumentListIcon className="h-4 w-4" />
                      <span>Shopping List</span>
                    </div>
                  }
                >
                  <div className="mt-4">
                    <ShoppingList />
                  </div>
                </Tab>
              </Tabs>
            </div>
          </Tab>

          <Tab
            key="library"
            title={
              <div className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4" />
                <span>Library</span>
              </div>
            }
          >
            <div className="mt-4">
              <RecipeLibrary onRecipeAddedToPlan={handleRecipeAddedToPlan} />
            </div>
          </Tab>

          <Tab
            key="feedback"
            title={
              <div className="flex items-center gap-2">
                <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
                <span>Feedback</span>
              </div>
            }
          >
            <div className="mt-4 p-4 text-center text-gray-500 border-2 border-dashed rounded-lg">
              Share your thoughts and suggestions to help us improve the meal planning experience.
            </div>
          </Tab>
        </Tabs>
      )}
    </div>
  );
} 