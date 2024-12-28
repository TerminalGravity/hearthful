import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import UpcomingEvents from "../components/dashboard/UpcomingEvents";
import QuickActions from "../components/dashboard/QuickActions";
import FamilyManagement from "../components/dashboard/FamilyManagement";
import SuggestionModule from "../components/dashboard/SuggestionModule";
import UserSettings from "../components/dashboard/UserSettings";

async function getUserSettings() {
  const headersList = headers(); // Removed 'await' here
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      displayName: true,
      email: true,
      preferences: true,
    },
  });

  return {
    displayName: user?.firstName || dbUser?.displayName || 'Anonymous',
    email: user?.emailAddresses[0]?.emailAddress || dbUser?.email || '',
    avatarUrl: user?.imageUrl || '',
    preferences: dbUser?.preferences || {},
  };
}

export default async function DashboardPage() {
  // Removed 'await' from headers()
  const headersList = headers();
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to your family gathering hub
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="space-y-6">
            <div className="card-shadow">
              <FamilyManagement />
            </div>
            <div className="card-shadow">
              <UpcomingEvents />
            </div>
            <div className="card-shadow">
              <QuickActions />
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-shadow">
              <SuggestionModule />
            </div>
            <div className="card-shadow">
              <ActivityFeed />
            </div>
          </div>

          <div>
            <div className="card-shadow">
              <UserSettings />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
