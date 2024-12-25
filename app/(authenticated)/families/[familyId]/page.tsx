"use client";

import { auth } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DeleteFamilyModal from "@/components/families/delete-family-modal";

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
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFamily, setEditedFamily] = useState<{
    name: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    async function fetchFamily() {
      try {
        const response = await fetch(`/api/families/${params.familyId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch family");
        }
        const data = await response.json();
        setFamily(data);
        setEditedFamily({
          name: data.name,
          description: data.description,
        });
      } catch (error) {
        setError("Failed to load family details");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFamily();
  }, [params.familyId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/families/${params.familyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete family");
      }

      router.push("/families");
      router.refresh();
    } catch (error) {
      setError("Failed to delete family. Please try again.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleSave = async () => {
    if (!editedFamily) return;

    try {
      const response = await fetch(`/api/families/${params.familyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedFamily),
      });

      if (!response.ok) {
        throw new Error("Failed to update family");
      }

      const updatedFamily = await response.json();
      setFamily(updatedFamily);
      setIsEditing(false);
    } catch (error) {
      setError("Failed to update family. Please try again.");
    }
  };

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
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editedFamily?.name}
                onChange={(e) =>
                  setEditedFamily({ ...editedFamily!, name: e.target.value })
                }
                className="w-full text-3xl font-bold tracking-tight bg-transparent border-b border-gray-300 focus:border-black focus:outline-none"
              />
              <textarea
                value={editedFamily?.description}
                onChange={(e) =>
                  setEditedFamily({ ...editedFamily!, description: e.target.value })
                }
                className="w-full text-sm text-muted-foreground bg-transparent border border-gray-300 rounded-md p-2 focus:border-black focus:outline-none"
                rows={2}
              />
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{family.name}</h2>
              <p className="text-sm text-muted-foreground">{family.description}</p>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete Family
              </button>
            </>
          )}
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
                      {member.preferences?.dietaryRestrictions && member.preferences.dietaryRestrictions.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Dietary: {member.preferences.dietaryRestrictions.join(", ")}
                        </p>
                      )}
                      {member.preferences?.gamePreferences?.preferredGames && member.preferences.gamePreferences.preferredGames.length > 0 && (
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

      <DeleteFamilyModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        familyName={family.name}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
} 