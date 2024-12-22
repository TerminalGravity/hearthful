"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { createEvent } from "@/app/actions/event";

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const familyId = searchParams.get("familyId");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!familyId) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Family ID Required</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Please select a family before creating an event.
          </p>
          <Link
            href="/families"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 mt-4"
          >
            Select Family
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const data = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        startTime: formData.get("date") as string,
        endTime: formData.get("endTime") as string,
        location: formData.get("location") as string,
      };

      const createdEvent = await createEvent(familyId, data);
      router.push(`/events/${createdEvent.id}`);
    } catch (error) {
      setError("Failed to create event. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Event</h2>
      </div>
      <div className="grid gap-6">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium leading-none">
                Event Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter event title"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="date" className="text-sm font-medium leading-none">
                Date & Time
              </label>
              <input
                id="date"
                name="date"
                type="datetime-local"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="endTime" className="text-sm font-medium leading-none">
                End Time (Optional)
              </label>
              <input
                id="endTime"
                name="endTime"
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="location" className="text-sm font-medium leading-none">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter event location"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium leading-none">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Describe your event"
              />
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Event"}
            </button>
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 