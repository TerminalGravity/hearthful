"use client";

import { auth } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { createFamily } from "@/app/actions/family";

export default function CreateFamilyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
      };

      const family = await createFamily(data);
      router.push(`/families/${family.id}`);
    } catch (error) {
      setError("Failed to create family. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Family</h2>
      </div>
      <div className="grid gap-6">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">
                Family Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter your family name"
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
                placeholder="Tell us about your family"
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
              {isLoading ? "Creating..." : "Create Family"}
            </button>
            <Link
              href="/families"
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