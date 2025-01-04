'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface Event {
  id?: string;
  name: string;
  description: string;
  date: string;
  location: string;
  type: 'meal' | 'game';
  participants: string[];
  details: {
    mealType?: string;
    cuisine?: string;
    dietaryNotes?: string;
    gameType?: string;
    duration?: number;
    equipment?: string[];
  };
  tags: string[];
  familyId?: string;
}

export function useEvents(familyId?: string) {
  const [isLoading, setIsLoading] = useState(false);

  const createEvent = async (event: Event) => {
    if (!familyId) {
      toast.error('Please select a family first.');
      return null;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...event, familyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getEvents = async () => {
    if (!familyId) {
      return [];
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/events?familyId=${familyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    if (!familyId) {
      toast.error('Please select a family first.');
      return null;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!familyId) {
      toast.error('Please select a family first.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent,
    isLoading,
  };
} 