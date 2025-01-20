import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { headers } from "next/headers";

async function getRecentActivity() {
  const headersList = await headers();
  const { userId } = await auth();
  if (!userId) return [];

  const events = await db.event.findMany({
    where: {
      OR: [
        { hostId: userId },
        {
          participants: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
    include: {
      host: true,
      family: true,
    },
  });

  return events.map(event => ({
    id: event.id,
    type: 'event',
    title: event.name,
    description: `New event created in ${event.family.name}`,
    date: event.createdAt,
    user: event.host.displayName || 'Unknown user',
  }));
}

export default async function ActivityFeed() {
  const activities = await getRecentActivity();

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{activity.title}</h3>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    by {activity.user} • {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 