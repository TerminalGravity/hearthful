'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function UserSettings() {
  const { user } = useUser();
  const [preferences] = useState({
    mealPreferences: ['Italian', 'Asian', 'Vegetarian'],
    gamePreferences: ['Board Games', 'Trivia', 'Card Games'],
    recentEvents: 3,
    recentPhotos: 5,
  });

  return (
    <div className="space-y-6">
      {/* User Profile Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative h-16 w-16">
            <img
              src={user?.imageUrl || '/default-avatar.png'}
              alt="Profile"
              className="rounded-full object-cover w-full h-full"
            />
            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-400" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">{user?.fullName}</h2>
            <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        <Link 
          href="/profile" 
          className="block text-sm text-blue-600 hover:text-blue-500 font-medium"
        >
          Edit Profile Settings →
        </Link>
      </div>

      {/* Preferences Overview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-display text-lg font-semibold mb-4">Your Preferences</h3>
        
        {/* Meal Preferences */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Meal Preferences</h4>
          <div className="flex flex-wrap gap-2">
            {preferences.mealPreferences.map((pref) => (
              <span 
                key={pref}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {pref}
              </span>
            ))}
          </div>
        </div>

        {/* Game Preferences */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Game Preferences</h4>
          <div className="flex flex-wrap gap-2">
            {preferences.gamePreferences.map((pref) => (
              <span 
                key={pref}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {pref}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Activity Stats */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Recent Activity</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-semibold">{preferences.recentEvents}</div>
              <div className="text-xs text-gray-500">Events This Month</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-semibold">{preferences.recentPhotos}</div>
              <div className="text-xs text-gray-500">Photos Shared</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-display text-lg font-semibold mb-4">AI Suggestions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-700">Meal Recommendations</div>
              <div className="text-sm text-gray-500">Get personalized recipe ideas</div>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-green-500">
              <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-700">Game Suggestions</div>
              <div className="text-sm text-gray-500">Discover new family activities</div>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-green-500">
              <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 