"use client";

import { auth, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useCreateFamilyModal } from "@/components/families/create-family-modal";
import { useEffect, useState } from "react";

interface Family {
  id: string;
  name: string;
  description: string;
  _count: {
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="rounded-xl border bg-card text-card-foreground shadow animate-pulse">
            <div className="p-6 flex flex-col space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : families.length === 0 ? (
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-col space-y-2">
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
              className="rounded-xl border bg-card text-card-foreground shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6 flex flex-col space-y-2">
                <h3 className="font-semibold leading-none tracking-tight">{family.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{family.description}</p>
                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                  <span>{family._count.members} members</span>
                  <span>{family._count.events} events</span>
                  <span>{family._count.meals} meals</span>
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