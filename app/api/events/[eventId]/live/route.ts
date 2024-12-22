import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { eventId } = params;

  // Set up SSE headers
  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", "text/event-stream");
  responseHeaders.set("Cache-Control", "no-cache");
  responseHeaders.set("Connection", "keep-alive");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Initial event data
      const initialEvent = {
        id: eventId,
        title: "Family Game Night",
        description: "Join us for a fun evening of board games and snacks!",
        dateTime: "2024-02-01T19:00:00Z",
        location: "123 Main St",
        rsvps: [
          {
            id: "1",
            userId: userId,
            status: "YES",
            user: {
              id: userId,
              email: "user@example.com",
              displayName: "John Doe",
            },
          },
        ],
        meals: [
          {
            id: "1",
            name: "Pizza",
          },
        ],
        games: [
          {
            id: "1",
            name: "Monopoly",
          },
        ],
      };

      // Send initial event data
      const message = `data: ${JSON.stringify(initialEvent)}\n\n`;
      controller.enqueue(encoder.encode(message));

      // TODO: Set up real-time updates from database
      // For now, we'll just send updates every 5 seconds
      const interval = setInterval(() => {
        const updatedEvent = {
          ...initialEvent,
          rsvps: [
            ...initialEvent.rsvps,
            {
              id: Date.now().toString(),
              userId: "new-user",
              status: Math.random() > 0.5 ? "YES" : "MAYBE",
              user: {
                id: "new-user",
                email: "new@example.com",
                displayName: "New User",
              },
            },
          ],
        };

        const message = `data: ${JSON.stringify(updatedEvent)}\n\n`;
        controller.enqueue(encoder.encode(message));
      }, 5000);

      // Clean up interval when the connection is closed
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
      });
    },
  });

  return new NextResponse(stream, {
    headers: responseHeaders,
  });
} 