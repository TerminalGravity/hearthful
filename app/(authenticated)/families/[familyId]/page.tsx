import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import FamilyMembers from "@/components/families/FamilyMembers";
import FamilyEvents from "@/components/families/FamilyEvents";

interface PageProps {
  params: {
    familyId: string;
  };
}

export default async function FamilyPage({ params }: PageProps) {
  // First await the params
  const familyId = await Promise.resolve(params.familyId);
  
  // Then await the auth
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const family = await db.family.findUnique({
    where: {
      id: familyId,
    },
    include: {
      members: {
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          role: true,
          preferences: true,
          joinedAt: true,
        },
      },
      events: {
        include: {
          participants: true,
        },
        orderBy: {
          date: "desc",
        },
        take: 5,
      },
    },
  });

  if (!family) {
    notFound();
  }

  // Check if user is a member of this family
  const isMember = family.members.some(member => member.userId === userId);
  if (!isMember) {
    redirect("/dashboard");
  }

  // Get user's role in the family
  const userRole = family.members.find(member => member.userId === userId)?.role;
  const isAdmin = userRole === "ADMIN";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{family.name}</h1>
          <p className="text-gray-600 mt-2">
            {family.members.length} members
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-4">
            <a
              href={`/families/${family.id}/settings`}
              className="bg-gray-100 text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Settings
            </a>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Members</h2>
            <FamilyMembers 
              members={family.members}
              isAdmin={isAdmin}
              familyId={family.id}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
            <FamilyEvents 
              events={family.events}
              familyId={family.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 