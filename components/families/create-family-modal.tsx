"use client";

import { useState } from "react";
import Modal from "@/components/shared/modal";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";

interface CreateFamilyModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

interface FamilyMember {
  email: string;
  name: string;
  preferences: string; // Free-form text for both dietary and games
  isEditing?: boolean;
}

export default function CreateFamilyModal({
  showModal,
  setShowModal,
}: CreateFamilyModalProps) {
  const router = useRouter();
  const [familyName, setFamilyName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [currentMember, setCurrentMember] = useState<FamilyMember>({
    email: "",
    name: "",
    preferences: "",
  });

  const handleAddMember = () => {
    if (currentMember.email && currentMember.name) {
      setMembers([...members, { ...currentMember, isEditing: false }]);
      setCurrentMember({
        email: "",
        name: "",
        preferences: "",
      });
    }
  };

  const handleEditMember = (index: number) => {
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], isEditing: true };
    setMembers(updatedMembers);
  };

  const handleUpdateMember = (index: number, updatedMember: FamilyMember) => {
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMember, isEditing: false };
    setMembers(updatedMembers);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Transform the free-form preferences into structured data
      const formattedMembers = members.map(member => {
        const preferences = member.preferences.toLowerCase();
        return {
          email: member.email,
          name: member.name,
          dietaryRestrictions: preferences
            .split(",")
            .filter(pref => pref.includes("free") || pref.includes("tarian"))
            .map(pref => pref.trim()),
          gamePreferences: {
            preferredGames: preferences
              .split(",")
              .filter(pref => !pref.includes("free") && !pref.includes("tarian"))
              .map(pref => pref.trim()),
          },
        };
      });

      const response = await fetch("/api/families", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: familyName,
          description,
          members: formattedMembers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create family");
      }

      const family = await response.json();
      
      // Close the modal first
      setShowModal(false);
      
      // Navigate to families page and refresh in one go
      router.push("/families", { forceRefresh: true });
    } catch (error) {
      setError("Failed to create family. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal showModal={showModal} setShowModal={setShowModal}>
      <div className="w-full overflow-hidden md:max-w-md md:rounded-2xl md:border md:border-gray-100 md:shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 bg-white px-4 py-6 pt-8 text-center md:px-16">
          <h3 className="font-display text-2xl font-bold">Create Family Group</h3>
          <p className="text-sm text-gray-500">
            Create your family group and add members
          </p>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-left text-gray-700">
                Family Name
              </label>
              <input
                type="text"
                id="name"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter family name"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-left text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Describe your family group"
                rows={2}
                disabled={isLoading}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 text-left">Family Members</h4>
              
              {/* Add new member form */}
              <div className="space-y-3 bg-gray-50 p-3 rounded-md mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={currentMember.name}
                    onChange={(e) =>
                      setCurrentMember({ ...currentMember, name: e.target.value })
                    }
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    value={currentMember.email}
                    onChange={(e) =>
                      setCurrentMember({ ...currentMember, email: e.target.value })
                    }
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={currentMember.preferences}
                    onChange={(e) =>
                      setCurrentMember({ ...currentMember, preferences: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Preferences (e.g., monopoly, uno, gluten-free)"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={!currentMember.email || !currentMember.name}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  Add Member
                </button>
              </div>

              {/* Member list */}
              {members.length > 0 && (
                <div className="space-y-2">
                  {members.map((member, index) => (
                    <div
                      key={index}
                      className="bg-white border rounded-md p-3 space-y-2"
                    >
                      {member.isEditing ? (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => {
                                const updatedMember = { ...member, name: e.target.value };
                                handleUpdateMember(index, updatedMember);
                              }}
                              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                              placeholder="Name"
                            />
                            <input
                              type="email"
                              value={member.email}
                              onChange={(e) => {
                                const updatedMember = { ...member, email: e.target.value };
                                handleUpdateMember(index, updatedMember);
                              }}
                              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                              placeholder="Email"
                            />
                          </div>
                          <input
                            type="text"
                            value={member.preferences}
                            onChange={(e) => {
                              const updatedMember = { ...member, preferences: e.target.value };
                              handleUpdateMember(index, updatedMember);
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Preferences"
                          />
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{member.name}</h5>
                              <p className="text-sm text-gray-500">{member.email}</p>
                              {member.preferences && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {member.preferences}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditMember(index)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
                {error}
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                disabled={isLoading || members.length === 0}
              >
                {isLoading ? "Creating..." : "Create Family"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}

export function useCreateFamilyModal() {
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);

  const CreateFamilyModalCallback = () => {
    return (
      <CreateFamilyModal
        showModal={showCreateFamilyModal}
        setShowModal={setShowCreateFamilyModal}
      />
    );
  };

  return {
    setShowCreateFamilyModal,
    CreateFamilyModal: CreateFamilyModalCallback,
  };
} 