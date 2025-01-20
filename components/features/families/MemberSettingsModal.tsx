"use client";

import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberSettingsModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  member: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MEMBER";
    dietaryRestrictions?: string[];
    gamePreferences?: string[];
    notes?: string;
  };
  familyId: string;
  isCurrentUserAdmin?: boolean;
  onSuccess?: () => void;
}

export default function MemberSettingsModal({
  showModal,
  setShowModal,
  member,
  familyId,
  isCurrentUserAdmin = false,
  onSuccess,
}: MemberSettingsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: member.name,
    email: member.email,
    role: member.role,
    dietaryRestrictions: Array.isArray(member.preferences?.dietaryRestrictions) 
      ? member.preferences.dietaryRestrictions.join(", ") 
      : "",
    gamePreferences: Array.isArray(member.preferences?.gamePreferences)
      ? member.preferences.gamePreferences.join(", ")
      : "",
    notes: member.preferences?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/families/${familyId}/members/${member.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          preferences: {
            dietaryRestrictions: formData.dietaryRestrictions
              ? formData.dietaryRestrictions.split(",").map(item => item.trim()).filter(Boolean)
              : [],
            gamePreferences: formData.gamePreferences
              ? formData.gamePreferences.split(",").map(item => item.trim()).filter(Boolean)
              : [],
            notes: formData.notes || "",
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update member");
      }

      toast.success("Member updated successfully");
      setShowModal(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update member");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Member Settings</DialogTitle>
          <DialogDescription>
            Update member profile and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-4 py-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={`https://avatar.vercel.sh/${member.email}`} />
            <AvatarFallback>{member.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{member.name}</h3>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Member name"
                required
                disabled={!isCurrentUserAdmin}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Member email"
                required
                disabled={!isCurrentUserAdmin}
              />
            </div>

            {isCurrentUserAdmin && (
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "ADMIN" | "MEMBER") => 
                    setFormData(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
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
            )}

            <div className="space-y-2">
              <Label htmlFor="dietaryRestrictions">
                Dietary Restrictions (comma-separated)
              </Label>
              <Input
                id="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                placeholder="e.g., Vegetarian, Gluten-free, Nut allergy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gamePreferences">
                Game Preferences (comma-separated)
              </Label>
              <Input
                id="gamePreferences"
                value={formData.gamePreferences}
                onChange={(e) => setFormData(prev => ({ ...prev, gamePreferences: e.target.value }))}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !isCurrentUserAdmin}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 