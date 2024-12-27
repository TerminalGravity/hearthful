"use client";

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Avatar } from "@nextui-org/react";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface CreateFamilyModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

interface FamilyMember {
  email: string;
  name: string;
  preferences: string;
  isEditing?: boolean;
  isAdmin?: boolean;
}

interface EditMemberModalProps {
  member: FamilyMember;
  onSave: (updatedMember: FamilyMember) => void;
  onClose: () => void;
  isOpen: boolean;
}

function EditMemberModal({ member, onSave, onClose, isOpen }: EditMemberModalProps) {
  const [editedMember, setEditedMember] = useState<FamilyMember>(member);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>Edit Family Member</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Name"
              value={editedMember.name}
              onChange={(e) => setEditedMember({ ...editedMember, name: e.target.value })}
              placeholder="Member name"
            />
            <Input
              label="Email"
              type="email"
              value={editedMember.email}
              onChange={(e) => setEditedMember({ ...editedMember, email: e.target.value })}
              placeholder="Member email"
            />
            <Input
              label="Preferences"
              value={editedMember.preferences}
              onChange={(e) => setEditedMember({ ...editedMember, preferences: e.target.value })}
              placeholder="e.g., monopoly, uno, gluten free"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button 
            color="primary"
            onPress={() => {
              onSave(editedMember);
              onClose();
            }}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function CreateFamilyModal({
  showModal,
  setShowModal,
}: CreateFamilyModalProps) {
  const router = useRouter();
  const { user } = useUser();
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Initialize with current user as admin when modal opens
  useEffect(() => {
    if (user && showModal) {
      const currentUserMember = {
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || user.firstName || "",
        preferences: "",
        isAdmin: true,
      };
      
      setMembers(prevMembers => {
        // Only add the current user if they're not already in the list
        const isUserAlreadyAdded = prevMembers.some(
          member => member.email === currentUserMember.email
        );
        if (!isUserAlreadyAdded) {
          return [currentUserMember];
        }
        return prevMembers;
      });
    }
  }, [user, showModal]);

  const handleAddMember = () => {
    if (currentMember.email && currentMember.name) {
      // Check if member already exists
      const memberExists = members.some(
        member => member.email.toLowerCase() === currentMember.email.toLowerCase()
      );

      if (memberExists) {
        toast.error("A member with this email already exists");
        return;
      }

      setMembers([...members, { ...currentMember, isAdmin: false }]);
      setCurrentMember({
        email: "",
        name: "",
        preferences: "",
      });
    }
  };

  const handleEditMember = (member: FamilyMember) => {
    if (member.isAdmin) {
      toast.error("Cannot edit the admin member");
      return;
    }
    setEditingMember(member);
    setShowEditModal(true);
  };

  const handleUpdateMember = (updatedMember: FamilyMember) => {
    setMembers(members.map(member => 
      member.email === updatedMember.email ? { ...updatedMember, isAdmin: member.isAdmin } : member
    ));
  };

  const handleRemoveMember = (memberToRemove: FamilyMember) => {
    if (memberToRemove.isAdmin) {
      toast.error("Cannot remove the admin member");
      return;
    }
    setMembers(members.filter(member => member.email !== memberToRemove.email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName) {
      toast.error("Please enter a family name");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a family");
      return;
    }

    if (members.length === 0) {
      toast.error("Please add at least one family member");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formattedMembers = members.map(member => {
        const dietaryRestrictions = member.preferences
          .toLowerCase()
          .split(",")
          .filter(pref => pref.includes("free") || pref.includes("tarian"))
          .map(pref => pref.trim());

        const preferredGames = member.preferences
          .toLowerCase()
          .split(",")
          .filter(pref => !pref.includes("free") && !pref.includes("tarian"))
          .map(pref => pref.trim());

        return {
          email: member.email,
          name: member.name,
          preferences: {
            dietaryRestrictions,
            gamePreferences: {
              preferredGames
            }
          }
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create family");
      }

      toast.success("Family created successfully!");
      setShowModal(false);
      
      // Force a hard refresh of the page
      const currentPath = window.location.pathname;
      await router.push(currentPath);
      router.refresh();
      
    } catch (error) {
      console.error("Failed to create family:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create family. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-2xl font-bold">Create Family Group</h3>
                <p className="text-sm text-gray-500">
                  Create your family group and add members
                </p>
              </ModalHeader>
              
              <ModalBody>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      label="Family Name"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      placeholder="Enter family name"
                      isRequired
                      isDisabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Textarea
                      label="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your family group"
                      rows={2}
                      isDisabled={isLoading}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Family Members</h4>
                      <Button
                        color="primary"
                        variant="light"
                        onPress={() => {
                          setCurrentMember({
                            email: "",
                            name: "",
                            preferences: "",
                          });
                          setShowEditModal(true);
                          setEditingMember(null);
                        }}
                      >
                        Add Member
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {members.map((member, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "flex items-center justify-between p-3 bg-white rounded-md shadow-sm",
                            member.isAdmin && "border-l-4 border-primary"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar
                              src={`https://avatar.vercel.sh/${member.email}`}
                              fallback={member.name[0]}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium">
                                {member.name}
                                {member.isAdmin && " (Admin)"}
                              </p>
                              <p className="text-sm text-gray-500">{member.email}</p>
                              {member.preferences && (
                                <p className="text-sm text-gray-500">{member.preferences}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              color="primary"
                              variant="light"
                              onClick={() => handleEditMember(member)}
                              size="sm"
                              isDisabled={member.isAdmin}
                            >
                              Edit
                            </Button>
                            <Button
                              color="danger"
                              variant="light"
                              onClick={() => handleRemoveMember(member)}
                              size="sm"
                              isDisabled={member.isAdmin}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </ModalBody>
              
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary"
                  onClick={handleSubmit}
                  isLoading={isLoading}
                >
                  Create Family
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <EditMemberModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        member={editingMember || currentMember}
        onSave={(updatedMember) => {
          if (editingMember) {
            handleUpdateMember(updatedMember);
          } else {
            setMembers([...members, { ...updatedMember, isAdmin: false }]);
          }
        }}
      />
    </>
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