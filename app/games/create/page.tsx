"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { createGame } from "@/app/actions/library";

export default function CreateGamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const familyId = searchParams.get("familyId");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!familyId) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Family ID Required</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Please select a family before adding a game.
          </p>
          <Link
            href="/families"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 mt-4"
          >
            Select Family
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        instructions: formData.get("instructions") as string,
        minPlayers: parseInt(formData.get("minPlayers") as string),
        maxPlayers: parseInt(formData.get("maxPlayers") as string),
        ageRange: formData.get("ageRange") as string,
        category: formData.get("category") as string,
      };

      const game = await createGame(familyId, data);
      router.push(`/games/${game.id}`);
    } catch (error) {
      setError("Failed to create game. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Add Game</h2>
      </div>
      <div className="grid gap-6">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">
                Game Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter game name"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium leading-none">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a category</option>
                <option value="board">Board Games</option>
                <option value="card">Card Games</option>
                <option value="outdoor">Outdoor Games</option>
                <option value="party">Party Games</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="minPlayers" className="text-sm font-medium leading-none">
                  Minimum Players
                </label>
                <input
                  id="minPlayers"
                  name="minPlayers"
                  type="number"
                  min="1"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="maxPlayers" className="text-sm font-medium leading-none">
                  Maximum Players
                </label>
                <input
                  id="maxPlayers"
                  name="maxPlayers"
                  type="number"
                  min="1"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="ageRange" className="text-sm font-medium leading-none">
                Age Range
              </label>
              <input
                id="ageRange"
                name="ageRange"
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g., 8+"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium leading-none">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Describe the game"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="instructions" className="text-sm font-medium leading-none">
                Game Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Write game instructions"
              />
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add Game"}
            </button>
            <Link
              href="/games"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 