"use client";

import { useState } from 'react';
import { Tabs, Tab, Select, SelectItem } from '@nextui-org/react';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { EventChat } from '@/components/events/event-chat';
import { EventPlanner } from '@/components/events/event-planner';
import { EventLibrary } from '@/components/events/event-library';
import { EventFeedback } from '@/components/events/event-feedback';
import {
  CalendarIcon,
  WrenchScrewdriverIcon,
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';

export default function EventsPage() {
  const { currentFamily, families } = useCurrentFamily();
  const [selectedTab, setSelectedTab] = useState('create');
  const [selectedToolTab, setSelectedToolTab] = useState('plan');

  const handleFamilyChange = (familyId: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('familyId', familyId);
    window.history.pushState(null, '', `?${searchParams.toString()}`);
  };

  const handleEventGenerated = () => {
    // Switch to the library tab to show the saved event
    setSelectedTab('library');
  };

  const handleEventScheduled = () => {
    // Switch to the library tab to show the saved event
    setSelectedTab('library');
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Events</h1>
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
        <Tabs
          aria-label="Event sections"
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key.toString())}
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-6",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-2 h-12",
            tabContent: "group-data-[selected=true]:text-primary",
          }}
        >
          <Tab
            key="create"
            title={
              <div className="flex items-center gap-2">
                <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
                <span>Create</span>
              </div>
            }
          >
            <EventChat 
              onEventGenerated={handleEventGenerated}
              onEventScheduled={handleEventScheduled}
            />
          </Tab>

          <Tab
            key="tools"
            title={
              <div className="flex items-center gap-2">
                <WrenchScrewdriverIcon className="h-4 w-4" />
                <span>Tools</span>
              </div>
            }
          >
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
              <Tab
                key="plan"
                title={
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Event Planner</span>
                  </div>
                }
              >
                <div className="mt-4">
                  <EventPlanner onEventScheduled={handleEventScheduled} />
                </div>
              </Tab>
            </Tabs>
          </Tab>

          <Tab
            key="library"
            title={
              <div className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4" />
                <span>Library</span>
              </div>
            }
          >
            <EventLibrary />
          </Tab>

          <Tab
            key="feedback"
            title={
              <div className="flex items-center gap-2">
                <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
                <span>Feedback</span>
              </div>
            }
          >
            <EventFeedback />
          </Tab>
        </Tabs>
      )}
    </div>
  );
} 