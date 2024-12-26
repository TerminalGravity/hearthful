"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import CreateEventModal from "@/components/events/create-event-modal";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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

interface Family {
  id: string;
  name: string;
  members: Array<{
    id: string;
    name: string;
  }>;
}

export default function EventsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string>("");
  const [selectedEventType, setSelectedEventType] = useState<"all" | "meal" | "game">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch events
        const eventsResponse = await fetch("/api/events");
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);

        // Fetch families
        const familiesResponse = await fetch("/api/families");
        const familiesData = await familiesResponse.json();
        setFamilies(familiesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredEvents = events.filter((event) => {
    if (selectedFamily && event.family.id !== selectedFamily) {
      return false;
    }
    if (selectedEventType !== "all" && event.type !== selectedEventType) {
      return false;
    }
    return true;
  });

  const selectedDateEvents = filteredEvents.filter(
    (event) =>
      format(new Date(event.date), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd")
  );

  const upcomingEvents = filteredEvents.filter(
    (event) => new Date(event.date) >= new Date()
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-sm text-muted-foreground">
            Manage your family events, meals, and games
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Families</option>
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.name}
              </option>
            ))}
          </select>
          <div className="flex rounded-md shadow-sm" role="group">
            {(["all", "meal", "game"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedEventType(type)}
                className={cn(
                  "px-4 py-2 text-sm font-medium border first:rounded-l-md last:rounded-r-md focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary",
                  selectedEventType === type
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                {type === "all" ? "All Events" : type === "meal" ? "Meals" : "Games"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Create Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-6">
        <div className="col-span-3 space-y-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="font-semibold mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming events
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => setSelectedDate(new Date(event.date))}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {event.type === "meal" ? "🍽️" : "🎮"}
                          </span>
                          <h4 className="font-medium">{event.name}</h4>
                        </div>
                        <p className="text-sm text-gray-500">
                          {format(new Date(event.date), "PPP p")}
                        </p>
                        <p className="text-sm text-gray-500">{event.family.name}</p>
                        {event.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-2">
                          {event.participants.slice(0, 3).map((participant) => (
                            <Avatar key={participant.id} className="h-6 w-6">
                              <AvatarImage
                                src={`https://avatar.vercel.sh/${participant.id}`}
                              />
                              <AvatarFallback>{participant.name[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                          {event.participants.length > 3 && (
                            <span className="text-sm text-gray-500">
                              +{event.participants.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={event.type === "meal" ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {event.type === "meal"
                          ? event.details.mealType
                          : event.details.gameName}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />

              <div className="mt-6">
                <h3 className="font-semibold mb-4">
                  Events on {format(selectedDate, "PPP")}
                </h3>
                <div className="space-y-4">
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No events scheduled for this day
                    </div>
                  ) : (
                    selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 rounded-lg bg-gray-50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {event.type === "meal" ? "🍽️" : "🎮"}
                            </span>
                            <h4 className="font-medium">{event.name}</h4>
                          </div>
                          <Badge
                            variant={event.type === "meal" ? "default" : "secondary"}
                          >
                            {event.type === "meal"
                              ? event.details.mealType
                              : event.details.gameName}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {format(new Date(event.date), "p")}
                        </p>
                        {event.description && (
                          <p className="text-sm text-gray-500">{event.description}</p>
                        )}
                        <div className="pt-2 border-t">
                          <p className="text-sm text-gray-500">
                            Family: {event.family.name}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-gray-500">Host:</span>
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={`https://avatar.vercel.sh/${event.host.id}`}
                              />
                              <AvatarFallback>{event.host.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{event.host.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {event.participants.map((participant) => (
                              <div
                                key={participant.id}
                                className="flex items-center gap-1 text-sm text-gray-500"
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={`https://avatar.vercel.sh/${participant.id}`}
                                  />
                                  <AvatarFallback>
                                    {participant.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{participant.name}</span>
                              </div>
                            ))}
                          </div>
                          {event.type === "meal" && (
                            <div className="mt-2 space-y-1">
                              {event.details.cuisine && (
                                <p className="text-sm text-gray-500">
                                  Cuisine: {event.details.cuisine}
                                </p>
                              )}
                              {event.details.dietaryNotes && (
                                <p className="text-sm text-gray-500">
                                  Dietary Notes: {event.details.dietaryNotes}
                                </p>
                              )}
                            </div>
                          )}
                          {event.type === "game" && (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-500">
                                Players: {event.details.playerCount}
                              </p>
                              {event.details.difficulty && (
                                <p className="text-sm text-gray-500">
                                  Difficulty: {event.details.difficulty}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateEventModal showModal={showCreateModal} setShowModal={setShowCreateModal} />
    </div>
  );
} 