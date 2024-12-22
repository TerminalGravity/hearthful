import { auth } from "@clerk/nextjs";
import Link from "next/link";

export default async function EventsPage() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Events</h1>
          <p className="mt-2 text-gray-600">
            Plan and manage your family gatherings
          </p>
        </div>
        <Link
          href="/events/create"
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900"
        >
          Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Event cards will go here */}
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
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold">
                Family Reunion
              </h3>
              <p className="mt-1 text-sm text-gray-600">July 4th, 2024</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Annual family reunion at the lake house. Bring your favorite dishes!
          </p>
          <div className="mt-6 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
              12 attending
            </span>
            <button className="text-sm font-medium text-black hover:text-gray-600">
              View Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 