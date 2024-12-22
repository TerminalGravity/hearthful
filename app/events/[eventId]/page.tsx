import { currentUser } from "@clerk/nextjs";
import { RSVPList } from "@/components/events/rsvp-list";
import { EventDetails } from "@/components/events/event-details";
import { PhotoGallery } from "@/components/photos/photo-gallery";

export default async function EventDetailsPage({
  params: { eventId },
}: {
  params: { eventId: string };
}) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <EventDetails eventId={eventId} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <RSVPList eventId={eventId} currentUserId={user.id} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Photos</h2>
          <PhotoGallery eventId={eventId} />
        </div>
      </div>
    </div>
  );
} 