'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface Feedback {
  id?: string;
  rating: number;
  enjoyment: 'positive' | 'negative';
  comments: string;
  suggestions: string;
  eventId: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  user?: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
}

export function useFeedback() {
  const [isLoading, setIsLoading] = useState(false);

  const submitFeedback = async (feedback: Omit<Feedback, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getFeedback = async (eventId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/feedback?eventId=${eventId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch feedback');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitFeedback,
    getFeedback,
    isLoading,
  };
} 