"use client";

import React, { useState } from "react";
import { FamilyMembersProps } from "@/types";
import CreateMemberModal from "./CreateMemberModal";

export default function FamilyMembers({ members, isAdmin, familyId }: FamilyMembersProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Create Member
          </button>
        </div>
      )}

      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
          >
            <div>
              <h3 className="font-medium">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
            <span className="text-sm text-gray-500">
              {member.role === "ADMIN" ? "Admin" : "Member"}
            </span>
          </div>
        ))}
      </div>

      <CreateMemberModal
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        familyId={familyId}
        onSuccess={() => {
          // Refresh the members list
          window.location.reload();
        }}
      />
    </div>
  );
} 