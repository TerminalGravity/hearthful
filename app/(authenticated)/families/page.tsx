"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useCreateFamilyModal } from "@/components/families/create-family-modal";
import { useEffect, useState } from "react";
import { format } from "date-fns";

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  description: string | null;
}

interface Family {
  id: string;
  name: string;
  description: string;
  members: FamilyMember[];
  events: Event[];
  _count: {
    members: number;
    events: number;
    meals: number;
    games: number;
  };
}

export default function FamiliesPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { CreateFamilyModal, setShowCreateFamilyModal } = useCreateFamilyModal();
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSignedIn && isLoaded) {
      redirect("/sign-in");
    }
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    async function fetchFamilies() {
      try {
        const response = await fetch("/api/families");
        if (!response.ok) {
          throw new Error("Failed to fetch families");
        }
        const data = await response.json();
        setFamilies(data);
      } catch (error) {
        setError("Failed to load families");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isSignedIn) {
      fetchFamilies();
    }
  }, [isSignedIn]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Families</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateFamilyModal(true)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Create Family
          </button>
          <Link
            href="/families/join"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            Join Family
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <div className="rounded-xl border bg-card text-card-foreground shadow animate-pulse">
            <div className="p-8 flex flex-col space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : families.length === 0 ? (
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-8 flex flex-col space-y-2">
              <h3 className="font-semibold leading-none tracking-tight">Create Your First Family</h3>
              <p className="text-sm text-muted-foreground">
                Start by creating a family workspace or accepting an invitation
              </p>
            </div>
          </div>
        ) : (
          families.map((family) => (
            <Link
              key={family.id}
              href={`/families/${family.id}`}
              className="rounded-xl border bg-card text-card-foreground shadow hover:shadow-md transition-all hover:scale-[1.02]"
            >
              <div className="p-8 flex flex-col space-y-6">
                <div>
                  <h3 className="text-xl font-semibold leading-none tracking-tight mb-2">{family.name}</h3>
                  <p className="text-sm text-muted-foreground">{family.description}</p>
                </div>

                <div className="grid grid-cols-4 gap-4 py-4 border-y">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{family._count?.members || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{family._count?.events || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{family._count?.meals || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Meals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{family._count?.games || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Games</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Members Section */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Members</h4>
                    <div className="flex flex-wrap gap-2">
                      {family.members?.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span>{member.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Events Section */}
                  {family.events && family.events.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Upcoming Events</h4>
                      <div className="space-y-2">
                        {family.events.map((event) => (
                          <div key={event.id} className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-medium">{event.name}</span>
                              {event.description && (
                                <p className="text-muted-foreground text-xs line-clamp-1">
                                  {event.description}
                                </p>
                              )}
                            </div>
                            <span className="text-muted-foreground whitespace-nowrap ml-4">
                              {format(new Date(event.date), "MMM d, h:mm a")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end pt-2 border-t">
                  <span className="text-sm text-muted-foreground">View Details →</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      <CreateFamilyModal />
    </div>
  );
} 