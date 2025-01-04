"use client";

import { useState } from 'react';
import { Tabs, Tab, Select, SelectItem } from '@nextui-org/react';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { EventChat } from '@/components/events/event-chat';
import { EventLibrary } from '@/components/events/event-library';
import { EventFeedback } from '@/components/events/event-feedback';
import CreateEventModal from '@/components/events/create-event-modal';
import {
  CalendarIcon,
  WrenchScrewdriverIcon,
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function EventsPage() {
  const { currentFamily, families } = useCurrentFamily();
  const [selectedTab, setSelectedTab] = useState('create');
  const [selectedToolTab, setSelectedToolTab] = useState('recommendations');

  const handleFamilyChange = (familyId: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('familyId', familyId);
    window.history.pushState(null, '', `?${searchParams.toString()}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Events</h1>
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
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <div className="space-y-2">
              <p className="text-xl font-medium text-gray-700">Select a Family</p>
              <p className="text-sm text-gray-500">
                Please select a family to start planning events together.
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
            {selectedTab === 'create' && (
              <div className="max-w-4xl mx-auto">
                <CreateEventModal 
                  showModal={true}
                  setShowModal={() => setSelectedTab('library')}
                  onSuccess={() => setSelectedTab('library')}
                  defaultFamilyId={currentFamily.id}
                />
              </div>
            )}
            {selectedTab === 'assistant' && <EventChat />}
            {selectedTab === 'tools' && (
              <Tabs
                aria-label="Event planning tools"
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
                <Tab key="recommendations" title="AI Recommendations">
                  <div className="mt-4">
                    {/* AI Recommendations Component */}
                  </div>
                </Tab>
                <Tab key="templates" title="Event Templates">
                  <div className="mt-4">
                    {/* Event Templates Component */}
                  </div>
                </Tab>
                <Tab key="analytics" title="Event Analytics">
                  <div className="mt-4">
                    {/* Event Analytics Component */}
                  </div>
                </Tab>
              </Tabs>
            )}
            {selectedTab === 'library' && <EventLibrary />}
            {selectedTab === 'feedback' && <EventFeedback />}
          </div>
        </div>
      )}
    </div>
  );
} 