"use client";

import { useEventUpdates } from "@/lib/hooks/use-event-updates";
import { updateRSVP } from "@/app/actions/event";
import { useState } from "react";

interface RSVPListProps {
  eventId: string;
  currentUserId: string;
}

export function RSVPList({ eventId, currentUserId }: RSVPListProps) {
  const { event, error } = useEventUpdates(eventId);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

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
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  const currentUserRSVP = event.rsvps.find((rsvp) => rsvp.userId === currentUserId);

  const handleRSVP = async (status: "YES" | "NO" | "MAYBE") => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      await updateRSVP(eventId, status);
    } catch (error) {
      setUpdateError("Failed to update RSVP. Please try again.");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const rsvpCounts = {
    YES: event.rsvps.filter((rsvp) => rsvp.status === "YES").length,
    NO: event.rsvps.filter((rsvp) => rsvp.status === "NO").length,
    MAYBE: event.rsvps.filter((rsvp) => rsvp.status === "MAYBE").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">RSVPs</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleRSVP("YES")}
            disabled={isUpdating}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentUserRSVP?.status === "YES"
                ? "bg-green-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Going ({rsvpCounts.YES})
          </button>
          <button
            onClick={() => handleRSVP("MAYBE")}
            disabled={isUpdating}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentUserRSVP?.status === "MAYBE"
                ? "bg-yellow-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Maybe ({rsvpCounts.MAYBE})
          </button>
          <button
            onClick={() => handleRSVP("NO")}
            disabled={isUpdating}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentUserRSVP?.status === "NO"
                ? "bg-red-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Not Going ({rsvpCounts.NO})
          </button>
        </div>
      </div>

      {updateError && (
        <div className="text-sm text-red-500">
          {updateError}
        </div>
      )}

      <div className="space-y-4">
        {event.rsvps.length > 0 ? (
          event.rsvps.map((rsvp) => (
            <div
              key={rsvp.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                {rsvp.user.avatarUrl && (
                  <img
                    src={rsvp.user.avatarUrl}
                    alt={rsvp.user.displayName || rsvp.user.email}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">
                    {rsvp.user.displayName || rsvp.user.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {rsvp.status === "YES"
                      ? "Going"
                      : rsvp.status === "MAYBE"
                      ? "Maybe"
                      : "Not Going"}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No RSVPs yet</p>
        )}
      </div>
    </div>
  );
} 