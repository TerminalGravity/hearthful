"use client";

import { useEventUpdates } from "@/lib/hooks/use-event-updates";
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

interface EventDetailsProps {
  eventId: string;
}

export function EventDetails({ eventId }: EventDetailsProps) {
  const { event, error } = useEventUpdates(eventId);

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="mt-2 text-gray-600">{event.description}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <CalendarIcon className="h-5 w-5" />
          <span>{format(new Date(event.dateTime), "EEEE, MMMM d, yyyy")}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-600">
          <ClockIcon className="h-5 w-5" />
          <span>{format(new Date(event.dateTime), "h:mm a")}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-600">
          <MapPinIcon className="h-5 w-5" />
          <span>{event.location}</span>
        </div>
      </div>

      {event.meals && event.meals.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Meals</h3>
          <ul className="list-disc list-inside space-y-1">
            {event.meals.map((meal) => (
              <li key={meal.id}>{meal.name}</li>
            ))}
          </ul>
        </div>
      )}

      {event.games && event.games.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Games</h3>
          <ul className="list-disc list-inside space-y-1">
            {event.games.map((game) => (
              <li key={game.id}>{game.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 