import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db-utils";

export default async function PhotosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Get user's family memberships
  const familyMemberships = await db.familyMember.findMany({
    where: { userId },
    select: { familyId: true },
  });

  const familyIds = familyMemberships.map((fm) => fm.familyId);

  // Get all albums for user's families
  const albums = await db.photoAlbum.findMany({
    where: {
      familyId: { in: familyIds },
    },
    include: {
      photos: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
      createdBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section>
      {children}
    </section>
  );
} 