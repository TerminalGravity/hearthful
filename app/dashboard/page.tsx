import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import UpcomingEvents from "../components/dashboard/UpcomingEvents";
import QuickActions from "../components/dashboard/QuickActions";
import FamilyManagement from "../components/dashboard/FamilyManagement";
import SuggestionModule from "../components/dashboard/SuggestionModule";
import UserSettings from "../components/dashboard/UserSettings";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your family gathering hub
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        {/* Left Column - Family & Event Management */}
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

        {/* Middle Column - AI Suggestions */}
        <div className="space-y-6">
          <div className="card-shadow">
            <SuggestionModule />
          </div>
          <div className="card-shadow">
            <ActivityFeed />
          </div>
        </div>

        {/* Right Column - User Settings & Stats */}
        <div>
          <div className="card-shadow">
            <UserSettings />
          </div>
        </div>
      </div>
    </div>
  );
} 