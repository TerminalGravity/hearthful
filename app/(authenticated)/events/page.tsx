"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import CreateEventModal from "@/components/events/create-event-modal";
import { Button, Card, CardBody, CardHeader, CardFooter, Skeleton, Chip, Divider, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Select, SelectItem } from "@nextui-org/react";
import { CalendarIcon, UsersIcon, ArrowRightIcon, FunnelIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Event {
  id: string;
  name: string;
  date: string;
  family: {
    id: string;
    name: string;
  };
  participants: any[];
  eventType: "meal" | "game";
  mealType?: string;
  gameName?: string;
}

export default function EventsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState<string>("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<"all" | "meal" | "game">("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "family">("date");
  const [families, setFamilies] = useState<{id: string, name: string}[]>([]);

  // Fetch families for filter
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const response = await fetch("/api/families");
        if (!response.ok) throw new Error("Failed to fetch families");
        const data = await response.json();
        setFamilies(data);
      } catch (error) {
        console.error("Error fetching families:", error);
      }
    };

    if (user) {
      fetchFamilies();
    }
  }, [user]);

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

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events];

    // Apply family filter
    if (selectedFamily !== "all") {
      filtered = filtered.filter(event => event.family.id === selectedFamily);
    }

    // Apply event type filter
    if (eventTypeFilter !== "all") {
      filtered = filtered.filter(event => event.eventType === eventTypeFilter);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "family":
          return a.family.name.localeCompare(b.family.name);
        default:
          return 0;
      }
    });
  }, [events, selectedFamily, eventTypeFilter, sortBy]);

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <CardBody className="gap-3">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
                <Skeleton className="h-4 w-2/3 rounded-lg" />
                <Skeleton className="h-4 w-1/3 rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button
          color="primary"
          onPress={() => setShowCreateModal(true)}
          className="font-medium"
        >
          Create Event
        </Button>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select
          label="Family"
          placeholder="Filter by family"
          selectedKeys={[selectedFamily]}
          onChange={(e) => setSelectedFamily(e.target.value)}
          className="w-48"
        >
          <SelectItem key="all" value="all">All Families</SelectItem>
          {families.map((family) => (
            <SelectItem key={family.id} value={family.id}>
              {family.name}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Event Type"
          placeholder="Filter by type"
          selectedKeys={[eventTypeFilter]}
          onChange={(e) => setEventTypeFilter(e.target.value as "all" | "meal" | "game")}
          className="w-48"
        >
          <SelectItem key="all" value="all">All Types</SelectItem>
          <SelectItem key="meal" value="meal">Meals</SelectItem>
          <SelectItem key="game" value="game">Games</SelectItem>
        </Select>

        <Select
          label="Sort By"
          placeholder="Sort events"
          selectedKeys={[sortBy]}
          onChange={(e) => setSortBy(e.target.value as "date" | "name" | "family")}
          className="w-48"
        >
          <SelectItem key="date" value="date">Date</SelectItem>
          <SelectItem key="name" value="name">Name</SelectItem>
          <SelectItem key="family" value="family">Family</SelectItem>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedEvents.map((event) => (
          <Card key={event.id} className="w-full">
            <CardHeader className="flex gap-3">
              <div className="flex flex-col flex-grow">
                <p className="text-lg font-medium">{event.name}</p>
                <p className="text-small text-default-500">{event.family.name}</p>
              </div>
              <Chip
                color={event.eventType === "meal" ? "success" : "warning"}
                variant="flat"
                size="sm"
              >
                {event.eventType === "meal" ? event.mealType : "Game"}
              </Chip>
            </CardHeader>
            <Divider/>
            <CardBody className="py-2">
              <div className="flex items-center gap-2 text-default-500">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-small">
                  {new Date(event.date).toLocaleDateString()} at{" "}
                  {new Date(event.date).toLocaleTimeString([], { 
                    hour: 'numeric', 
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-default-500">
                <UsersIcon className="h-4 w-4" />
                <span className="text-small">
                  {event.participants.length} participants
                </span>
              </div>
            </CardBody>
            <Divider/>
            <CardFooter>
              <Link 
                href={`/events/${event.id}`}
                className="flex items-center gap-1 text-primary hover:opacity-80 transition-opacity"
              >
                View Details
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
        ))}

        {filteredAndSortedEvents.length === 0 && !isLoading && (
          <Card className="col-span-full p-8">
            <CardBody className="py-8 text-center">
              <p className="text-default-500 mb-4">
                {events.length === 0 ? "No events found" : "No events match your filters"}
              </p>
              <Button
                color="primary"
                variant="flat"
                onPress={() => {
                  if (events.length === 0) {
                    setShowCreateModal(true);
                  } else {
                    setSelectedFamily("all");
                    setEventTypeFilter("all");
                    setSortBy("date");
                  }
                }}
                className="mx-auto"
              >
                {events.length === 0 ? "Create your first event" : "Clear filters"}
              </Button>
            </CardBody>
          </Card>
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