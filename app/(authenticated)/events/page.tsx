"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import CreateEventModal from "@/components/events/create-event-modal";

export default function EventsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }

    fetchEvents();
  }, [user, isLoaded]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-lg mb-2">{event.name}</h3>
            <p className="text-gray-500 text-sm mb-4">
              {event.family.name}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              {new Date(event.date).toLocaleDateString()} at{" "}
              {new Date(event.date).toLocaleTimeString()}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {event.participants.length} participants
              </span>
              <a
                href={`/events/${event.id}`}
                className="text-black hover:text-gray-600 transition-colors"
              >
                View Details →
              </a>
            </div>
          </div>
        ))}

        {events.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No events found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-black hover:text-gray-600 transition-colors"
            >
              Create your first event →
            </button>
          </div>
        )}
      </div>

      <CreateEventModal 
        showModal={showCreateModal} 
        setShowModal={setShowCreateModal}
        onSuccess={fetchEvents}
      />
    </div>
  );
} 