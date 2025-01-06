"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, parse, isValid } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useCurrentFamily } from "@/hooks/use-current-family";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Card,
  Chip,
} from "@nextui-org/react";

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

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useUser();
  const { currentFamily } = useCurrentFamily();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateString, setDateString] = useState(() => {
    const tomorrow = addDays(new Date(), 1);
    return format(tomorrow, 'yyyy-MM-dd');
  });
  const [selectedTime, setSelectedTime] = useState(TIME_OPTIONS[24]); // Default to noon
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [hostId, setHostId] = useState<string>("");
  const [selectedMealId, setSelectedMealId] = useState<string>("");
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [familyMeals, setFamilyMeals] = useState<any[]>([]);
  const [familyGames, setFamilyGames] = useState<any[]>([]);

  // Fetch family meals and games
  useEffect(() => {
    if (currentFamily?.id) {
      // Fetch meals
      fetch(`/api/meals?familyId=${currentFamily.id}`)
        .then(res => res.json())
        .then(data => setFamilyMeals(data))
        .catch(error => console.error('Failed to fetch meals:', error));

      // Fetch games
      fetch(`/api/games?familyId=${currentFamily.id}`)
        .then(res => res.json())
        .then(data => setFamilyGames(data))
        .catch(error => console.error('Failed to fetch games:', error));
    }
  }, [currentFamily?.id]);

  // Set current user as default host when family is selected
  useEffect(() => {
    if (currentFamily && user) {
      const currentUserMember = currentFamily.members.find(
        member => member.userId === user.id
      );
      if (currentUserMember) {
        setHostId(currentUserMember.userId);
      }
    }
  }, [currentFamily, user]);

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
    if (!dateString || !currentFamily?.id || !hostId || !name || !location) {
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
          location,
          date: eventDate.toISOString(),
          familyId: currentFamily.id,
          hostId,
          type: selectedMealId ? "meal" : selectedGameId ? "game" : "other",
          participants: selectedParticipants,
          mealId: selectedMealId || undefined,
          gameId: selectedGameId || undefined,
          tags: [],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Failed to create event");
      }

      toast.success("Event created successfully!");
      router.push('/events?tab=library');
      router.refresh();
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please select a family first</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter event name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter event location"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[100px] rounded-lg border-gray-300 focus:border-primary"
                placeholder="Add any additional details about the event..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <Input
                type="date"
                value={dateString}
                onChange={(e) => setDateString(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <Select
                label="Select time"
                placeholder="Choose time"
                selectedKeys={[selectedTime]}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meals (Optional)
              </label>
              <Select
                label="Select meals"
                placeholder="Choose meals from your library"
                selectionMode="multiple"
                selectedKeys={selectedMealId ? [selectedMealId] : []}
                onChange={(e) => setSelectedMealId(e.target.value)}
              >
                {familyMeals.map((meal) => (
                  <SelectItem key={meal.id} value={meal.id}>
                    {meal.name}
                  </SelectItem>
                ))}
              </Select>
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => router.push('/meals/create')}
                  type="button"
                >
                  Create New Meal
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Host and Participants */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Host
              </label>
              <Select
                label="Select host"
                placeholder="Choose host"
                selectedKeys={hostId ? [hostId] : []}
                onChange={(e) => setHostId(e.target.value)}
              >
                {currentFamily.members.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    {member.name} ({member.role.toLowerCase()})
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Participants
              </label>
              <Card className="p-4">
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {currentFamily.members.map((member) => (
                    <label key={member.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(member.id)}
                        onChange={(e) => handleParticipantChange(member.id, e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{member.name}</span>
                      <Chip size="sm" variant="flat" color="primary" className="ml-auto">
                        {member.role.toLowerCase()}
                      </Chip>
                    </label>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            color="danger"
            variant="light"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            type="submit"
            isLoading={isSubmitting}
          >
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
} 