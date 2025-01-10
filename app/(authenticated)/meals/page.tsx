'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, Tab } from '@nextui-org/react';
import FamilySelectorDropdown from "@/components/families/family-selector-dropdown";
import { RecipeGenerator } from '@/components/meals/recipe-generator';
import { MealPlan } from '@/components/meals/meal-plan';
import { ShoppingList } from '@/components/meals/shopping-list';
import { RecipeLibrary } from '@/components/meals/recipe-library';
import { MealChat } from '@/components/meals/meal-chat';
import { CreateRecipeForm } from '@/components/meals/create-recipe-form';
import { 
  BeakerIcon, 
  BookOpenIcon, 
  ChatBubbleBottomCenterTextIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export default function MealsPage() {
  const searchParams = useSearchParams();
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(
    searchParams.get('familyId') || ''
  );
  const [selectedTab, setSelectedTab] = useState('create');
  const [selectedToolTab, setSelectedToolTab] = useState('plan');

  // Update selectedFamilyId when URL changes
  useEffect(() => {
    const familyId = searchParams.get('familyId');
    if (familyId) {
      setSelectedFamilyId(familyId);
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Meals</h1>
        <FamilySelectorDropdown
          selectedFamilyId={selectedFamilyId}
          onFamilySelect={setSelectedFamilyId}
        />
      </div>

      {!selectedFamilyId ? (
        <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-xl">
          <div className="text-center space-y-4">
            <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <div className="space-y-2">
              <p className="text-xl font-medium text-gray-700">Select a Family</p>
              <p className="text-sm text-gray-500">
                Please select a family to start planning meals together.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex items-center gap-6 border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('create')}
              className={`flex items-center gap-2 px-2 py-3 border-b-2 ${
                selectedTab === 'create' ? 'border-primary text-primary' : 'border-transparent'
              }`}
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create</span>
            </button>
            <button
              onClick={() => setSelectedTab('assistant')}
              className={`flex items-center gap-2 px-2 py-3 border-b-2 ${
                selectedTab === 'assistant' ? 'border-primary text-primary' : 'border-transparent'
              }`}
            >
              <SparklesIcon className="h-4 w-4" />
              <span>Assistant</span>
            </button>
            <button
              onClick={() => setSelectedTab('tools')}
              className={`flex items-center gap-2 px-2 py-3 border-b-2 ${
                selectedTab === 'tools' ? 'border-primary text-primary' : 'border-transparent'
              }`}
            >
              <BeakerIcon className="h-4 w-4" />
              <span>Tools</span>
            </button>
            <button
              onClick={() => setSelectedTab('library')}
              className={`flex items-center gap-2 px-2 py-3 border-b-2 ${
                selectedTab === 'library' ? 'border-primary text-primary' : 'border-transparent'
              }`}
            >
              <BookOpenIcon className="h-4 w-4" />
              <span>Library</span>
            </button>
            <button
              onClick={() => setSelectedTab('feedback')}
              className={`flex items-center gap-2 px-2 py-3 border-b-2 ${
                selectedTab === 'feedback' ? 'border-primary text-primary' : 'border-transparent'
              }`}
            >
              <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
              <span>Feedback</span>
            </button>
          </div>

          <div className="py-6">
            {selectedTab === 'create' && <CreateRecipeForm familyId={selectedFamilyId} />}
            {selectedTab === 'assistant' && <MealChat familyId={selectedFamilyId} onRecipeGenerated={() => {}} onRecipeAddedToPlan={() => {}} />}
            {selectedTab === 'tools' && (
              <Tabs
                aria-label="Meal planning tools"
                selectedKey={selectedToolTab}
                onSelectionChange={(key) => setSelectedToolTab(key.toString())}
                color="primary"
                variant="light"
                classNames={{
                  tabList: "gap-4",
                  cursor: "bg-primary/20",
                  tab: "max-w-fit px-4 h-10",
                  tabContent: "group-data-[selected=true]:text-primary",
                }}
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
                    <MealPlan familyId={selectedFamilyId} />
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
                    <RecipeGenerator familyId={selectedFamilyId} onRecipeGenerated={() => {}} onRecipeAddedToPlan={() => {}} />
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
                    <ShoppingList familyId={selectedFamilyId} />
                  </div>
                </Tab>
              </Tabs>
            )}
            {selectedTab === 'library' && <RecipeLibrary familyId={selectedFamilyId} />}
            {selectedTab === 'feedback' && (
              <div className="mt-4 p-4 text-center text-gray-500 border-2 border-dashed rounded-lg">
                Share your thoughts and suggestions to help us improve the meal planning experience.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 