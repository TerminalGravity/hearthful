import { auth } from "@clerk/nextjs";
import Link from "next/link";

export default async function MealsPage() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Recipe Library</h1>
          <p className="mt-2 text-gray-600">
            Share and discover family recipes
          </p>
        </div>
        <Link
          href="/meals/create"
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900"
        >
          Add Recipe
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recipe cards will go here */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold">
                Grandma's Apple Pie
              </h3>
              <p className="mt-1 text-sm text-gray-600">Added by Sarah</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            A classic family recipe passed down through generations. Perfect for any gathering!
          </p>
          <div className="mt-6 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
              Dessert
            </span>
            <button className="text-sm font-medium text-black hover:text-gray-600">
              View Recipe →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 