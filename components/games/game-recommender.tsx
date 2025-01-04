'use client';

import { useState } from 'react';
import { Card, Select, SelectItem, Button, Chip } from '@nextui-org/react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface GameRecommendation {
  name: string;
  description: string;
  reason: string;
  difficulty: string;
  duration: string;
  playerCount: string;
}

export function GameRecommender() {
  const [preferences, setPreferences] = useState({
    playerCount: '',
    duration: '',
    difficulty: '',
    interests: [] as string[],
    mood: '',
  });
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const playerCounts = [
    { value: '2', label: '2 players' },
    { value: '3-4', label: '3-4 players' },
    { value: '5-6', label: '5-6 players' },
    { value: '7+', label: '7+ players' },
  ];

  const durations = [
    { value: 'quick', label: 'Quick (15-30 mins)' },
    { value: 'medium', label: 'Medium (30-60 mins)' },
    { value: 'long', label: 'Long (60+ mins)' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy - Good for beginners' },
    { value: 'medium', label: 'Medium - Some strategy required' },
    { value: 'hard', label: 'Hard - Complex rules and strategy' },
  ];

  const interests = [
    { value: 'trivia', label: 'Trivia & Knowledge' },
    { value: 'strategy', label: 'Strategy & Planning' },
    { value: 'creativity', label: 'Creativity & Expression' },
    { value: 'action', label: 'Action & Movement' },
    { value: 'social', label: 'Social & Party' },
    { value: 'educational', label: 'Educational' },
  ];

  const moods = [
    { value: 'competitive', label: 'Competitive' },
    { value: 'cooperative', label: 'Cooperative' },
    { value: 'relaxed', label: 'Relaxed' },
    { value: 'energetic', label: 'Energetic' },
  ];

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement AI recommendation logic
      // For now, using mock data
      const mockRecommendations: GameRecommendation[] = [
        {
          name: 'Family Quiz Master',
          description: 'An engaging trivia game with customizable categories.',
          reason: 'Matches your interest in trivia and preference for medium difficulty.',
          difficulty: 'Medium',
          duration: '30-45 minutes',
          playerCount: '3-8 players',
        },
        {
          name: 'Strategy Island',
          description: 'A strategic board game about resource management and planning.',
          reason: 'Perfect for your group size and interest in strategy games.',
          difficulty: 'Medium',
          duration: '45-60 minutes',
          playerCount: '2-6 players',
        },
      ];

      await new Promise(resolve => setTimeout(resolve, 1500));
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Number of Players"
            placeholder="Select player count"
            selectedKeys={preferences.playerCount ? [preferences.playerCount] : []}
            onChange={(e) => setPreferences({ ...preferences, playerCount: e.target.value })}
          >
            {playerCounts.map((count) => (
              <SelectItem key={count.value} value={count.value}>
                {count.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Game Duration"
            placeholder="Select preferred duration"
            selectedKeys={preferences.duration ? [preferences.duration] : []}
            onChange={(e) => setPreferences({ ...preferences, duration: e.target.value })}
          >
            {durations.map((duration) => (
              <SelectItem key={duration.value} value={duration.value}>
                {duration.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <Select
          label="Difficulty Level"
          placeholder="Select game difficulty"
          selectedKeys={preferences.difficulty ? [preferences.difficulty] : []}
          onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value })}
        >
          {difficulties.map((difficulty) => (
            <SelectItem key={difficulty.value} value={difficulty.value}>
              {difficulty.label}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Interests"
          placeholder="Select interests"
          selectedKeys={preferences.interests}
          onChange={(e) => setPreferences({ ...preferences, interests: Array.from(e.target.value) })}
          selectionMode="multiple"
        >
          {interests.map((interest) => (
            <SelectItem key={interest.value} value={interest.value}>
              {interest.label}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Preferred Mood"
          placeholder="Select game mood"
          selectedKeys={preferences.mood ? [preferences.mood] : []}
          onChange={(e) => setPreferences({ ...preferences, mood: e.target.value })}
        >
          {moods.map((mood) => (
            <SelectItem key={mood.value} value={mood.value}>
              {mood.label}
            </SelectItem>
          ))}
        </Select>

        <div className="flex justify-center">
          <Button
            color="primary"
            size="lg"
            onClick={handleGetRecommendations}
            isLoading={isLoading}
            startContent={!isLoading && <SparklesIcon className="h-4 w-4" />}
          >
            Get Recommendations
          </Button>
        </div>

        {recommendations.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="text-xl font-semibold">Recommended Games</h3>
            <div className="space-y-4">
              {recommendations.map((game, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold">{game.name}</h4>
                    <p className="text-sm text-default-600">{game.description}</p>
                    <p className="text-sm text-primary">{game.reason}</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip size="sm" variant="flat">{game.playerCount}</Chip>
                      <Chip size="sm" variant="flat">{game.duration}</Chip>
                      <Chip size="sm" variant="flat">{game.difficulty}</Chip>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 