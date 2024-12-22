import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function MainNav() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">Hearthful</span>
        </Link>
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="/families"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Families
          </Link>
          <Link
            href="/events"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Events
          </Link>
          <Link
            href="/meals"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Meals
          </Link>
          <Link
            href="/games"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Games
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
} 