import React from 'react';
import Link from 'next/link';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export default function QuickActions() {
  const actions = [
    {
      name: "Create Event",
      description: "Schedule a new family gathering",
      href: "/events/new",
      icon: "📅",
    },
    {
      name: "Add Photos",
      description: "Share memories with your family",
      href: "/photos/upload",
      icon: "📸",
    },
    {
      name: "Plan Meal",
      description: "Add a new recipe or meal plan",
      href: "/meals/new",
      icon: "🍽️",
    },
    {
      name: "Add Game",
      description: "Suggest a family game",
      href: "/games/new",
      icon: "🎮",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <a
            key={action.name}
            href={action.href}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <span className="text-2xl mb-2">{action.icon}</span>
            <h3 className="font-medium text-sm">{action.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{action.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
} 