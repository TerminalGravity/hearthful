import { Event, Family, FamilyMember } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";

type EventWithRelations = Event & {
  family: Family;
  participants: FamilyMember[];
  host: {
    id: string;
    email: string;
    displayName?: string | null;
  };
};

interface EventListProps {
  events: EventWithRelations[];
  isLoading?: boolean;
  onCreateClick?: () => void;
}

export default function EventList({ events, isLoading, onCreateClick }: EventListProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No events found</p>
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="text-black hover:text-gray-600 transition-colors"
          >
            Create your first event →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white dark:bg-neutral-900 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-lg">{event.name}</h3>
            <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800">
              {event.type}
            </span>
          </div>
          
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">
            {event.family.name}
          </p>
          
          <div className="space-y-2 mb-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-300 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {format(new Date(event.date), "PPP")}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 flex items-center">
              <ClockIcon className="w-4 h-4 mr-2" />
              {format(new Date(event.date), "p")}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              Host: {event.host.displayName || event.host.email}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {event.participants.length} participants
            </span>
            <Link
              href={`/events/${event.id}`}
              className="text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors inline-flex items-center"
            >
              View Details
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
} 