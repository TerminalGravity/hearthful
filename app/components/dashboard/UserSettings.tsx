import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getUserSettings() {
  const headersList = headers(); // Ensure headers are properly called without 'await'
  const { userId } = await auth();

  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null; // Handle case where currentUser is null

  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      displayName: true,
      email: true,
      preferences: true,
    },
  });

  return {
    displayName: user.firstName || dbUser?.displayName || 'Anonymous',
    email: user.emailAddresses[0]?.emailAddress || dbUser?.email || '',
    avatarUrl: user.imageUrl || '',
    preferences: dbUser?.preferences || {},
  };
}

export default async function UserSettings() {
  const settings = await getUserSettings();
  if (!settings) {
    // Optionally, redirect to sign-in or display a message
    redirect("/sign-in");
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={settings.avatarUrl || 'https://via.placeholder.com/40'}
          alt={settings.displayName}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h2 className="font-medium">{settings.displayName}</h2>
          <p className="text-sm text-gray-500">{settings.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <a
          href="/profile"
          className="block w-full text-center bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Edit Profile
        </a>
        
        <a
          href="/settings"
          className="block w-full text-center bg-gray-100 text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Settings
        </a>
      </div>
    </div>
  );
}
