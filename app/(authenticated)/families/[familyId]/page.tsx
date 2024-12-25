"use client";

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: string;
  preferences?: {
    dietaryRestrictions?: string[];
    gamePreferences?: {
      preferredGames?: string[];
    };
  };
}

interface Family {
  id: string;
  name: string;
  description: string;
  members: FamilyMember[];
  _count: {
    events: number;
    meals: number;
    games: number;
  };
}

export default function FamilyPage({ params }: { params: { familyId: string } }) {
  const [family, setFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFamily() {
      try {
        const response = await fetch(`/api/families/${params.familyId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch family");
        }
        const data = await response.json();
        setFamily(data);
      } catch (error) {
        setError("Failed to load family details");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFamily();
  }, [params.familyId]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !family) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="rounded-lg bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-2 text-sm text-red-700">{error || "Family not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{family.name}</h2>
          <p className="text-sm text-muted-foreground">{family.description}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="font-semibold">Members</h3>
            <p className="text-2xl font-bold">{family.members.length}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="font-semibold">Events</h3>
            <p className="text-2xl font-bold">{family._count.events}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="font-semibold">Meals</h3>
            <p className="text-2xl font-bold">{family._count.meals}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="font-semibold">Games</h3>
            <p className="text-2xl font-bold">{family._count.games}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <h3 className="font-semibold mb-4">Family Members</h3>
          <div className="space-y-4">
            {family.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
              >
                <div>
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-gray-500">{member.email}</p>
                  {member.preferences && (
                    <div className="mt-2">
                      {member.preferences.dietaryRestrictions?.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Dietary: {member.preferences.dietaryRestrictions.join(", ")}
                        </p>
                      )}
                      {member.preferences.gamePreferences?.preferredGames?.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Games: {member.preferences.gamePreferences.preferredGames.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 