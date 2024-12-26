import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, isBefore, isToday } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
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
      setSelectedDate(addDays(new Date(), 1));
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
    if (!selectedDate || !familyId || !hostId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Parse the selected time
    const [time, period] = selectedTime.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let hour = hours;
    if (period === "PM" && hours !== 12) hour += 12;
    if (period === "AM" && hours === 12) hour = 0;

    // Create a new date with the selected date and time
    const eventDate = new Date(selectedDate);
    eventDate.setHours(hour, minutes);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      if (!response.ok) throw new Error("Failed to create event");

      toast.success("Event created successfully!");
      setShowModal(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFamily = families.find(f => f.id === familyId);

  return (
    <Transition appear show={showModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setShowModal(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900 mb-6">
                  Create New Event
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Left Column - Basic Details */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Event Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Family Dinner, Game Night, etc."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Family</label>
                        <select
                          value={familyId}
                          onChange={(e) => {
                            setFamilyId(e.target.value);
                            setSelectedParticipants([]);
                            setHostId("");
                          }}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Add any additional details about the event..."
                        />
                      </div>

                      {familyId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Host</label>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            {selectedFamily?.members.map((member: any) => (
                              <label
                                key={member.id}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name="host"
                                  checked={hostId === member.id}
                                  onChange={() => setHostId(member.id)}
                                  className="rounded-full border-gray-300 text-primary focus:ring-primary"
                                  required
                                />
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://avatar.vercel.sh/${member.id}`} />
                                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">{member.name}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Event Type</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setEventType("meal")}
                            className={cn(
                              "p-4 rounded-lg border text-center transition-colors",
                              eventType === "meal"
                                ? "border-primary bg-primary text-white"
                                : "border-gray-200 hover:border-primary"
                            )}
                          >
                            <span className="block text-lg mb-1">🍽️</span>
                            <span className="font-medium">Meal</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEventType("game")}
                            className={cn(
                              "p-4 rounded-lg border text-center transition-colors",
                              eventType === "game"
                                ? "border-primary bg-primary text-white"
                                : "border-gray-200 hover:border-primary"
                            )}
                          >
                            <span className="block text-lg mb-1">🎮</span>
                            <span className="font-medium">Game</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Date/Time & Details */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            disabled={(date) => isBefore(date, new Date()) && !isToday(date)}
                            className="rounded-md border mx-auto"
                            initialFocus
                          />
                          <div className="mt-4">
                            <select
                              value={selectedTime}
                              onChange={(e) => setSelectedTime(e.target.value)}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
                          <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                            {selectedFamily?.members.map((member: any) => (
                              <label
                                key={member.id}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
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
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://avatar.vercel.sh/${member.id}`} />
                                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">{member.name}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Type Specific Details */}
                  <div className="border-t pt-6">
                    {eventType === "meal" ? (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Meal Type</label>
                          <select
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            required
                          >
                            {MEAL_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Cuisine</label>
                          <input
                            type="text"
                            value={mealDetails.cuisine}
                            onChange={(e) =>
                              setMealDetails({ ...mealDetails, cuisine: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Italian, Mexican, etc."
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Dietary Notes
                          </label>
                          <textarea
                            value={mealDetails.dietaryNotes}
                            onChange={(e) =>
                              setMealDetails({ ...mealDetails, dietaryNotes: e.target.value })
                            }
                            rows={2}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Any dietary restrictions or preferences..."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Game Name</label>
                          <input
                            type="text"
                            value={gameDetails.gameName}
                            onChange={(e) =>
                              setGameDetails({ ...gameDetails, gameName: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Monopoly, Chess, etc."
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Player Count
                          </label>
                          <input
                            type="number"
                            value={gameDetails.playerCount}
                            onChange={(e) =>
                              setGameDetails({ ...gameDetails, playerCount: e.target.value })
                            }
                            min="1"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Number of players"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Difficulty
                          </label>
                          <div className="flex space-x-4">
                            {["easy", "medium", "hard"].map((difficulty) => (
                              <button
                                key={difficulty}
                                type="button"
                                onClick={() =>
                                  setGameDetails({ ...gameDetails, difficulty })
                                }
                                className={cn(
                                  "px-4 py-2 rounded-md capitalize",
                                  gameDetails.difficulty === difficulty
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                                )}
                              >
                                {difficulty}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Creating..." : "Create Event"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 