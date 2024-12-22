import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-col space-y-2">
              <h3 className="font-semibold leading-none tracking-tight">My Families</h3>
              <p className="text-sm text-muted-foreground">Create or join a family workspace</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-col space-y-2">
              <h3 className="font-semibold leading-none tracking-tight">Upcoming Events</h3>
              <p className="text-sm text-muted-foreground">View and manage your family events</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-col space-y-2">
              <h3 className="font-semibold leading-none tracking-tight">Meal Library</h3>
              <p className="text-sm text-muted-foreground">Browse and plan family meals</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-col space-y-2">
              <h3 className="font-semibold leading-none tracking-tight">Game Library</h3>
              <p className="text-sm text-muted-foreground">Discover family-friendly games</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 