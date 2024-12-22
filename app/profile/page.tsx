"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState({
    events: true,
    photos: true,
    meals: false,
    games: true,
  });

  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "en",
    emailFrequency: "daily",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/user/preferences");
        if (!response.ok) throw new Error("Failed to fetch preferences");
        
        const data = await response.json();
        setPreferences({
          theme: data.theme,
          language: data.language,
          emailFrequency: data.emailFrequency,
        });
        setNotifications(JSON.parse(data.notifications));
      } catch (error) {
        console.error("Error fetching preferences:", error);
        toast.error("Failed to load preferences");
      }
    };

    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...preferences,
          notifications,
        }),
      });

      if (!response.ok) throw new Error("Failed to save preferences");
      
      toast.success("Preferences saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your Hearthful account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Profile Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">Profile Information</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                placeholder={user.fullName || ""}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                placeholder={user.primaryEmailAddress?.emailAddress || ""}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">Notifications</h2>
          <div className="mt-4 space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key} updates
                </span>
                <button
                  onClick={() =>
                    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    value ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                      value ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">Preferences</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, theme: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, language: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Frequency
              </label>
              <select
                value={preferences.emailFrequency}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    emailFrequency: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
              >
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="col-span-full">
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-full bg-black px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
} 