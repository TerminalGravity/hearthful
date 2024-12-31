import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import EventsClient from "./events-client.tsx";

export default async function EventsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const events = await db.event.findMany({
    where: {
      family: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
    include: {
      family: {
        select: {
          id: true,
          name: true,
        },
      },
      participants: {
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          role: true,
        },
      },
      host: {
        select: {
          id: true,
          email: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return <EventsClient initialEvents={events} />;
} 