import { useState, useEffect } from "react";
import { Toggle, Button } from "@nextui-org/react";
import { toast } from "sonner";

interface SecurityPrivacySettingsProps {
  familyId: string;
}

export default function SecurityPrivacySettings({ familyId }: SecurityPrivacySettingsProps) {
  const [allowGuestAccess, setAllowGuestAccess] = useState(false);
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch current security and privacy settings
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/families/${familyId}/security-privacy`);
        const data = await res.json();
        setAllowGuestAccess(data.allowGuestAccess);
        setEnableTwoFactor(data.enableTwoFactor);
      } catch (error) {
        console.error("Failed to fetch security settings:", error);
        toast.error("Failed to load security settings.");
      }
    };

    fetchSettings();
  }, [familyId]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/families/${familyId}/security-privacy`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allowGuestAccess, enableTwoFactor }),
      });

      if (!res.ok) {
        throw new Error("Failed to update security settings.");
      }

      toast.success("Security and privacy settings updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Toggle
        checked={allowGuestAccess}
        onChange={(e) => setAllowGuestAccess(e.target.checked)}
        label="Allow Guest Access to Events"
      />
      <Toggle
        checked={enableTwoFactor}
        onChange={(e) => setEnableTwoFactor(e.target.checked)}
        label="Enable Two-Factor Authentication"
      />
      <Button onPress={handleSave} disabled={isSubmitting} color="primary">
        {isSubmitting ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
} 