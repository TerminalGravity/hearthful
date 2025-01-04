'use client';

import { useState } from 'react';
import { Tabs, Tab, Select, SelectItem } from '@nextui-org/react';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { PhotoChat } from '@/components/photos/photo-chat';
import { PhotoLibrary } from '@/components/photos/photo-library';
import { CreateAlbumForm } from '@/components/photos/create-album-form';
import { PhotoUploader } from '@/components/photos/photo-uploader';
import { SmartAlbums } from '@/components/photos/smart-albums';
import { PhotoEnhancer } from '@/components/photos/photo-enhancer';
import { PhotoStories } from '@/components/photos/photo-stories';
import {
  PhotoIcon,
  WrenchScrewdriverIcon,
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  PlusIcon,
  SparklesIcon,
  Square2StackIcon,
  BookmarkIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';

export default function PhotosPage() {
  const { currentFamily, families } = useCurrentFamily();
  const [selectedTab, setSelectedTab] = useState('create');
  const [selectedToolTab, setSelectedToolTab] = useState('enhance');

  const handleFamilyChange = (familyId: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('familyId', familyId);
    window.history.pushState(null, '', `?${searchParams.toString()}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Photos</h1>
        <Select
          label="Family"
          placeholder="Select a family"
          selectedKeys={currentFamily ? [currentFamily.id] : []}
          onChange={(e) => handleFamilyChange(e.target.value)}
          className="max-w-xs"
        >
          {families?.map((family) => (
            <SelectItem key={family.id} value={family.id}>
              {family.name}
            </SelectItem>
          ))}
        </Select>
      </div>

      {!currentFamily ? (
        <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-xl">
          <div className="text-center space-y-4">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <div className="space-y-2">
              <p className="text-xl font-medium text-gray-700">Select a Family</p>
              <p className="text-sm text-gray-500">
                Please select a family to start sharing photos together.
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
              <span>Upload</span>
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
            {selectedTab === 'create' && (
              <div className="space-y-6">
                <PhotoUploader />
                <CreateAlbumForm />
              </div>
            )}
            {selectedTab === 'assistant' && <PhotoChat />}
            {selectedTab === 'tools' && (
              <Tabs
                aria-label="Photo tools"
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
                  key="enhance"
                  title={
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="h-4 w-4" />
                      <span>Enhance Photos</span>
                    </div>
                  }
                >
                  <div className="mt-4">
                    <PhotoEnhancer />
                  </div>
                </Tab>
                <Tab
                  key="smart-albums"
                  title={
                    <div className="flex items-center gap-2">
                      <Square2StackIcon className="h-4 w-4" />
                      <span>Smart Albums</span>
                    </div>
                  }
                >
                  <div className="mt-4">
                    <SmartAlbums />
                  </div>
                </Tab>
                <Tab
                  key="stories"
                  title={
                    <div className="flex items-center gap-2">
                      <VideoCameraIcon className="h-4 w-4" />
                      <span>Photo Stories</span>
                    </div>
                  }
                >
                  <div className="mt-4">
                    <PhotoStories />
                  </div>
                </Tab>
              </Tabs>
            )}
            {selectedTab === 'library' && <PhotoLibrary />}
            {selectedTab === 'feedback' && (
              <div className="mt-4 p-4 text-center text-gray-500 border-2 border-dashed rounded-lg">
                Share your thoughts and suggestions to help us improve the photo sharing experience.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 