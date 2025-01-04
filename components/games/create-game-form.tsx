'use client';

import { useState } from 'react';
import { Card, Input, Button, Select, SelectItem, Textarea } from '@nextui-org/react';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface GameFormData {
  name: string;
  description: string;
  minPlayers: string;
  maxPlayers: string;
  duration: string;
  difficulty: string;
  categories: string[];
  image?: File;
}

export function CreateGameForm() {
  const [formData, setFormData] = useState<GameFormData>({
    name: '',
    description: '',
    minPlayers: '',
    maxPlayers: '',
    duration: '',
    difficulty: '',
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const difficulties = [
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' },
  ];

  const durations = [
    { value: '15min', label: '15 minutes' },
    { value: '30min', label: '30 minutes' },
    { value: '45min', label: '45 minutes' },
    { value: '1hour', label: '1 hour' },
    { value: '1.5hour', label: '1.5 hours' },
    { value: '2hours+', label: '2+ hours' },
  ];

  const categories = [
    { value: 'Trivia', label: 'Trivia' },
    { value: 'Educational', label: 'Educational' },
    { value: 'Family', label: 'Family' },
    { value: 'Strategy', label: 'Strategy' },
    { value: 'Card', label: 'Card Game' },
    { value: 'Board', label: 'Board Game' },
    { value: 'Active', label: 'Active Game' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement game creation logic
      console.log('Creating game:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        minPlayers: '',
        maxPlayers: '',
        duration: '',
        difficulty: '',
        categories: [],
      });
      
      // Show success message
      alert('Game created successfully!');
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Game Name"
            placeholder="Enter game name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            isRequired
          />

          <Textarea
            label="Description"
            placeholder="Describe the game..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            isRequired
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Minimum Players"
              placeholder="2"
              value={formData.minPlayers}
              onChange={(e) => setFormData({ ...formData, minPlayers: e.target.value })}
              isRequired
            />

            <Input
              type="number"
              label="Maximum Players"
              placeholder="8"
              value={formData.maxPlayers}
              onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
              isRequired
            />
          </div>

          <Select
            label="Duration"
            placeholder="Select game duration"
            selectedKeys={formData.duration ? [formData.duration] : []}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            isRequired
          >
            {durations.map((duration) => (
              <SelectItem key={duration.value} value={duration.value}>
                {duration.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Difficulty"
            placeholder="Select game difficulty"
            selectedKeys={formData.difficulty ? [formData.difficulty] : []}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            isRequired
          >
            {difficulties.map((difficulty) => (
              <SelectItem key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Categories"
            placeholder="Select game categories"
            selectedKeys={formData.categories}
            onChange={(e) => setFormData({ ...formData, categories: Array.from(e.target.value) })}
            isRequired
            selectionMode="multiple"
          >
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </Select>

          <div className="border-2 border-dashed rounded-lg p-4">
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <PhotoIcon className="h-8 w-8 text-default-400" />
              <span className="text-sm text-default-600">
                Click to upload game image
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData({ ...formData, image: file });
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="flat"
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                minPlayers: '',
                maxPlayers: '',
                duration: '',
                difficulty: '',
                categories: [],
              });
            }}
          >
            Clear
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
          >
            Create Game
          </Button>
        </div>
      </form>
    </Card>
  );
} 