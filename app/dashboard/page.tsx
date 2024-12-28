import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import UpcomingEvents from "../components/dashboard/UpcomingEvents";
import QuickActions from "../components/dashboard/QuickActions";
import FamilyManagement from "../components/dashboard/FamilyManagement";
import SuggestionModule from "../components/dashboard/SuggestionModule";
import UserSettings from "../components/dashboard/UserSettings";

export default async function DashboardPage() {
  // Ensure headers are properly awaited
  const headersList = await headers();
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