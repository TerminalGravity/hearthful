import { headers } from "next/headers";

export function initSSE() {
  const headersList = headers();
  const contentType = headersList.get("content-type");

  if (contentType === "text/event-stream") {
    return new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue("retry: 1000\n\n");
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }
    );
  }

  return null;
}

export function sendSSEMessage(data: any, event?: string) {
  const formattedData = `data: ${JSON.stringify(data)}\n${
    event ? `event: ${event}\n` : ""
  }\n`;

  return formattedData;
} 