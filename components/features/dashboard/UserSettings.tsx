import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getUserSettings() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  if (!user) {
    return null;
  }

  // First get the family memberships
  const familyMemberships = await db.familyMember.findMany({
    where: {
      userId: userId,
    },
    select: {
      role: true,
      family: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Then get the user details
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
    families: familyMemberships.map(membership => ({
      id: membership.family.id,
      name: membership.family.name,
      role: membership.role,
    })),
  };
}

export default async function UserSettings() {
  const settings = await getUserSettings();
  if (!settings) {
    redirect("/sign-in");
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-3 mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          <img
            src={settings.avatarUrl || 'https://via.placeholder.com/40'}
            alt={settings.displayName}
            className="w-12 h-12 rounded-full ring-2 ring-primary/20"
          />
          <div>
            <h3 className="font-medium text-neutral-800">{settings.displayName}</h3>
            <p className="text-sm text-neutral-500">{settings.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/profile"
          className="button-primary w-full flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit Profile
        </Link>
        
        <Link
          href="/settings"
          className="button-secondary w-full flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          Settings
        </Link>
      </div>

      {settings.families.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-2">Your Families</h3>
          <div className="space-y-2">
            {settings.families.map((family) => (
              <Link
                key={family.id}
                href={`/families/${family.id}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-neutral-100 transition-colors"
              >
                <span className="text-sm text-neutral-700">{family.name}</span>
                <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                  {family.role.toLowerCase()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
