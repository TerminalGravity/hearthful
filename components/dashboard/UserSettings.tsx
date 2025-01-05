import { db } from "@/lib/db-utils";
import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserCircleIcon, PencilSquareIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

async function getUserSettings() {
  try {
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

    // Get the user details and preferences
    const dbUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        imageUrl: true,
        name: true,
        preferences: true,
        userPreferences: {
          select: {
            id: true,
            theme: true,
            language: true,
            autoplayMedia: true,
            showFamilyStatus: true,
            createdAt: true,
            updatedAt: true,
          }
        },
      },
    });

    const prefs = dbUser?.userPreferences;

    // Merge Clerk user data with database user data
    return {
      name: user.firstName || dbUser?.name || 'Anonymous',
      email: user.emailAddresses[0]?.emailAddress || dbUser?.email || '',
      avatarUrl: user.imageUrl || dbUser?.imageUrl || '',
      preferences: {
        ...dbUser?.preferences || {},
        theme: prefs?.theme || 'system',
        language: prefs?.language || 'en',
        notifications: {
          events: true,
          photos: true,
          meals: true,
          games: true,
        },
        autoplayMedia: prefs?.autoplayMedia ?? true,
        showFamilyStatus: prefs?.showFamilyStatus ?? true,
        emailFrequency: 'daily',
      },
      families: familyMemberships.map(membership => ({
        id: membership.family.id,
        name: membership.family.name,
        role: membership.role,
      })),
    };
  } catch (error) {
    console.error('Error fetching user settings:', error instanceof Error ? error.message : 'Unknown error');
    
    // Get basic user info even if DB operations fail
    try {
      const user = await currentUser();
      return {
        name: user?.firstName || 'Anonymous',
        email: user?.emailAddresses[0]?.emailAddress || '',
        avatarUrl: user?.imageUrl || '',
        preferences: {
          theme: 'system',
          language: 'en',
          notifications: {
            events: true,
            photos: true,
            meals: true,
            games: true,
          },
          autoplayMedia: true,
          showFamilyStatus: true,
          emailFrequency: 'daily',
        },
        families: [],
      };
    } catch {
      // If everything fails, return minimal default data
      return {
        name: 'Anonymous',
        email: '',
        avatarUrl: '',
        preferences: {
          theme: 'system',
          language: 'en',
          notifications: {
            events: true,
            photos: true,
            meals: true,
            games: true,
          },
          autoplayMedia: true,
          showFamilyStatus: true,
          emailFrequency: 'daily',
        },
        families: [],
      };
    }
  }
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
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          {settings.avatarUrl ? (
            <img
              src={settings.avatarUrl}
              alt={settings.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center">
              <UserCircleIcon className="w-8 h-8 text-primary/60" />
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">{settings.name}</h3>
            <p className="text-sm text-gray-500">{settings.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/profile"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <PencilSquareIcon className="h-4 w-4" />
          Edit Profile
        </Link>
        
        <Link
          href="/settings"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Cog6ToothIcon className="h-4 w-4" />
          Settings
        </Link>
      </div>

      {settings.families.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Your Families</h3>
          <div className="space-y-2">
            {settings.families.map((family) => (
              <Link
                key={family.id}
                href={`/families/${family.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <span className="text-sm text-gray-700">{family.name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
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
