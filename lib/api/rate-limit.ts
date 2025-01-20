import { headers } from "next/headers";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

interface RateLimitOptions {
  interval?: number; // in seconds
  limit?: number;
}

interface RateLimitResult {
  success: boolean;
  remaining?: number;
  reset?: number;
}

export async function rateLimit(
  key: string,
  { interval = 60, limit = 10 }: RateLimitOptions = {}
): Promise<RateLimitResult> {
  try {
    // Check if KV is configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.warn('Rate limiting is disabled: Missing KV configuration');
      return { success: true, remaining: limit };
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || 
               headersList.get("x-real-ip") || 
               "unknown";
    
    const identifier = `rate-limit:${key}:${ip}`;
    const now = Math.floor(Date.now() / 1000);
    const reset = now + interval;

    const [count] = await kv.pipeline()
      .incr(identifier)
      .expire(identifier, interval)
      .exec();

    const remaining = limit - (count as number);
    const success = remaining > 0;

    return {
      success,
      remaining,
      reset,
    };
  } catch (error) {
    console.warn('Rate limiting failed:', error);
    // Fail open if rate limiting is not available
    return { success: true, remaining: limit };
  }
}

export function createRateLimitResponse(reset: number) {
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: {
        "Retry-After": String(reset),
      },
    }
  );
} 