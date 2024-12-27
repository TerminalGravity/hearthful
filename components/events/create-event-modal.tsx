"use client";

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar, AvatarGroup, Badge, Card, CardBody, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { format, addDays, parse } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateEventModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
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

export default function CreateEventModal({ showModal, setShowModal }: CreateEventModalProps) {
  const router = useRouter();
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
  const [familyId, setFamilyId] = useState("");
  const [families, setFamilies] = useState<any[]>([]);
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
      setFamilyId("");
      setSelectedParticipants([]);
      setHostId("");
      setMealDetails({ cuisine: "", dietaryNotes: "" });
      setGameDetails({ gameName: "", playerCount: "", difficulty: "medium" });
    }
  }, [showModal]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateString || !familyId || !hostId) {
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
      const eventDate = new Date(selectedDate);
      eventDate.setHours(hour, minutes, 0, 0);

      // Ensure the date is valid
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid date selected");
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          date: eventDate.toISOString(),
          familyId,
          hostId,
          type: eventType,
          participants: selectedParticipants,
          details: eventType === "meal" ? {
            ...mealDetails,
            mealType,
          } : gameDetails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to create event");
      }

      const data = await response.json();
      toast.success("Event created successfully!");
      setShowModal(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFamily = families.find(f => f.id === familyId);

  return (
    <Modal 
      isOpen={showModal} 
      onClose={() => setShowModal(false)}
      size="2xl"
    >
      <ModalContent>
        <ModalHeader>Create New Event</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Family
                  </label>
                  <select
                    value={familyId}
                    onChange={(e) => setFamilyId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Add any additional details about the event..."
                  />
                </div>

                {familyId && (
                  <div>
                    <label className="text-sm font-medium leading-none mb-2">Host</label>
                    <div className="bg-muted rounded-lg p-4 space-y-2">
                      {selectedFamily?.members.map((member) => (
                        <label
                          key={member.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/80 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="host"
                            checked={hostId === member.id}
                            onChange={() => setHostId(member.id)}
                            className="h-4 w-4 border-primary text-primary focus:ring-primary"
                            required
                          />
                          <div className="flex items-center space-x-2">
                            <Avatar
                              src={`https://avatar.vercel.sh/${member.id}`}
                              fallback={member.name[0]}
                              size="sm"
                            />
                            <span className="text-sm font-medium">{member.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-sm font-medium leading-none">Event Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onPress={() => setEventType("meal")}
                      variant={eventType === "meal" ? "solid" : "bordered"}
                      className="h-auto p-4"
                    >
                      <span className="block text-lg mb-1">🍽️</span>
                      <span className="font-medium">Meal</span>
                    </Button>
                    <Button
                      onPress={() => setEventType("game")}
                      variant={eventType === "game" ? "solid" : "bordered"}
                      className="h-auto p-4"
                    >
                      <span className="block text-lg mb-1">🎮</span>
                      <span className="font-medium">Game</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column - Date/Time & Details */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium leading-none mb-2">Date & Time</label>
                  <div className="bg-muted rounded-lg p-4">
                    <Input
                      type="date"
                      value={dateString}
                      onChange={(e) => setDateString(e.target.value)}
                      className="w-full"
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                    <div className="mt-4">
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                </div>

                {familyId && (
                  <div>
                    <label className="text-sm font-medium leading-none mb-2">Participants</label>
                    <div className="bg-muted rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                      {selectedFamily?.members.map((member) => (
                        <label
                          key={member.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/80 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedParticipants([...selectedParticipants, member.id]);
                              } else {
                                setSelectedParticipants(
                                  selectedParticipants.filter((id) => id !== member.id)
                                );
                              }
                            }}
                            className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                          />
                          <div className="flex items-center space-x-2">
                            <Avatar
                              src={`https://avatar.vercel.sh/${member.id}`}
                              fallback={member.name[0]}
                              size="sm"
                            />
                            <span className="text-sm font-medium">{member.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {eventType === "meal" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium leading-none">Meal Type</label>
                      <select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {MEAL_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium leading-none">Cuisine</label>
                      <input
                        type="text"
                        value={mealDetails.cuisine}
                        onChange={(e) =>
                          setMealDetails({ ...mealDetails, cuisine: e.target.value })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="e.g., Italian, Mexican, etc."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium leading-none">
                        Dietary Notes
                      </label>
                      <textarea
                        value={mealDetails.dietaryNotes}
                        onChange={(e) =>
                          setMealDetails({ ...mealDetails, dietaryNotes: e.target.value })
                        }
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Any dietary restrictions or preferences..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {eventType === "game" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium leading-none">Game Name</label>
                      <input
                        type="text"
                        value={gameDetails.gameName}
                        onChange={(e) =>
                          setGameDetails({ ...gameDetails, gameName: e.target.value })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter game name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium leading-none">
                        Player Count
                      </label>
                      <input
                        type="text"
                        value={gameDetails.playerCount}
                        onChange={(e) =>
                          setGameDetails({ ...gameDetails, playerCount: e.target.value })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="e.g., 2-4 players"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium leading-none">
                        Difficulty
                      </label>
                      <select
                        value={gameDetails.difficulty}
                        onChange={(e) =>
                          setGameDetails({ ...gameDetails, difficulty: e.target.value })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="bordered"
                onPress={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isDisabled={isSubmitting}
                color="primary"
              >
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 