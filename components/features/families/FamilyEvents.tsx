"use client";

import { useState } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import CreateEventModal from "@/components/events/create-event-modal";

interface FamilyEventsProps {
  events: any[];
  familyId: string;
}

export default function FamilyEvents({ events, familyId }: FamilyEventsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (events.length === 0) {
    return (
      <>
        <EmptyState
          icon={<CalendarIcon className="h-12 w-12" />}
          title="No events scheduled"
          description="Get started by creating your first family event"
          action={{
            label: "Schedule an event",
            onClick: () => setShowCreateModal(true),
          }}
        />
        <CreateEventModal 
          showModal={showCreateModal} 
          setShowModal={setShowCreateModal}
          defaultFamilyId={familyId}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{event.name}</h3>
              <p className="text-sm text-gray-500">
                {formatDate(event.date)}
              </p>
              {event.location && (
                <p className="text-sm text-gray-500">
                  📍 {event.location}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {event.participants.length} participants
              </p>
            </div>
            <a
              href={`/events/${event.id}`}
              className="text-black hover:text-gray-600 transition-colors"
            >
              View →
            </a>
          </div>
        </div>
      ))}
      
      <div className="text-center">
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-block text-black hover:text-gray-600 transition-colors"
        >
          Schedule another event →
        </button>
      </div>

      <CreateEventModal 
        showModal={showCreateModal} 
        setShowModal={setShowCreateModal}
        defaultFamilyId={familyId}
      />
    </div>
  );
} 