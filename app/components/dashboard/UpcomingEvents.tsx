import React from 'react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

export default function UpcomingEvents() {
  // This would typically come from your backend
  const events: Event[] = [
    {
      id: '1',
      title: 'Family BBQ',
      date: 'Aug 15',
      time: '4:00 PM',
      location: 'Central Park'
    },
    {
      id: '2',
      title: 'Birthday Party',
      date: 'Aug 20',
      time: '2:00 PM',
      location: 'Home'
    },
    // Add more sample events as needed
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold">Upcoming Events</h2>
        <Link 
          href="/events/new" 
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Add event
        </Link>
      </div>
      <div className="space-y-4">
        {events.map((event) => (
          <div 
            key={event.id} 
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-12 text-center">
              <div className="font-medium text-gray-900">{event.date}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{event.title}</p>
              <p className="text-sm text-gray-500">
                {event.time} • {event.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 