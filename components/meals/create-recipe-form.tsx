'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useCurrentFamily } from "@/hooks/use-current-family";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Card,
  Chip,
  Textarea,
} from "@nextui-org/react";

const RECIPE_CATEGORIES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Snack",
  "Appetizer",
  "Side Dish",
  "Main Course",
  "Beverage",
  "Other"
];

export function CreateRecipeForm() {
  const router = useRouter();
  const { user } = useUser();
  const { currentFamily } = useCurrentFamily();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(RECIPE_CATEGORIES[0]);
  const [servings, setServings] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [instructions, setInstructions] = useState<string[]>([]);
  const [instructionInput, setInstructionInput] = useState("");
  const [dietaryInfo, setDietaryInfo] = useState<string[]>([]);
  const [dietaryInput, setDietaryInput] = useState("");

  const handleAddIngredient = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && ingredientInput.trim()) {
      e.preventDefault();
      if (!ingredients.includes(ingredientInput.trim())) {
        setIngredients(prev => [...prev, ingredientInput.trim()]);
      }
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(prev => prev.filter(ingredient => ingredient !== ingredientToRemove));
  };

  const handleAddInstruction = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && instructionInput.trim()) {
      e.preventDefault();
      setInstructions(prev => [...prev, instructionInput.trim()]);
      setInstructionInput('');
    }
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddDietaryInfo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && dietaryInput.trim()) {
      e.preventDefault();
      if (!dietaryInfo.includes(dietaryInput.trim())) {
        setDietaryInfo(prev => [...prev, dietaryInput.trim()]);
      }
      setDietaryInput('');
    }
  };

  const handleRemoveDietaryInfo = (infoToRemove: string) => {
    setDietaryInfo(prev => prev.filter(info => info !== infoToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !currentFamily?.id || !servings || !prepTime || !cookTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          ingredients,
          instructions,
          servings: parseInt(servings),
          prepTime: parseInt(prepTime),
          cookTime: parseInt(cookTime),
          dietaryInfo,
          createdBy: user?.id,
          familyId: currentFamily.id,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Response text:', text);
        let errorMessage = "Failed to create recipe";
        try {
          const data = JSON.parse(text);
          errorMessage = data?.error || errorMessage;
          if (data?.details) {
            console.error('Validation errors:', data.details);
          }
        } catch (e) {
          console.error('Failed to parse error response:', text);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Success response:', data);

      toast.success("Recipe created successfully!");
      router.push('/meals?tab=library');
      router.refresh();
    } catch (error) {
      console.error("Failed to create recipe:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create recipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <p className="text-gray-500">Please select a family first</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recipe Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter recipe name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <Select
                label="Select category"
                placeholder="Choose category"
                selectedKeys={[category]}
                onChange={(e) => setCategory(e.target.value)}
              >
                {RECIPE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional details about the recipe..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Servings
                </label>
                <Input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  placeholder="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prep Time (min)
                </label>
                <Input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  placeholder="30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cook Time (min)
                </label>
                <Input
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  placeholder="45"
                  required
                />
              </div>
            </div>
          </div>

          {/* Right Column - Ingredients & Instructions */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ingredients
              </label>
              <div className="space-y-2">
                <Input
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={handleAddIngredient}
                  placeholder="Type an ingredient and press Enter"
                />
                <Card className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient) => (
                      <Chip
                        key={ingredient}
                        onClose={() => handleRemoveIngredient(ingredient)}
                        variant="flat"
                      >
                        {ingredient}
                      </Chip>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instructions
              </label>
              <div className="space-y-2">
                <Input
                  value={instructionInput}
                  onChange={(e) => setInstructionInput(e.target.value)}
                  onKeyDown={handleAddInstruction}
                  placeholder="Type an instruction and press Enter"
                />
                <Card className="p-4">
                  <div className="space-y-2">
                    {instructions.map((instruction, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="font-medium">{index + 1}.</span>
                        <span className="flex-1">{instruction}</span>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onClick={() => handleRemoveInstruction(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dietary Information
              </label>
              <div className="space-y-2">
                <Input
                  value={dietaryInput}
                  onChange={(e) => setDietaryInput(e.target.value)}
                  onKeyDown={handleAddDietaryInfo}
                  placeholder="Type dietary info and press Enter"
                />
                <div className="flex flex-wrap gap-2">
                  {dietaryInfo.map((info) => (
                    <Chip
                      key={info}
                      onClose={() => handleRemoveDietaryInfo(info)}
                      variant="flat"
                      color="secondary"
                    >
                      {info}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            color="danger"
            variant="light"
            onClick={() => router.push('/meals?tab=library')}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            type="submit"
            isLoading={isSubmitting}
          >
            Create Recipe
          </Button>
        </div>
      </form>
    </div>
  );
} 