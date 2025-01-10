"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import CreateMemberModal from "./CreateMemberModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFamiliesStore } from "@/hooks/use-families";

interface CreateFamilyModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

interface FamilyMember {
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  dietaryRestrictions: string[];
  gamePreferences: string[];
  notes: string;
}

export default function CreateFamilyModal({
  showModal,
  setShowModal,
}: CreateFamilyModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const refreshFamilies = useFamiliesStore(state => state.fetchFamilies);
  const [familyName, setFamilyName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [tempFamilyId] = useState("temp-id");

  // Initialize with current user as admin when modal opens
  useEffect(() => {
    if (user && showModal) {
      const currentUserMember = {
        name: user.fullName || user.firstName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        role: "ADMIN" as const,
        dietaryRestrictions: [],
        gamePreferences: [],
        notes: "",
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
      const response = await fetch("/api/families", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: familyName,
          description,
          members,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create family");
      }

      toast.success("Family created successfully!");
      setShowModal(false);
      
      // Refresh the families list
      await refreshFamilies();
      
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
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Family Group</DialogTitle>
            <DialogDescription>
              Create your family group and add members
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="familyName">Family Name</Label>
                <Input
                  id="familyName"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Enter family name"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your family group"
                  rows={2}
                  disabled={isLoading}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <Label>Family Members</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddMemberModal(true)}
                    disabled={isLoading}
                  >
                    Add Member
                  </Button>
                </div>

                <div className="space-y-3">
                  {members.map((member, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "flex items-center justify-between p-3 bg-background rounded-md border",
                        member.role === "ADMIN" && "border-l-4 border-primary"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${member.email}`} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.name}
                            {member.role === "ADMIN" && " (Admin)"}
                          </p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          {member.dietaryRestrictions.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              Dietary: {member.dietaryRestrictions.join(", ")}
                            </p>
                          )}
                          {member.gamePreferences.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              Games: {member.gamePreferences.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      {member.role !== "ADMIN" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setMembers(members.filter((_, i) => i !== index))}
                          disabled={isLoading}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Family"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CreateMemberModal
        showModal={showAddMemberModal}
        setShowModal={setShowAddMemberModal}
        familyId={tempFamilyId}
        onSuccess={(member) => {
          setMembers([...members, member]);
          setShowAddMemberModal(false);
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