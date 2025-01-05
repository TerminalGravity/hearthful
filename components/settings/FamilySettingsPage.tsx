"use client";

import { useState } from "react";
import SidebarNavigation from "./SidebarNavigation";
import FamilyDetails from "./FamilyDetails";
import MembersManagement from "./MembersManagement";
import SubscriptionManagement from "./SubscriptionManagement";
import AISettings from "./AISettings";
import NotificationSettings from "./NotificationSettings";
import AnalyticsInsights from "./AnalyticsInsights";
import SecurityPrivacySettings from "./SecurityPrivacySettings";
import { Family } from "@/types";

interface FamilySettingsPageProps {
  family: Family;
}

export default function FamilySettingsPage({ family }: FamilySettingsPageProps) {
  const [activeSection, setActiveSection] = useState("Family Details");
  const [updatedFamily, setUpdatedFamily] = useState<Family>(family);

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/4 p-4">
        <SidebarNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
      </div>

      {/* Content Area */}
      <div className="w-3/4 p-4">
        {activeSection === "Family Details" && (
          <FamilyDetails family={updatedFamily} onUpdate={setUpdatedFamily} />
        )}
        {activeSection === "Members" && (
          <MembersManagement familyId={family.id} />
        )}
        {activeSection === "Subscription" && (
          <SubscriptionManagement familyId={family.id} />
        )}
        {activeSection === "AI Settings" && (
          <AISettings familyId={family.id} />
        )}
        {activeSection === "Notifications" && (
          <NotificationSettings familyId={family.id} />
        )}
        {activeSection === "Analytics" && (
          <AnalyticsInsights familyId={family.id} />
        )}
        {activeSection === "Security & Privacy" && (
          <SecurityPrivacySettings familyId={family.id} />
        )}
      </div>
    </div>
  );
} 