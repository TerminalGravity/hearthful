'use client';

import { useState, useEffect } from 'react';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { useEvents } from '@/hooks/use-events';
import { toast } from 'sonner';
import {
  Card,
  Button,
  Chip,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import {
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  TagIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Event {
  id: string;
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
}

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-primary">{event.name}</h3>
          <p className="text-sm text-gray-600">{event.description}</p>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light">
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Event actions">
            <DropdownItem
              key="edit"
              startContent={<PencilIcon className="h-4 w-4" />}
              onClick={() => onEdit(event)}
            >
              Edit
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<TrashIcon className="h-4 w-4" />}
              onClick={() => onDelete(event.id)}
            >
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <ClockIcon className="h-4 w-4" />
          <span>{format(new Date(event.date), 'PPp')}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPinIcon className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <UserGroupIcon className="h-4 w-4" />
          <span>{event.participants.length} participants</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <TagIcon className="h-4 w-4" />
          <span>{event.type}</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {event.tags.map((tag, i) => (
          <Chip 
            key={i} 
            size="sm" 
            variant="flat" 
            color="primary"
            classNames={{
              base: "bg-primary-100",
              content: "text-primary-700 font-medium",
            }}
          >
            {tag}
          </Chip>
        ))}
      </div>

      <div className="space-y-4">
        {event.type === 'meal' && (
          <>
            <div>
              <h4 className="font-medium mb-2 text-primary-700">Meal Details</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li className="text-gray-700">Type: {event.details.mealType}</li>
                {event.details.cuisine && (
                  <li className="text-gray-700">Cuisine: {event.details.cuisine}</li>
                )}
                {event.details.dietaryNotes && (
                  <li className="text-gray-700">Dietary Notes: {event.details.dietaryNotes}</li>
                )}
              </ul>
            </div>
          </>
        )}
        {event.type === 'game' && (
          <>
            <div>
              <h4 className="font-medium mb-2 text-primary-700">Game Details</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li className="text-gray-700">Type: {event.details.gameType}</li>
                {event.details.duration && (
                  <li className="text-gray-700">Duration: {event.details.duration} minutes</li>
                )}
                {event.details.equipment && event.details.equipment.length > 0 && (
                  <li className="text-gray-700">
                    Equipment: {event.details.equipment.join(', ')}
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export function EventLibrary() {
  const { currentFamily } = useCurrentFamily();
  const { getEvents, updateEvent, deleteEvent, isLoading } = useEvents(currentFamily?.id);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (currentFamily?.id) {
      loadEvents();
    }
  }, [currentFamily?.id]);

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events. Please try again.');
    }
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    // TODO: Open edit modal
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast.success('Event deleted successfully');
      loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event. Please try again.');
    }
  };

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-xl">
        <div className="text-center space-y-4">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <div className="space-y-2">
            <p className="text-xl font-medium text-gray-700">Select a Family</p>
            <p className="text-sm text-gray-500">
              Please select a family to view events.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-xl">
        <div className="text-center space-y-4">
          <TagIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <div className="space-y-2">
            <p className="text-xl font-medium text-gray-700">No Events Yet</p>
            <p className="text-sm text-gray-500">
              Create your first event to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      ))}
    </div>
  );
} 