"use client";

import { auth } from "@clerk/nextjs";

export default async function ProfilePage() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your Hearthful preferences and settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">Notifications</h2>
          <p className="mt-1 text-sm text-gray-600">
            Configure how you want to receive updates
          </p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Email Notifications</label>
                <p className="text-sm text-gray-600">
                  Receive updates about events and family activities
                </p>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Push Notifications</label>
                <p className="text-sm text-gray-600">
                  Get instant notifications on your device
                </p>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" defaultChecked />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">Privacy</h2>
          <p className="mt-1 text-sm text-gray-600">
            Control your profile visibility and sharing preferences
          </p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Public Profile</label>
                <p className="text-sm text-gray-600">
                  Allow other family members to find you
                </p>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Share Activity</label>
                <p className="text-sm text-gray-600">
                  Show your activity in family feeds
                </p>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" defaultChecked />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">Theme</h2>
          <p className="mt-1 text-sm text-gray-600">
            Customize your app appearance
          </p>
          <div className="mt-6">
            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black">
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">Language</h2>
          <p className="mt-1 text-sm text-gray-600">
            Choose your preferred language
          </p>
          <div className="mt-6">
            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="rounded-full bg-black px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900">
          Save Changes
        </button>
      </div>
    </div>
  );
} 