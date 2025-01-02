import { kv } from "@vercel/kv";
import { trackEvent } from "./monitoring";

interface CacheOptions {
  ttl?: number;  // Time to live in seconds
  staleWhileRevalidate?: number;  // Additional time to serve stale content while revalidating
  tags?: string[];  // Cache tags for invalidation
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  tags: string[];
}

export async function cacheGet<T>(
  key: string,
  options: CacheOptions = {}
): Promise<T | null> {
  try {
    const entry = await kv.get<CacheEntry<T>>(key);
    
    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    const ttl = (options.ttl || 60) * 1000; // Convert to milliseconds
    const swr = (options.staleWhileRevalidate || 0) * 1000;

    // Track cache hit/miss metrics
    await trackEvent({
      action: 'cache_access',
      category: 'cache',
      label: key,
      metadata: {
        hit: true,
        age,
        stale: age > ttl,
      },
    });

    if (age <= ttl) {
      return entry.data;
    }

    if (age <= ttl + swr) {
      // Serve stale content while revalidating
      return entry.data;
    }

    return null;
  } catch (error) {
    await trackEvent({
      action: 'cache_error',
      category: 'error',
      label: key,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      tags: options.tags || [],
    };

    await kv.set(key, entry, {
      ex: options.ttl,
    });

    // Index cache tags
    if (options.tags?.length) {
      await Promise.all(
        options.tags.map(tag =>
          kv.sadd(`cache:tag:${tag}`, key)
        )
      );
    }

    await trackEvent({
      action: 'cache_set',
      category: 'cache',
      label: key,
      metadata: {
        ttl: options.ttl,
        tags: options.tags,
      },
    });
  } catch (error) {
    await trackEvent({
      action: 'cache_error',
      category: 'error',
      label: key,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export async function invalidateByTag(tag: string): Promise<void> {
  try {
    // Get all keys for this tag
    const keys = await kv.smembers(`cache:tag:${tag}`);
    
    if (keys.length) {
      // Delete all keys and their tag associations
      await Promise.all([
        kv.del(...keys),
        kv.del(`cache:tag:${tag}`),
      ]);

      await trackEvent({
        action: 'cache_invalidate',
        category: 'cache',
        label: tag,
        metadata: {
          keysInvalidated: keys.length,
        },
      });
    }
  } catch (error) {
    await trackEvent({
      action: 'cache_error',
      category: 'error',
      label: tag,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export async function generateCacheKey(
  base: string,
  params: Record<string, any> = {}
): Promise<string> {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return `${base}:${sortedParams}`;
} 