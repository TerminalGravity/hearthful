import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { format } from "date-fns";
import { headers } from "next/headers";

async function getUpcomingEvents() {
  const headersList = await headers();
  const { userId } = await auth();
  if (!userId) return [];

  return await db.event.findMany({
    where: {
      OR: [
        {
          hostId: userId,
        },
        {
          participants: {
            some: {
              userId: userId,
            },
          },
        },
      ],
      date: {
        gte: new Date(),
      },
    },
    orderBy: {
      date: 'asc',
    },
    take: 5,
    include: {
      family: true,
    },
  });
}

export default async function UpcomingEvents() {
  const events = await getUpcomingEvents();

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No upcoming events</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{event.name}</h3>
                  <p className="text-sm text-gray-500">{event.family.name}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(event.date), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <a
                  href={`/events/${event.id}`}
                  className="text-sm bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  View
                </a>
              </div>
            </div>
          ))
        )}
        
        <a
          href="/events/new"
          className="block bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
        >
          <span className="text-gray-600">Create New Event</span>
        </a>
      </div>
    </div>
  );
} 