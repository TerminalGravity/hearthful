"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, Tab } from '@nextui-org/react';
import FamilySelectorDropdown from "@/components/families/family-selector-dropdown";
import { PhotoChat } from '@/components/photos/photo-chat';
import { PhotoLibrary } from '@/components/photos/photo-library';
import { PhotoUpload } from '@/components/photos/photo-upload';
import { SmartAlbums } from '@/components/photos/smart-albums';
import {
  PhotoIcon,
  WrenchScrewdriverIcon,
  BookOpenIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function PhotosPage() {
  const searchParams = useSearchParams();
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(
    searchParams.get('familyId') || ''
  );
  const [selectedTab, setSelectedTab] = useState('upload');
  const [selectedToolTab, setSelectedToolTab] = useState('enhance');

  // Update selectedFamilyId when URL changes
  useEffect(() => {
    const familyId = searchParams.get('familyId');
    if (familyId) {
      setSelectedFamilyId(familyId);
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Photos</h1>
        <FamilySelectorDropdown
          selectedFamilyId={selectedFamilyId}
          onFamilySelect={setSelectedFamilyId}
        />
      </div>

      {!selectedFamilyId ? (
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
              onClick={() => setSelectedTab('upload')}
              className={`flex items-center gap-2 px-2 py-3 border-b-2 ${
                selectedTab === 'upload' ? 'border-primary text-primary' : 'border-transparent'
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
          </div>

          <div className="py-6">
            {selectedTab === 'upload' && <PhotoUpload familyId={selectedFamilyId} />}
            {selectedTab === 'assistant' && <PhotoChat familyId={selectedFamilyId} />}
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
                <Tab key="enhance" title="Photo Enhancement">
                  <div className="mt-4">
                    {/* Photo Enhancement Component */}
                  </div>
                </Tab>
                <Tab key="albums" title="Smart Albums">
                  <div className="mt-4">
                    <SmartAlbums familyId={selectedFamilyId} />
                  </div>
                </Tab>
                <Tab key="stories" title="Photo Stories">
                  <div className="mt-4">
                    {/* Photo Stories Component */}
                  </div>
                </Tab>
              </Tabs>
            )}
            {selectedTab === 'library' && <PhotoLibrary familyId={selectedFamilyId} />}
          </div>
        </div>
      )}
    </div>
  );
} 