"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { BillingSection } from "@/components/subscription/BillingSection";

interface UserPreferences {
  displayName: string;
  email: string;
  theme: string;
  language: string;
  emailFrequency: string;
  eventsUpdates: boolean;
  photosUpdates: boolean;
  mealsUpdates: boolean;
  gamesUpdates: boolean;
}

export default function ProfilePage() {
  const { user } = useUser();
  const [preferences, setPreferences] = useState<UserPreferences>({
    displayName: "",
    email: "",
    theme: "system",
    language: "en",
    emailFrequency: "daily",
    eventsUpdates: true,
    photosUpdates: true,
    mealsUpdates: true,
    gamesUpdates: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/user/preferences");
        if (!response.ok) throw new Error("Failed to load preferences");
        const data = await response.json();
        setPreferences({
          displayName: data.displayName || user?.firstName || "",
          email: data.email || user?.emailAddresses?.[0]?.emailAddress || "",
          theme: data.theme || "system",
          language: data.language || "en",
          emailFrequency: data.emailFrequency || "daily",
          eventsUpdates: data.eventsUpdates ?? true,
          photosUpdates: data.photosUpdates ?? true,
          mealsUpdates: data.mealsUpdates ?? true,
          gamesUpdates: data.gamesUpdates ?? true,
        });
      } catch (error) {
        console.error("Error loading preferences:", error);
        toast.error("Failed to load preferences");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadPreferences();
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      
      if (!response.ok) throw new Error("Failed to save preferences");
      toast.success("Preferences saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="font-display text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

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
                value={preferences.displayName}
                onChange={(e) => setPreferences({ ...preferences, displayName: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={preferences.email}
                onChange={(e) => setPreferences({ ...preferences, email: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Billing Section */}
        <BillingSection />

        {/* Notification Settings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">Notifications</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Events Updates</span>
              <button
                onClick={() => setPreferences({ ...preferences, eventsUpdates: !preferences.eventsUpdates })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  preferences.eventsUpdates ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    preferences.eventsUpdates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Photos Updates</span>
              <button
                onClick={() => setPreferences({ ...preferences, photosUpdates: !preferences.photosUpdates })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  preferences.photosUpdates ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    preferences.photosUpdates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Meals Updates</span>
              <button
                onClick={() => setPreferences({ ...preferences, mealsUpdates: !preferences.mealsUpdates })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  preferences.mealsUpdates ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    preferences.mealsUpdates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Games Updates</span>
              <button
                onClick={() => setPreferences({ ...preferences, gamesUpdates: !preferences.gamesUpdates })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  preferences.gamesUpdates ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    preferences.gamesUpdates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
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
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
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
                onChange={(e) => setPreferences({ ...preferences, emailFrequency: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
              >
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="rounded-full bg-black px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900"
      >
        Save Changes
      </button>
    </div>
  );
} 