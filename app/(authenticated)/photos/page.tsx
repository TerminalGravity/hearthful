import { auth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default async function PhotosPage() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Photo Gallery</h1>
          <p className="mt-2 text-gray-600">
            Share and preserve your family memories
          </p>
        </div>
        <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900">
          Upload Photos
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Photo cards will go here */}
        <div className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <Image
            src="/placeholder.jpg"
            alt="Family photo"
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-display text-lg font-semibold text-white">
                Summer BBQ
              </h3>
              <p className="mt-1 text-sm text-gray-200">
                July 4th, 2023
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 