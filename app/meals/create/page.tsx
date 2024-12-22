"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { createMeal } from "@/app/actions/library";

export default function CreateMealPage() {
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
            Please select a family before adding a meal.
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
        ingredients: (formData.get("ingredients") as string).split("\n").filter(Boolean),
        instructions: formData.get("instructions") as string,
        category: formData.get("category") as string,
      };

      const meal = await createMeal(familyId, data);
      router.push(`/meals/${meal.id}`);
    } catch (error) {
      setError("Failed to create meal. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Add Meal</h2>
      </div>
      <div className="grid gap-6">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">
                Meal Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter meal name"
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
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="asian">Asian</option>
                <option value="american">American</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium leading-none">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Describe your meal"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="ingredients" className="text-sm font-medium leading-none">
                Ingredients
              </label>
              <textarea
                id="ingredients"
                name="ingredients"
                required
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="List ingredients (one per line)"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="instructions" className="text-sm font-medium leading-none">
                Cooking Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Write cooking instructions"
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
              {isLoading ? "Adding..." : "Add Meal"}
            </button>
            <Link
              href="/meals"
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