"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateEventModal from "@/components/events/create-event-modal";
import EventList from "@/components/events/event-list";
import type { Event, Family, FamilyMember, User } from "@prisma/client";

type EventWithRelations = Event & {
  family: Pick<Family, "id" | "name">;
  participants: (Pick<FamilyMember, "id" | "userId" | "name" | "email" | "role">)[];
  host: Pick<User, "id" | "email" | "displayName">;
};

interface EventsClientProps {
  initialEvents: EventWithRelations[];
}

export default function EventsClient({ initialEvents }: EventsClientProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState(initialEvents);

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Create Event
        </button>
      </div>

      <EventList 
        events={events}
        isLoading={false}
        onCreateClick={() => setShowCreateModal(true)}
      />

      <CreateEventModal 
        showModal={showCreateModal} 
        setShowModal={setShowCreateModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
} 