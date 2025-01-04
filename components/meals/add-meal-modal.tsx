'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Textarea,
} from '@nextui-org/react';
import { useRecipes } from '@/hooks/use-recipes';

type AddMealModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (mealData: {
    recipeId: string;
    date: Date;
    mealType: string;
    servings: number;
    notes?: string;
  }) => void;
  date: Date;
};

const mealTypes = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snack', value: 'snack' },
];

export function AddMealModal({ isOpen, onClose, onAdd, date }: AddMealModalProps) {
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [mealType, setMealType] = useState('');
  const [servings, setServings] = useState('4');
  const [notes, setNotes] = useState('');
  const { recipes, isLoading } = useRecipes();

  const handleSubmit = () => {
    if (!selectedRecipe || !mealType || !servings) return;

    onAdd({
      recipeId: selectedRecipe,
      date,
      mealType,
      servings: parseInt(servings),
      notes: notes.trim() || undefined,
    });

    // Reset form
    setSelectedRecipe('');
    setMealType('');
    setServings('4');
    setNotes('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Add Meal to Plan</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Select
              label="Recipe"
              placeholder="Select a recipe"
              selectedKeys={selectedRecipe ? [selectedRecipe] : []}
              onChange={(e) => setSelectedRecipe(e.target.value)}
            >
              {recipes?.map((recipe: any) => (
                <SelectItem key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Meal Type"
              placeholder="Select meal type"
              selectedKeys={mealType ? [mealType] : []}
              onChange={(e) => setMealType(e.target.value)}
            >
              {mealTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </Select>

            <Input
              type="number"
              label="Servings"
              placeholder="4"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />

            <Textarea
              label="Notes"
              placeholder="Add any notes about this meal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            Add to Plan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 