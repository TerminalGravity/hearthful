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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="heading-1">My Families</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateFamilyModal(true)}
            className="button-primary"
          >
            Create Family
          </button>
          <Link
            href="/families/join"
            className="button-secondary"
          >
            Join Family
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                <div className="grid grid-cols-4 gap-4 py-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="text-center space-y-2">
                      <div className="h-8 bg-neutral-200 rounded"></div>
                      <div className="h-4 bg-neutral-200 rounded w-2/3 mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : families.length === 0 ? (
          <div className="card">
            <div className="space-y-2">
              <h3 className="heading-3">Create Your First Family</h3>
              <p className="text-neutral-600">
                Start by creating a family workspace or accepting an invitation
              </p>
            </div>
          </div>
        ) : (
          families.map((family) => (
            <Link
              key={family.id}
              href={`/families/${family.id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="heading-3 mb-2">{family.name}</h3>
                  <p className="text-sm text-neutral-600">{family.description}</p>
                </div>

                <div className="grid grid-cols-4 gap-4 py-4 border-y border-neutral-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{family._count?.members || 0}</div>
                    <div className="text-xs text-neutral-500 mt-1">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{family._count?.events || 0}</div>
                    <div className="text-xs text-neutral-500 mt-1">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{family._count?.meals || 0}</div>
                    <div className="text-xs text-neutral-500 mt-1">Meals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{family._count?.games || 0}</div>
                    <div className="text-xs text-neutral-500 mt-1">Games</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Members Section */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-2">Members</h4>
                    <div className="flex flex-wrap gap-2">
                      {family.members?.map((member) => (
                        <span
                          key={member.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {member.name}
                          {member.role === "ADMIN" && (
                            <span className="ml-1 text-[10px] text-primary-dark">(Admin)</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Events Section */}
                  {family.events && family.events.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Upcoming Events</h4>
                      <div className="space-y-2">
                        {family.events.map((event) => (
                          <div key={event.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-neutral-50">
                            <div>
                              <span className="font-medium text-neutral-800">{event.name}</span>
                              {event.description && (
                                <p className="text-neutral-600 text-xs line-clamp-1">
                                  {event.description}
                                </p>
                              )}
                            </div>
                            <span className="text-neutral-500 whitespace-nowrap ml-4 text-xs">
                              {format(new Date(event.date), "MMM d, h:mm a")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-neutral-200">
                  <span className="text-sm text-primary group-hover:underline">View Details →</span>
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