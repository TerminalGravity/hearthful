"use client";

import React, { useState } from "react";
import { FamilyMembersProps } from "@/types";
import CreateMemberModal from "./CreateMemberModal";
import MemberSettingsModal from "./MemberSettingsModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/molecules/avatar";
import { Button } from "@/components/atoms/button";
import { useRouter } from "next/navigation";

export default function FamilyMembers({ members, isAdmin, familyId }: FamilyMembersProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
    setShowSettingsModal(true);
  };

  const handleSuccess = () => {
    // Refresh the server components to get the latest data
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="default"
          >
            Create Member
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            onClick={() => handleMemberClick(member)}
            className="flex items-center justify-between p-4 bg-background rounded-lg border hover:border-primary cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={`https://avatar.vercel.sh/${member.email}`} />
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                {member.preferences && (
                  <>
                    {member.preferences.dietaryRestrictions?.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Dietary: {member.preferences.dietaryRestrictions.join(", ")}
                      </p>
                    )}
                    {member.preferences.gamePreferences?.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Games: {member.preferences.gamePreferences.join(", ")}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {member.role === "ADMIN" ? "Admin" : "Member"}
            </span>
          </div>
        ))}
      </div>

      <CreateMemberModal
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        familyId={familyId}
        onSuccess={handleSuccess}
      />

      {selectedMember && (
        <MemberSettingsModal
          showModal={showSettingsModal}
          setShowModal={setShowSettingsModal}
          member={selectedMember}
          familyId={familyId}
          isCurrentUserAdmin={isAdmin}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
} 