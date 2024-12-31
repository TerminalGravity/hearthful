import { useState, useEffect } from "react";
import { Input, MultiSelect, Toggle, Button } from "@nextui-org/react";
import { toast } from "sonner";

interface AISettingsProps {
  familyId: string;
}

export default function AISettings({ familyId }: AISettingsProps) {
  const [aiEnabled, setAiEnabled] = useState(false);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [games, setGames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch current AI settings
    const fetchAISettings = async () => {
      try {
        const res = await fetch(`/api/families/${familyId}/ai-settings`);
        const data = await res.json();
        setAiEnabled(data.enabled);
        setCuisines(data.cuisines);
        setGames(data.games);
      } catch (error) {
        console.error("Failed to fetch AI settings:", error);
        toast.error("Failed to load AI settings.");
      }
    };

    fetchAISettings();
  }, [familyId]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/families/${familyId}/ai-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: aiEnabled, cuisines, games }),
      });

      if (!res.ok) {
        throw new Error("Failed to update AI settings.");
      }

      toast.success("AI settings updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating AI settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Toggle
        checked={aiEnabled}
        onChange={(e) => setAiEnabled(e.target.checked)}
        label="Enable AI Recommendations"
      />
      {aiEnabled && (
        <>
          <MultiSelect
            label="Preferred Cuisines"
            items={["Italian", "Mexican", "Chinese", "Indian", "French", "Other"]}
            selectedKeys={cuisines}
            onSelectionChange={(keys) => setCuisines(Array.from(keys))}
            placeholder="Select preferred cuisines"
          />
          <MultiSelect
            label="Preferred Game Genres"
            items={["Board Games", "Video Games", "Card Games", "Outdoor Games", "Strategy", "Other"]}
            selectedKeys={games}
            onSelectionChange={(keys) => setGames(Array.from(keys))}
            placeholder="Select preferred game genres"
          />
        </>
      )}
      <Button onPress={handleSave} disabled={isSubmitting} color="primary">
        {isSubmitting ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
} 