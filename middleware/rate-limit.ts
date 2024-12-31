import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { trackEvent } from "@/lib/monitoring";

export interface RateLimitConfig {
  interval: number;  // Time window in seconds
  limit: number;     // Maximum requests per interval
  burst?: number;    // Allow burst requests
  cost?: number;     // Request cost (for token bucket)
}

export interface RateLimitInfo {
  remaining: number;
  reset: number;
  total: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  interval: 60,
  limit: 100,
  burst: 50,
  cost: 1,
};

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async getIdentifier(req: Request): Promise<string> {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    const path = new URL(req.url).pathname;
    return `rate-limit:${path}:${ip}`;
  }

  async check(req: Request): Promise<RateLimitInfo | null> {
    try {
      if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        console.warn('Rate limiting disabled: Missing KV configuration');
        return null;
      }

      const identifier = await this.getIdentifier(req);
      const now = Math.floor(Date.now() / 1000);
      const windowStart = now - (now % this.config.interval);
      const windowKey = `${identifier}:${windowStart}`;
      const tokenKey = `${identifier}:tokens`;

      // Get current count and token bucket
      const [count, tokens = this.config.burst] = await Promise.all([
        kv.incr(windowKey),
        kv.get<number>(tokenKey),
      ]);

      // First request in window
      if (count === 1) {
        await kv.expire(windowKey, this.config.interval);
      }

      // Calculate tokens
      const cost = this.config.cost || 1;
      const newTokens = Math.min(
        this.config.burst!,
        tokens + (this.config.burst! * (now % this.config.interval) / this.config.interval)
      );

      // Check if request can be processed
      const remaining = Math.min(
        this.config.limit - count,
        Math.floor(newTokens / cost)
      );

      // Update token bucket
      if (remaining >= 0) {
        await kv.set(tokenKey, newTokens - cost, {
          ex: this.config.interval,
        });
      }

      await trackEvent({
        action: 'rate_limit_check',
        category: 'security',
        label: new URL(req.url).pathname,
        metadata: {
          remaining,
          count,
          tokens: newTokens,
        },
      });

      return {
        remaining: Math.max(0, remaining),
        reset: windowStart + this.config.interval,
        total: this.config.limit,
      };
    } catch (error) {
      await trackEvent({
        action: 'rate_limit_error',
        category: 'error',
        label: new URL(req.url).pathname,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      return null;
    }
  }
}

export function createRateLimitResponse(info: RateLimitInfo) {
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: {
        'Retry-After': String(info.reset),
        'X-RateLimit-Limit': String(info.total),
        'X-RateLimit-Remaining': String(info.remaining),
        'X-RateLimit-Reset': String(info.reset),
      },
    }
  );
}

// Middleware factory
export function withRateLimit(config?: Partial<RateLimitConfig>) {
  const limiter = new RateLimiter(config);

  return async function rateLimit(req: Request) {
    const info = await limiter.check(req);
    
    if (!info) {
      return null; // Rate limiting disabled or error
    }

    if (info.remaining < 0) {
      return createRateLimitResponse(info);
    }

    return null;
  };
} 