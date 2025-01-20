import { kv } from '@vercel/kv';

export async function getRateLimitValue(key: string): Promise<number> {
  try {
    const value = await kv.get<number>(key);
    return value || 0;
  } catch (error) {
    console.error('Error getting rate limit value:', error);
    return 0;
  }
}

export async function incrementRateLimit(
  key: string,
  ttl: number // time to live in seconds
): Promise<number> {
  try {
    const value = await kv.incr(key);
    // Set expiry only on first increment
    if (value === 1) {
      await kv.expire(key, ttl);
    }
    return value;
  } catch (error) {
    console.error('Error incrementing rate limit:', error);
    return 0;
  }
}

export async function getRateLimitTTL(key: string): Promise<number> {
  try {
    const ttl = await kv.ttl(key);
    return ttl;
  } catch (error) {
    console.error('Error getting rate limit TTL:', error);
    return 0;
  }
} 