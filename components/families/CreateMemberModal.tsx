"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateMemberModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  familyId: string;
  onSuccess?: (member: MemberFormData) => void;
}

interface MemberFormData {
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  dietaryRestrictions: string[];
  gamePreferences: string[];
  notes: string;
}

export default function CreateMemberModal({
  showModal,
  setShowModal,
  familyId,
  onSuccess,
}: CreateMemberModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MemberFormData>({
    name: "",
    email: "",
    role: "MEMBER",
    dietaryRestrictions: [],
    gamePreferences: [],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If we're in create family flow (using a temp familyId), just return the data
      if (familyId === "temp-id") {
        onSuccess?.(formData);
        setShowModal(false);
        // Reset form
        setFormData({
          name: "",
          email: "",
          role: "MEMBER",
          dietaryRestrictions: [],
          gamePreferences: [],
          notes: "",
        });
        return;
      }

      // Otherwise make the API call to add member to existing family
      const response = await fetch(`/api/families/${familyId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create member");
      }

      const member = await response.json();
      toast.success("Member created successfully");
      setShowModal(false);
      onSuccess?.(member);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        role: "MEMBER",
        dietaryRestrictions: [],
        gamePreferences: [],
        notes: "",
      });
    } catch (error) {
      console.error("Error creating member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDietaryRestrictionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: value.split(",").map(item => item.trim()).filter(Boolean),
    }));
  };

  const handleGamePreferenceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      gamePreferences: value.split(",").map(item => item.trim()).filter(Boolean),
    }));
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Family Member</DialogTitle>
          <DialogDescription>
            Add a new member to your family group. Fill in their details and preferences.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter member's name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter member's email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "ADMIN" | "MEMBER") => 
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Roles</SelectLabel>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietaryRestrictions">
                Dietary Restrictions (comma-separated)
              </Label>
              <Input
                id="dietaryRestrictions"
                value={formData.dietaryRestrictions.join(", ")}
                onChange={(e) => handleDietaryRestrictionChange(e.target.value)}
                placeholder="e.g., Vegetarian, Gluten-free, Nut allergy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gamePreferences">
                Game Preferences (comma-separated)
              </Label>
              <Input
                id="gamePreferences"
                value={formData.gamePreferences.join(", ")}
                onChange={(e) => handleGamePreferenceChange(e.target.value)}
                placeholder="e.g., Chess, Monopoly, Cards"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information about the member"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 