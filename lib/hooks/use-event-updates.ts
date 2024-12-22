"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

interface RSVP {
  id: string;
  userId: string;
  status: "YES" | "NO" | "MAYBE";
  user: User;
}

interface Meal {
  id: string;
  name: string;
}

interface Game {
  id: string;
  name: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  rsvps: RSVP[];
  meals?: Meal[];
  games?: Game[];
}

interface EventUpdatesHookResult {
  event: Event | null;
  error: string | null;
}

export function useEventUpdates(eventId: string): EventUpdatesHookResult {
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/events/${eventId}/live`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setEvent(data);
        setError(null);
      } catch (error) {
        console.error("[EVENT_UPDATE_ERROR]", error);
        setError("Failed to parse event update");
      }
    };

    eventSource.onerror = () => {
      console.error("[EVENT_SOURCE_ERROR]");
      setError("Failed to connect to event updates");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [eventId]);

  return { event, error };
} 