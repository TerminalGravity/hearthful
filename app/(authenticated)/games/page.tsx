'use client';

import { useState } from 'react';
import { Tabs, Tab } from '@nextui-org/react';
import FamilySelectorDropdown from "@/components/families/family-selector-dropdown";
import { GameChat } from '@/components/games/game-chat';
import { GameLibrary } from '@/components/games/game-library';
import { CreateGameForm } from '@/components/games/create-game-form';
import { GameRecommender } from '@/components/games/game-recommender';
import { GameHistory } from '@/components/games/game-history';
import { GameStats } from '@/components/games/game-stats';
import {
  PuzzlePieceIcon,
  WrenchScrewdriverIcon,
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  PlusIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function GamesPage() {
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>();
  const [selectedTab, setSelectedTab] = useState('create');
  const [selectedToolTab, setSelectedToolTab] = useState('recommender');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Games</h1>
        <div className="w-full max-w-sm">
          <FamilySelectorDropdown
            selectedFamilyId={selectedFamilyId}
            onFamilySelect={setSelectedFamilyId}
          />
        </div>
      </div>

      {!selectedFamilyId ? (
        <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-xl">
          <div className="text-center space-y-4">
            <PuzzlePieceIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <div className="space-y-2">
              <p className="text-xl font-medium text-gray-700">Select a Family</p>
              <p className="text-sm text-gray-500">
                Please select a family to start playing games together.
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
              <WrenchScrewdriverIcon className="h-4 w-4" />
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
            {selectedTab === 'create' && <CreateGameForm familyId={selectedFamilyId} />}
            {selectedTab === 'assistant' && <GameChat familyId={selectedFamilyId} />}
            {selectedTab === 'tools' && (
              <Tabs
                aria-label="Game planning tools"
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
                  key="recommender"
                  title={
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="h-4 w-4" />
                      <span>Game Recommender</span>
                    </div>
                  }
                >
                  <div className="mt-4">
                    <GameRecommender familyId={selectedFamilyId} />
                  </div>
                </Tab>
                <Tab
                  key="history"
                  title={
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>Game History</span>
                    </div>
                  }
                >
                  <div className="mt-4">
                    <GameHistory familyId={selectedFamilyId} />
                  </div>
                </Tab>
                <Tab
                  key="stats"
                  title={
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="h-4 w-4" />
                      <span>Game Stats</span>
                    </div>
                  }
                >
                  <div className="mt-4">
                    <GameStats familyId={selectedFamilyId} />
                  </div>
                </Tab>
              </Tabs>
            )}
            {selectedTab === 'library' && <GameLibrary familyId={selectedFamilyId} />}
            {selectedTab === 'feedback' && (
              <div className="mt-4 p-4 text-center text-gray-500 border-2 border-dashed rounded-lg">
                Share your thoughts and suggestions to help us improve the gaming experience.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 