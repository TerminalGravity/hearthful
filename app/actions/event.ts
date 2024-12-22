"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const RSVPStatusSchema = z.enum(["YES", "NO", "MAYBE"]);

export async function updateRSVP(eventId: string, status: "YES" | "NO" | "MAYBE") {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedStatus = RSVPStatusSchema.parse(status);

  // TODO: Update RSVP in database
  // For now, we'll just revalidate the path
  revalidatePath(`/events/${eventId}`);

  return { success: true };
}

export async function createEvent(familyId: string, data: {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
}) {
  try {
    const response = await fetch(`/api/families/${familyId}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create event");
    }

    return response.json();
  } catch (error) {
    console.error("[CREATE_EVENT_ERROR]", error);
    throw error;
  }
}

export async function getEvents(familyId: string) {
  try {
    const response = await fetch(`/api/families/${familyId}/events`);

    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }

    return response.json();
  } catch (error) {
    console.error("[GET_EVENTS_ERROR]", error);
    throw error;
  }
}

export async function getEventRSVPs(eventId: string) {
  try {
    const response = await fetch(`/api/events/${eventId}/rsvps`);

    if (!response.ok) {
      throw new Error("Failed to fetch RSVPs");
    }

    return response.json();
  } catch (error) {
    console.error("[GET_EVENT_RSVPS_ERROR]", error);
    throw error;
  }
}

export async function uploadEventPhoto(eventId: string, file: File, caption?: string) {
  try {
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
    console.error("[UPLOAD_PHOTO_ERROR]", error);
    throw error;
  }
}

export async function getEventPhotos(eventId: string) {
  try {
    const response = await fetch(`/api/events/${eventId}/photos`);

    if (!response.ok) {
      throw new Error("Failed to fetch photos");
    }

    return response.json();
  } catch (error) {
    console.error("[GET_EVENT_PHOTOS_ERROR]", error);
    throw error;
  }
}

export async function deleteEventPhoto(eventId: string, photoId: string) {
  try {
    const response = await fetch(`/api/events/${eventId}/photos`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ photoId }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete photo");
    }
  } catch (error) {
    console.error("[DELETE_PHOTO_ERROR]", error);
    throw error;
  }
} 