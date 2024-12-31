"use server";

import { currentUser } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

const RSVPStatusSchema = z.enum(["YES", "NO", "MAYBE"]);

export async function updateRSVP(eventId: string, status: "YES" | "NO" | "MAYBE") {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const validatedStatus = RSVPStatusSchema.parse(status);

  // TODO: Update RSVP in database
  // For now, we'll just revalidate the path
  revalidatePath(`/events/${eventId}`);

  return { success: true };
}

export async function createEvent(data: {
  name: string;
  description?: string;
  date: string;
  familyId: string;
  hostId: string;
  type: string;
  participants: string[];
  details?: any;
}) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify user is member of the family
    const membership = await db.familyMember.findFirst({
      where: {
        userId: user.id,
        familyId: data.familyId,
      },
    });

    if (!membership) {
      throw new Error("Not a member of this family");
    }

    // Verify host is a member of the family
    const hostMember = await db.familyMember.findFirst({
      where: {
        id: data.hostId,
        familyId: data.familyId,
      },
    });

    if (!hostMember) {
      throw new Error("Invalid host selected");
    }

    // Verify all participants are members of the family
    const validParticipants = await db.familyMember.findMany({
      where: {
        id: {
          in: data.participants,
        },
        familyId: data.familyId,
      },
    });

    if (validParticipants.length !== data.participants.length) {
      throw new Error("One or more participants are not members of this family");
    }

    // Create the event
    const event = await db.event.create({
      data: {
        name: data.name,
        description: data.description,
        date: new Date(data.date),
        type: data.type,
        details: data.details,
        familyId: data.familyId,
        hostId: data.hostId,
        participants: {
          connect: data.participants.map((id: string) => ({ id })),
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
    });

    revalidatePath("/events");
    revalidatePath(`/families/${data.familyId}/events`);

    return event;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to create event");
  }
}

export async function getEvents(familyId: string) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const events = await db.event.findMany({
      where: {
        familyId,
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

    return events;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to fetch events");
  }
}

export async function getEventRSVPs(eventId: string) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const rsvps = await db.rSVP.findMany({
      where: {
        eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    return rsvps;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to fetch RSVPs");
  }
}

export async function uploadEventPhoto(eventId: string, file: File, caption?: string) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const formData = new FormData();
    formData.append("file", file);
    if (caption) {
      formData.append("caption", caption);
    }

    const response = await fetch(`/api/events/${eventId}/photos`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload photo");
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to upload photo");
  }
}

export async function getEventPhotos(eventId: string) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const photos = await db.photo.findMany({
      where: {
        eventId,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    return photos;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to fetch photos");
  }
}

export async function deleteEventPhoto(eventId: string, photoId: string) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    await db.photo.delete({
      where: {
        id: photoId,
        eventId,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to delete photo");
  }
} 