import { useState, useEffect } from "react";
import { Toggle, Button } from "@nextui-org/react";
import { toast } from "sonner";

interface NotificationSettingsProps {
  familyId: string;
}

export default function NotificationSettings({ familyId }: NotificationSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [inAppNotifications, setInAppNotifications] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch current notification settings
    const fetchNotificationSettings = async () => {
      try {
        const res = await fetch(`/api/families/${familyId}/notifications`);
        const data = await res.json();
        setEmailNotifications(data.email);
        setInAppNotifications(data.inApp);
      } catch (error) {
        console.error("Failed to fetch notification settings:", error);
        toast.error("Failed to load notification settings.");
      }
    };

    fetchNotificationSettings();
  }, [familyId]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/families/${familyId}/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailNotifications, inApp: inAppNotifications }),
      });

      if (!res.ok) {
        throw new Error("Failed to update notification settings.");
      }

      toast.success("Notification settings updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating notification settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Toggle
        checked={emailNotifications}
        onChange={(e) => setEmailNotifications(e.target.checked)}
        label="Email Notifications"
      />
      <Toggle
        checked={inAppNotifications}
        onChange={(e) => setInAppNotifications(e.target.checked)}
        label="In-App Notifications"
      />
      <Button onPress={handleSave} disabled={isSubmitting} color="primary">
        {isSubmitting ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
} 