"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import CreateEventModal from "@/components/events/create-event-modal";

interface Event {
  id: string;
  name: string;
  date: string;
  type: string;
  family: {
    name: string;
  };
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
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
    }

    fetchEvents();
  }, []);

  const handleEventCreated = () => {
    // Refresh the events list
    fetch("/api/events")
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(error => console.error("Error refreshing events:", error));
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-sm text-primary hover:text-primary-hover"
          >
            Create New Event
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-neutral-100 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-6 bg-neutral-50 rounded-lg">
            <p className="text-neutral-600 mb-4">No upcoming events</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-primary hover:text-primary-hover"
            >
              Create your first event →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block p-3 rounded-lg border hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{event.name}</h3>
                    <p className="text-sm text-neutral-500">
                      {format(new Date(event.date), "MMM d, h:mm a")} · {event.family.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {event.type}
                    </span>
                    <span className="text-primary">View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateEventModal
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        onSuccess={handleEventCreated}
      />
    </>
  );
} 