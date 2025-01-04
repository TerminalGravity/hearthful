'use client';

import { useState } from 'react';
import { Card, Select, SelectItem, Chip, Avatar } from '@nextui-org/react';
import { CalendarDaysIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface GameSession {
  id: string;
  gameName: string;
  date: string;
  duration: string;
  players: {
    name: string;
    avatar?: string;
    score?: number;
    winner?: boolean;
  }[];
  notes?: string;
}

export function GameHistory() {
  const [timeFilter, setTimeFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [sessions, setSessions] = useState<GameSession[]>([
    {
      id: '1',
      gameName: 'Family Quiz Master',
      date: '2024-01-15',
      duration: '45 minutes',
      players: [
        { name: 'Mom', score: 120, winner: true },
        { name: 'Dad', score: 95 },
        { name: 'Sarah', score: 85 },
        { name: 'Tom', score: 75 },
      ],
      notes: 'Great family night! Mom dominated the history questions.',
    },
    {
      id: '2',
      gameName: 'Strategy Island',
      date: '2024-01-14',
      duration: '60 minutes',
      players: [
        { name: 'Dad', winner: true },
        { name: 'Tom' },
        { name: 'Sarah' },
      ],
      notes: 'Dad\'s resource management strategy was unbeatable!',
    },
  ]);

  const timeFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  const games = [
    { value: 'all', label: 'All Games' },
    { value: 'quiz', label: 'Family Quiz Master' },
    { value: 'strategy', label: 'Strategy Island' },
  ];

  const filteredSessions = sessions.filter(session => {
    if (gameFilter !== 'all' && session.gameName !== games.find(g => g.value === gameFilter)?.label) {
      return false;
    }
    // Add time filtering logic here
    return true;
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <Select
            label="Time Period"
            placeholder="Select time period"
            selectedKeys={[timeFilter]}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="max-w-xs"
          >
            {timeFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Game"
            placeholder="Select game"
            selectedKeys={[gameFilter]}
            onChange={(e) => setGameFilter(e.target.value)}
            className="max-w-xs"
          >
            {games.map((game) => (
              <SelectItem key={game.value} value={game.value}>
                {game.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{session.gameName}</h3>
                  <div className="flex items-center gap-2 text-sm text-default-600">
                    <CalendarDaysIcon className="h-4 w-4" />
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-default-600">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {session.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="h-4 w-4" />
                    {session.players.length} players
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {session.players.map((player, index) => (
                    <Chip
                      key={index}
                      variant="flat"
                      color={player.winner ? 'warning' : 'default'}
                      avatar={
                        <Avatar
                          size="sm"
                          src={player.avatar}
                          fallback={player.name[0]}
                        />
                      }
                    >
                      {player.name}
                      {player.score !== undefined && ` - ${player.score}`}
                      {player.winner && ' 👑'}
                    </Chip>
                  ))}
                </div>

                {session.notes && (
                  <p className="text-sm text-default-600 italic">
                    "{session.notes}"
                  </p>
                )}
              </div>
            </Card>
          ))}

          {filteredSessions.length === 0 && (
            <div className="text-center text-default-400 py-8">
              No game sessions found for the selected filters.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 