import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { headers } from "next/headers";

async function getFamilies() {
  const headersList = await headers();
  const { userId } = await auth();
  if (!userId) return [];

  return await db.family.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      members: true,
      subscription: {
        select: {
          status: true,
        },
      },
    },
  });
}

export default async function FamilyManagement() {
  const families = await getFamilies();

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Your Families</h2>
      <div className="space-y-4">
        {families.map((family) => (
          <div
            key={family.id}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{family.name}</h3>
                <p className="text-sm text-gray-500">
                  {family.members.length} members
                </p>
              </div>
              <a
                href={`/families/${family.id}`}
                className="text-sm bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                View
              </a>
            </div>
          </div>
        ))}
        
        <a
          href="/families/new"
          className="block bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
        >
          <span className="text-gray-600">Create a New Family</span>
        </a>
      </div>
    </div>
  );
} 