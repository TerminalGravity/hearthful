import { auth } from "@clerk/nextjs";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import UpcomingEvents from "../components/dashboard/UpcomingEvents";
import QuickActions from "../components/dashboard/QuickActions";

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your family gathering hub
        </p>
      </div>

      {/* Quick Actions Section */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <UpcomingEvents />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
} 