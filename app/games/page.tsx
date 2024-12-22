import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function GamesPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Game Library</h2>
        <div className="flex items-center space-x-2">
          <Link
            href="/games/create"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Add Game
          </Link>
          <button
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            Get Recommendations
          </button>
        </div>
      </div>
      <div className="grid gap-6">
        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="Search games..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <select className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Categories</option>
            <option value="board">Board Games</option>
            <option value="card">Card Games</option>
            <option value="outdoor">Outdoor Games</option>
            <option value="party">Party Games</option>
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* This will be populated with actual game data */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <div className="flex flex-col space-y-1.5">
                <h3 className="font-semibold leading-none tracking-tight">Add Your First Game</h3>
                <p className="text-sm text-muted-foreground">
                  Start building your family's game library
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 