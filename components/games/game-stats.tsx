'use client';

import { useState } from 'react';
import { Card, Select, SelectItem, Progress } from '@nextui-org/react';
import {
  TrophyIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface PlayerStats {
  name: string;
  gamesPlayed: number;
  wins: number;
  totalScore: number;
  averageScore: number;
  favoriteGame: string;
  playTime: number;
}

interface GameStats {
  name: string;
  timesPlayed: number;
  averageDuration: number;
  averagePlayers: number;
  highScore: number;
  topPlayer: string;
}

export function GameStats() {
  const [selectedPlayer, setSelectedPlayer] = useState('all');
  const [selectedGame, setSelectedGame] = useState('all');

  const players: PlayerStats[] = [
    {
      name: 'Mom',
      gamesPlayed: 25,
      wins: 12,
      totalScore: 1450,
      averageScore: 58,
      favoriteGame: 'Family Quiz Master',
      playTime: 15.5, // hours
    },
    {
      name: 'Dad',
      gamesPlayed: 20,
      wins: 8,
      totalScore: 1200,
      averageScore: 60,
      favoriteGame: 'Strategy Island',
      playTime: 12, // hours
    },
  ];

  const games: GameStats[] = [
    {
      name: 'Family Quiz Master',
      timesPlayed: 15,
      averageDuration: 45, // minutes
      averagePlayers: 4,
      highScore: 120,
      topPlayer: 'Mom',
    },
    {
      name: 'Strategy Island',
      timesPlayed: 10,
      averageDuration: 60, // minutes
      averagePlayers: 3,
      highScore: 85,
      topPlayer: 'Dad',
    },
  ];

  const playerOptions = [
    { value: 'all', label: 'All Players' },
    ...players.map(player => ({
      value: player.name.toLowerCase(),
      label: player.name,
    })),
  ];

  const gameOptions = [
    { value: 'all', label: 'All Games' },
    ...games.map(game => ({
      value: game.name.toLowerCase().replace(/\s+/g, '-'),
      label: game.name,
    })),
  ];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <Select
            label="Player"
            placeholder="Select player"
            selectedKeys={[selectedPlayer]}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="max-w-xs"
          >
            {playerOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Game"
            placeholder="Select game"
            selectedKeys={[selectedGame]}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="max-w-xs"
          >
            {gameOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrophyIcon className="h-5 w-5 text-warning" />
              <h3 className="text-sm font-semibold">Win Rate</h3>
            </div>
            {players.map((player) => (
              <div key={player.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{player.name}</span>
                  <span>{((player.wins / player.gamesPlayed) * 100).toFixed(1)}%</span>
                </div>
                <Progress
                  value={(player.wins / player.gamesPlayed) * 100}
                  color="warning"
                  size="sm"
                />
              </div>
            ))}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ChartBarIcon className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold">Average Score</h3>
            </div>
            {players.map((player) => (
              <div key={player.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{player.name}</span>
                  <span>{player.averageScore}</span>
                </div>
                <Progress
                  value={(player.averageScore / 100) * 100}
                  color="primary"
                  size="sm"
                />
              </div>
            ))}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="h-5 w-5 text-success" />
              <h3 className="text-sm font-semibold">Play Time</h3>
            </div>
            {players.map((player) => (
              <div key={player.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{player.name}</span>
                  <span>{player.playTime}h</span>
                </div>
                <Progress
                  value={(player.playTime / 20) * 100}
                  color="success"
                  size="sm"
                />
              </div>
            ))}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserGroupIcon className="h-5 w-5 text-secondary" />
              <h3 className="text-sm font-semibold">Games Played</h3>
            </div>
            {players.map((player) => (
              <div key={player.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{player.name}</span>
                  <span>{player.gamesPlayed}</span>
                </div>
                <Progress
                  value={(player.gamesPlayed / 30) * 100}
                  color="secondary"
                  size="sm"
                />
              </div>
            ))}
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => (
            <Card key={game.name} className="p-4">
              <h3 className="text-lg font-semibold mb-4">{game.name}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">Times Played</span>
                  <span className="font-semibold">{game.timesPlayed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">Average Duration</span>
                  <span className="font-semibold">{game.averageDuration} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">Average Players</span>
                  <span className="font-semibold">{game.averagePlayers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">High Score</span>
                  <span className="font-semibold">{game.highScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">Top Player</span>
                  <span className="font-semibold">{game.topPlayer}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
} 