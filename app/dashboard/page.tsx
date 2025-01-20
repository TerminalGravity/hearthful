import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import QuickActions from "@/components/dashboard/QuickActions";
import FamilyManagement from "@/components/dashboard/FamilyManagement";
import SuggestionModule from "@/components/dashboard/SuggestionModule";
import UserSettings from "@/components/dashboard/UserSettings";
import { headers } from 'next/headers';

export default async function DashboardPage() {
  const headersList = headers();
  const session = await auth({ headers: headersList });
  const { userId } = session;

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome to your family gathering hub
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-section">
            <div className="dashboard-card">
              <FamilyManagement />
            </div>
            <div className="dashboard-card">
              <UpcomingEvents />
            </div>
            <div className="dashboard-card">
              <QuickActions />
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-card">
              <SuggestionModule />
            </div>
            <div className="dashboard-card">
              <ActivityFeed />
            </div>
          </div>

          <div>
            <div className="dashboard-card">
              <UserSettings />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
