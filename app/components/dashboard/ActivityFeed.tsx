import React from 'react';

interface Activity {
  id: string;
  type: string;
  content: string;
  timestamp: string;
}

export default function ActivityFeed() {
  // This would typically come from your backend
  const activities: Activity[] = [
    {
      id: '1',
      type: 'event',
      content: 'New family gathering added',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'photo',
      content: 'New photos added to Summer BBQ album',
      timestamp: '5 hours ago'
    },
    // Add more sample activities as needed
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="font-display text-xl font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 text-sm">
            <div className="rounded-full bg-gray-100 p-2">
              {/* You can add different icons based on activity type */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-gray-900">{activity.content}</p>
              <p className="text-gray-500 text-xs">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 