'use client';

import { useState } from 'react';
import { Card, Input, Button, Chip } from '@nextui-org/react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface Game {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  categories: string[];
  imageUrl?: string;
}

export function GameLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [games, setGames] = useState<Game[]>([
    {
      id: '1',
      name: 'Family Trivia',
      description: 'A fun trivia game for the whole family',
      minPlayers: 2,
      maxPlayers: 8,
      duration: '30 mins',
      difficulty: 'Easy',
      categories: ['Trivia', 'Educational', 'Family'],
    },
    // Add more sample games here
  ]);

  const categories = ['Trivia', 'Educational', 'Family', 'Strategy', 'Card', 'Board', 'Active'];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategories = selectedCategories.length === 0 ||
      selectedCategories.some(cat => game.categories.includes(cat));
    return matchesSearch && matchesCategories;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search games..."
          startContent={<MagnifyingGlassIcon className="h-4 w-4 text-default-400" />}
          className="max-w-xs"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <FunnelIcon className="h-4 w-4 text-default-400" />
          {categories.map((category) => (
            <Chip
              key={category}
              variant="flat"
              isSelected={selectedCategories.includes(category)}
              onClick={() => {
                setSelectedCategories(prev =>
                  prev.includes(category)
                    ? prev.filter(c => c !== category)
                    : [...prev, category]
                );
              }}
              className="cursor-pointer"
            >
              {category}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.map((game) => (
          <Card key={game.id} className="p-4">
            {game.imageUrl && (
              <div className="aspect-video mb-4">
                <img
                  src={game.imageUrl}
                  alt={game.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{game.name}</h3>
              <p className="text-sm text-default-600">{game.description}</p>
              <div className="flex flex-wrap gap-2">
                <Chip size="sm" variant="flat">
                  {game.minPlayers}-{game.maxPlayers} Players
                </Chip>
                <Chip size="sm" variant="flat">{game.duration}</Chip>
                <Chip
                  size="sm"
                  color={
                    game.difficulty === 'Easy'
                      ? 'success'
                      : game.difficulty === 'Medium'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {game.difficulty}
                </Chip>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {game.categories.map((category) => (
                  <Chip key={category} size="sm" variant="dot">
                    {category}
                  </Chip>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center text-default-400 py-8">
          No games found matching your criteria.
        </div>
      )}
    </div>
  );
} 