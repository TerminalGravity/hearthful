import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EventsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Family Events</h2>
        <Link
          href="/events/create"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Create Event
        </Link>
      </div>
      <div className="grid gap-4">
        {/* This will be populated with actual event data */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold leading-none tracking-tight">No Events Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create your first family event to get started
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Select a family to view events</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 