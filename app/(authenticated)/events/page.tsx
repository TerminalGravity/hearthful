"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@nextui-org/react";
import CreateEventModal from "@/components/events/create-event-modal";
import { format, isValid, startOfDay, parseISO } from "date-fns";
import { Badge, Button, Avatar, AvatarGroup, Card, CardBody } from "@nextui-org/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  type: "meal" | "game";
  family: {
    id: string;
    name: string;
  };
  participants: Array<{
    id: string;
    name: string;
  }>;
  details: {
    cuisine?: string;
    dietaryNotes?: string;
    gameName?: string;
    playerCount?: string;
    difficulty?: string;
    mealType?: string;
  };
  host: {
    id: string;
    name: string;
  };
}

export default function EventsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch events
    fetch("/api/events")
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to fetch events");
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }
        setEvents(data.map((event: any) => {
          try {
            const date = new Date(event.date);
            if (!isValid(date)) {
              throw new Error("Invalid date");
            }
            return {
              ...event,
              date,
            };
          } catch (error) {
            console.error("Invalid date in event:", event);
            return {
              ...event,
              date: today,
            };
          }
        }));
      })
      .catch((error) => {
        console.error("Failed to fetch events:", error);
        setError(error instanceof Error ? error.message : "Failed to load events");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const eventsOnSelectedDate = events.filter((event) => {
    try {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      return eventDate.getTime() === selected.getTime();
    } catch (error) {
      console.error("Invalid date:", event.date);
      return false;
    }
  });

  const upcomingEvents = events
    .filter((event) => {
      try {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() >= today.getTime();
      } catch (error) {
        console.error("Invalid date for upcoming events filter:", event.date);
        return false;
      }
    })
    .sort((a, b) => {
      try {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      } catch (error) {
        console.error("Invalid date for sorting:", a.date, b.date);
        return 0;
      }
    });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      setSelectedDate(newDate);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-sm text-muted-foreground">
            Schedule and manage your family events
          </p>
        </div>
        <Button
          color="primary"
          onPress={() => setShowCreateModal(true)}
        >
          Create Event
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[400px,1fr]">
        {/* Calendar Card */}
        <div className="space-y-6">
          <Card>
            <CardBody>
              <Calendar
                className="w-full"
                color="primary"
                onChange={handleDateSelect}
              />
            </CardBody>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardBody>
              <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
              {upcomingEvents.length === 0 ? (
                <p className="text-center text-gray-500">No upcoming events</p>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg bg-default-100 hover:bg-default-200 transition-colors cursor-pointer"
                      onClick={() => handleDateSelect(event.date)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {event.type === "meal" ? "🍽️" : "🎮"} {event.name}
                          </h4>
                          <p className="text-sm text-default-600 mt-1">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-default-600">{event.family.name}</p>
                        </div>
                        <Badge
                          color={event.type === "meal" ? "warning" : "secondary"}
                          variant="flat"
                        >
                          {event.type === "meal" ? event.details.mealType : "Game"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          <Card>
            <CardBody>
              <h3 className="text-xl font-semibold mb-4">
                Events on {selectedDate.toLocaleDateString()}
              </h3>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-default-100 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : eventsOnSelectedDate.length === 0 ? (
                <p className="text-center text-gray-500">No events scheduled for this day</p>
              ) : (
                <div className="space-y-4">
                  {eventsOnSelectedDate.map((event) => (
                    <div key={event.id} className="p-4 rounded-lg bg-default-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{event.name}</h3>
                          <p className="text-sm text-default-600 mt-1">
                            {new Date(event.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                          </p>
                          <p className="mt-2">{event.description}</p>
                          <div className="mt-4">
                            <Badge
                              color={event.type === "meal" ? "warning" : "secondary"}
                              variant="flat"
                            >
                              {event.type === "meal" ? "🍽️ Meal" : "🎮 Game"}
                            </Badge>
                            {event.type === "meal" && event.details.mealType && (
                              <Badge color="default" variant="flat" className="ml-2">
                                {event.details.mealType}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium mb-2">Host</p>
                          <Avatar
                            src={`https://avatar.vercel.sh/${event.host.id}`}
                            name={event.host.name}
                            size="sm"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Participants</p>
                        <AvatarGroup max={5}>
                          {event.participants.map((participant) => (
                            <Avatar
                              key={participant.id}
                              src={`https://avatar.vercel.sh/${participant.id}`}
                              name={participant.name}
                              size="sm"
                            />
                          ))}
                        </AvatarGroup>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <CreateEventModal
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
      />
    </div>
  );
} 