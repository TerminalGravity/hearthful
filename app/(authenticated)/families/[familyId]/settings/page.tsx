"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

interface Family {
  id: string;
  name: string;
  description: string;
  members: FamilyMember[];
}

export default function FamilySettingsPage({ params }: { params: { familyId: string } }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const familyId = params.familyId;

  const fetchFamily = useCallback(async () => {
    if (!familyId) return;
    
    try {
      const response = await fetch(`/api/families/${familyId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Family not found");
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to fetch family");
      }
      const data = await response.json();
      setFamily(data);
      
      // Check if current user is admin
      const currentUserMember = data.members.find(
        (member: FamilyMember) => member.email === user?.primaryEmailAddress?.emailAddress
      );
      setIsAdmin(currentUserMember?.role === "ADMIN");
    } catch (error) {
      console.error("Error fetching family:", error);
      toast.error("Failed to load family details");
    } finally {
      setIsLoading(false);
    }
  }, [familyId, user?.primaryEmailAddress?.emailAddress, router]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }

    fetchFamily();
  }, [isLoaded, user, fetchFamily]);

  const handleRemoveMember = async (memberId: string) => {
    if (!isAdmin) {
      toast.error("Only admins can remove members");
      return;
    }

    try {
      const response = await fetch(`/api/families/${familyId}/members/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to remove member");
      }
      
      toast.success("Member removed successfully");
      fetchFamily();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!isAdmin) {
      toast.error("Only admins can update roles");
      return;
    }

    try {
      const response = await fetch(`/api/families/${familyId}/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update role");
      }
      
      toast.success("Role updated successfully");
      fetchFamily();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    }
  };

  const handleDeleteFamily = async () => {
    if (!isAdmin) {
      toast.error("Only admins can delete the family");
      return;
    }

    try {
      const response = await fetch(`/api/families/${familyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete family");
      }
      
      toast.success("Family deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting family:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete family");
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Family not found</h2>
          <p className="text-gray-500 mt-2">This family doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 text-black hover:text-gray-600 transition-colors"
          >
            Return to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{family.name} Settings</h1>
        <p className="text-gray-500 mt-2">{family.description}</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Family Members</h2>
          <div className="space-y-4">
            {family.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                {isAdmin && member.email !== user?.primaryEmailAddress?.emailAddress && (
                  <div className="flex items-center gap-4">
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                      className="rounded-md border border-gray-300 text-sm"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Danger Zone</h2>
            <div className="space-y-4">
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this family? This action cannot be undone.")) {
                    handleDeleteFamily();
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Family
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 