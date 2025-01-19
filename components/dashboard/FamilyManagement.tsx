"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCreateFamilyModal } from "@/components/families/create-family-modal";

interface Family {
  id: string;
  name: string;
  _count: {
    members: number;
  };
}

export default function FamilyManagement() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { CreateFamilyModal, setShowCreateFamilyModal } = useCreateFamilyModal();

  useEffect(() => {
    async function fetchFamilies() {
      try {
        const response = await fetch("/api/families");
        if (!response.ok) throw new Error("Failed to fetch families");
        const data = await response.json();
        setFamilies(data);
      } catch (error) {
        console.error("Error fetching families:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFamilies();
  }, []);

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Families</h2>
          <button
            onClick={() => setShowCreateFamilyModal(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Create a New Family
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-neutral-100 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : families.length === 0 ? (
          <div className="text-center py-6 bg-neutral-50 rounded-lg">
            <p className="text-neutral-600 mb-4">No families yet</p>
            <button
              onClick={() => setShowCreateFamilyModal(true)}
              className="inline-flex items-center justify-center text-primary hover:text-primary/90"
            >
              Create your first family →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {families.map((family) => (
              <Link
                key={family.id}
                href={`/families/${family.id}`}
                className="block p-3 rounded-lg border hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{family.name}</h3>
                    <p className="text-sm text-neutral-500">
                      {family._count.members} members
                    </p>
                  </div>
                  <span className="text-primary">View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <CreateFamilyModal />
    </>
  );
} 