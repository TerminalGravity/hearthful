'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Select, SelectItem, Chip } from '@nextui-org/react';
import { useRecipes } from '@/hooks/use-recipes';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

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
  familyId: string;
};

interface RecipeLibraryProps {
  onRecipeAddedToPlan?: () => void;
}

export function RecipeLibrary({ onRecipeAddedToPlan }: RecipeLibraryProps) {
  const { currentFamily } = useCurrentFamily();
  const { recipes, isLoading } = useRecipes(currentFamily?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

  const dietaryOptions = [
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Vegan', value: 'vegan' },
    { label: 'Gluten-Free', value: 'gluten-free' },
    { label: 'Dairy-Free', value: 'dairy-free' },
    { label: 'Keto', value: 'keto' },
    { label: 'Paleo', value: 'paleo' },
  ];

  const filteredRecipes = recipes?.filter((recipe: Recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDietary = selectedDietary.length === 0 ||
      selectedDietary.every(diet => recipe.dietaryInfo.includes(diet));

    return matchesSearch && matchesDietary;
  });

  if (!currentFamily) {
    return (
      <div className="text-center p-8 border-2 border-dashed rounded-lg">
        <p className="text-gray-500">Please select a family to view recipes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />}
          className="flex-grow"
        />
        <Select
          placeholder="Filter by dietary needs"
          selectionMode="multiple"
          selectedKeys={selectedDietary}
          onSelectionChange={(keys) => setSelectedDietary(Array.from(keys) as string[])}
          startContent={<FunnelIcon className="h-4 w-4 text-gray-400" />}
          className="min-w-[200px]"
        >
          {dietaryOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes?.map((recipe: Recipe) => (
          <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{recipe.name}</h3>
                <p className="text-sm text-gray-500">
                  {recipe.prepTime + recipe.cookTime} mins • {recipe.servings} servings
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 mb-4">{recipe.description}</p>
              <div className="flex flex-wrap gap-2">
                {recipe.dietaryInfo.map((diet) => (
                  <Chip key={diet} size="sm" variant="flat">
                    {diet}
                  </Chip>
                ))}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button size="sm" variant="light">View Details</Button>
                <Button size="sm" color="primary">Add to Plan</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {filteredRecipes?.length === 0 && (
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">No recipes found matching your criteria.</p>
        </div>
      )}
    </div>
  );
} 