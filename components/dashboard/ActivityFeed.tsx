import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { headers } from "next/headers";

async function getRecentActivity() {
  const headersList = await headers();
  const { userId } = await auth();
  if (!userId) return [];

  // Get user's family memberships
  const familyMemberships = await db.familyMember.findMany({
    where: { userId },
    select: { id: true, familyId: true },
  });

  const familyMemberIds = familyMemberships.map(fm => fm.id);
  const familyIds = familyMemberships.map(fm => fm.familyId);

  // Get recent events where user is host or participant
  const events = await db.event.findMany({
    where: {
      OR: [
        { hostId: userId },
        { 
          AND: [
            { familyId: { in: familyIds } },
            { eventParticipants: { some: { id: { in: familyMemberIds } } } }
          ]
        }
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      host: true,
      family: true,
      eventParticipants: true,
      rsvps: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  });

  // Get recent photos in user's families
  const photos = await db.photo.findMany({
    where: {
      event: {
        familyId: { in: familyIds }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      user: true,
      event: true,
      album: true,
    },
  });

  // Get recent meal plans
  const mealPlans = await db.mealPlan.findMany({
    where: {
      familyId: { in: familyIds }
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      family: true,
      recipes: {
        include: { recipe: true }
      }
    },
  });

  // Combine and sort all activities
  const activities = [
    ...events.map(event => ({
      id: event.id,
      type: 'event',
      title: event.name,
      description: `New event created in ${event.family.name}`,
      date: event.createdAt,
      user: event.host.name || 'Unknown user',
      details: {
        location: event.location,
        date: event.date,
        rsvpCount: event.rsvps.length,
        recentRSVPs: event.rsvps.map(rsvp => ({
          user: rsvp.user.name,
          status: rsvp.status,
        })),
      },
    })),
    ...photos.map(photo => ({
      id: photo.id,
      type: 'photo',
      title: photo.caption || 'New photo added',
      description: photo.album 
        ? `Added to album ${photo.album.name}`
        : photo.event
        ? `Added to event ${photo.event.name}`
        : 'Added to family gallery',
      date: photo.createdAt,
      user: photo.user.name || 'Unknown user',
      details: {
        url: photo.url,
        caption: photo.caption,
      },
    })),
    ...mealPlans.map(plan => ({
      id: plan.id,
      type: 'meal_plan',
      title: `New meal plan created`,
      description: `Meal plan created for ${plan.family.name}`,
      date: plan.createdAt,
      user: 'Family Member',
      details: {
        startDate: plan.startDate,
        endDate: plan.endDate,
        recipeCount: plan.recipes.length,
      },
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())
   .slice(0, 10);

  return activities;
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
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      activity.type === 'event' 
                        ? 'bg-blue-100 text-blue-700'
                        : activity.type === 'photo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {activity.type.replace('_', ' ')}
                    </span>
                    <h3 className="font-medium">{activity.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  
                  {activity.type === 'event' && activity.details && (
                    <div className="text-xs text-gray-500 mt-2">
                      <p>📍 {activity.details.location}</p>
                      <p>📅 {new Date(activity.details.date).toLocaleDateString()}</p>
                      {activity.details.rsvpCount > 0 && (
                        <p>👥 {activity.details.rsvpCount} RSVPs</p>
                      )}
                    </div>
                  )}
                  
                  {activity.type === 'meal_plan' && activity.details && (
                    <div className="text-xs text-gray-500 mt-2">
                      <p>📅 {new Date(activity.details.startDate).toLocaleDateString()} - {new Date(activity.details.endDate).toLocaleDateString()}</p>
                      <p>🍽️ {activity.details.recipeCount} recipes planned</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
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