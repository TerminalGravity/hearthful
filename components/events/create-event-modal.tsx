"use client";

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar, AvatarGroup, Badge, Card, CardBody, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { format, addDays, parse, isValid } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
}

interface CreateEventModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onSuccess?: () => void;
  defaultFamilyId?: string;
}

const MEAL_TYPES = [
  "Breakfast",
  "Brunch",
  "Lunch",
  "Dinner",
  "Snack",
  "Dessert",
  "Other"
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${ampm}`;
});

export default function CreateEventModal({ 
  showModal, 
  setShowModal, 
  onSuccess,
  defaultFamilyId 
}: CreateEventModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dateString, setDateString] = useState(() => {
    const tomorrow = addDays(new Date(), 1);
    return format(tomorrow, 'yyyy-MM-dd');
  });
  const [selectedTime, setSelectedTime] = useState(TIME_OPTIONS[24]); // Default to noon
  const [eventType, setEventType] = useState<"meal" | "game">("meal");
  const [mealType, setMealType] = useState(MEAL_TYPES[0]);
  const [familyId, setFamilyId] = useState(defaultFamilyId || "");
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [hostId, setHostId] = useState<string>("");
  const [mealDetails, setMealDetails] = useState({
    cuisine: "",
    dietaryNotes: "",
  });
  const [gameDetails, setGameDetails] = useState({
    gameName: "",
    playerCount: "",
    difficulty: "medium",
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!showModal) {
      setName("");
      setDescription("");
      setDateString(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
      setSelectedTime(TIME_OPTIONS[24]);
      setEventType("meal");
      setMealType(MEAL_TYPES[0]);
      setFamilyId(defaultFamilyId || "");
      setSelectedParticipants([]);
      setHostId("");
      setMealDetails({ cuisine: "", dietaryNotes: "" });
      setGameDetails({ gameName: "", playerCount: "", difficulty: "medium" });
    }
  }, [showModal, defaultFamilyId]);

  // Fetch families when modal opens
  useEffect(() => {
    if (showModal) {
      fetch("/api/families")
        .then(res => res.json())
        .then(data => setFamilies(data))
        .catch(error => {
          console.error("Failed to fetch families:", error);
          toast.error("Failed to load families");
        });
    }
  }, [showModal]);

  const selectedFamily = families.find(f => f.id === familyId);

  // Set current user as default host when family is selected
  useEffect(() => {
    if (familyId && selectedFamily && user) {
      const currentUserMember = selectedFamily.members.find(
        member => member.email === user.primaryEmailAddress?.emailAddress
      );
      if (currentUserMember) {
        setHostId(currentUserMember.id);
      }
    }
  }, [familyId, user, families]);

  // Prevent host from being unselected when selecting participants
  const handleParticipantChange = (memberId: string, isChecked: boolean) => {
    setSelectedParticipants(prev => {
      if (isChecked) {
        return [...prev, memberId];
      } else {
        return prev.filter(id => id !== memberId);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateString || !familyId || !hostId || !name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse the selected time
      const [time, period] = selectedTime.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let hour = hours;
      if (period === "PM" && hours !== 12) hour += 12;
      if (period === "AM" && hours === 12) hour = 0;

      // Create a new date with the selected date and time
      const selectedDate = parse(dateString, 'yyyy-MM-dd', new Date());
      if (!isValid(selectedDate)) {
        throw new Error("Invalid date selected");
      }

      const eventDate = new Date(selectedDate);
      eventDate.setHours(hour, minutes, 0, 0);

      // Ensure the date is valid
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid date selected");
      }

      // Ensure we have at least one participant
      if (selectedParticipants.length === 0) {
        throw new Error("Please select at least one participant");
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          date: eventDate.toISOString(),
          familyId,
          hostId,
          type: eventType,
          participants: selectedParticipants,
          details: eventType === "meal" ? {
            cuisine: mealDetails.cuisine,
            dietaryNotes: mealDetails.dietaryNotes,
            mealType,
          } : gameDetails,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Failed to parse response:", e);
        throw new Error("Server returned an invalid response");
      }
      
      if (!response.ok) {
        throw new Error(data?.error || "Failed to create event");
      }

      toast.success("Event created successfully!");
      setShowModal(false);
      if (onSuccess) {
        await onSuccess();
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={showModal} 
      onClose={() => setShowModal(false)}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[95vh]", // Limit height to 95% of viewport
        body: "overflow-y-auto", // Enable scrolling for body
        closeButton: "z-50", // Ensure close button is above content
        header: "sticky top-0 z-40 bg-background", // Keep header visible
      }}
    >
      <ModalContent>
        <ModalHeader className="border-b">Create New Event</ModalHeader>
        <ModalBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Family
                  </label>
                  <select
                    value={familyId}
                    onChange={(e) => {
                      setFamilyId(e.target.value);
                      setHostId("");
                      setSelectedParticipants([]);
                    }}
                    className="input-base w-full"
                    required
                  >
                    <option value="">Select a family</option>
                    {families.map((family) => (
                      <option key={family.id} value={family.id}>
                        {family.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-base w-full"
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-base w-full min-h-[100px]"
                    placeholder="Add any additional details about the event..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={dateString}
                    onChange={(e) => setDateString(e.target.value)}
                    className="input-base w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="input-base w-full"
                    required
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column - Event Type & Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Event Type
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setEventType("meal")}
                      className={cn(
                        "flex-1 p-3 rounded-md border transition-colors",
                        eventType === "meal" 
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-neutral-200 hover:border-primary/50"
                      )}
                    >
                      Meal
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventType("game")}
                      className={cn(
                        "flex-1 p-3 rounded-md border transition-colors",
                        eventType === "game"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-neutral-200 hover:border-primary/50"
                      )}
                    >
                      Game
                    </button>
                  </div>
                </div>

                {eventType === "meal" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Meal Type
                      </label>
                      <select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        className="input-base w-full"
                      >
                        {MEAL_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Cuisine
                      </label>
                      <input
                        type="text"
                        value={mealDetails.cuisine}
                        onChange={(e) => setMealDetails(prev => ({ ...prev, cuisine: e.target.value }))}
                        className="input-base w-full"
                        placeholder="e.g., Italian, Mexican, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Dietary Notes
                      </label>
                      <textarea
                        value={mealDetails.dietaryNotes}
                        onChange={(e) => setMealDetails(prev => ({ ...prev, dietaryNotes: e.target.value }))}
                        className="input-base w-full min-h-[100px]"
                        placeholder="Any dietary restrictions or preferences..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Game Name
                      </label>
                      <input
                        type="text"
                        value={gameDetails.gameName}
                        onChange={(e) => setGameDetails(prev => ({ ...prev, gameName: e.target.value }))}
                        className="input-base w-full"
                        placeholder="Enter game name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Player Count
                      </label>
                      <input
                        type="text"
                        value={gameDetails.playerCount}
                        onChange={(e) => setGameDetails(prev => ({ ...prev, playerCount: e.target.value }))}
                        className="input-base w-full"
                        placeholder="e.g., 2-6 players"
                      />
                    </div>
                  </>
                )}

                {selectedFamily && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Host
                    </label>
                    <select
                      value={hostId}
                      onChange={(e) => setHostId(e.target.value)}
                      className="input-base w-full"
                      required
                    >
                      <option value="">Select host</option>
                      {selectedFamily.members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedFamily && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Participants
                    </label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                      {selectedFamily.members.map((member) => (
                        <label key={member.id} className="flex items-center gap-2 p-2 hover:bg-neutral-50">
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(member.id)}
                            onChange={(e) => handleParticipantChange(member.id, e.target.checked)}
                            className="rounded border-neutral-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-neutral-700">{member.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </ModalBody>
        <ModalFooter className="border-t">
          <Button
            color="danger"
            variant="light"
            onPress={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Create Event
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 