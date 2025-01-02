import { kv } from "@vercel/kv";
import { trackEvent } from "./monitoring";

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
  refCount: number;
}

const inFlightRequests = new Map<string, PendingRequest<any>>();
const COALESCE_WINDOW = 50; // ms to wait for duplicate requests

export async function coalesce<T>(
  key: string,
  fn: () => Promise<T>,
  options: {
    timeout?: number;
    maxRefCount?: number;
  } = {}
): Promise<T> {
  const { timeout = 5000, maxRefCount = 50 } = options;

  try {
    // Check for an in-flight request
    const existing = inFlightRequests.get(key);
    if (existing) {
      const age = Date.now() - existing.timestamp;
      
      // If request is still fresh and under ref limit
      if (age < timeout && existing.refCount < maxRefCount) {
        existing.refCount++;
        
        await trackEvent({
          action: 'request_coalesced',
          category: 'performance',
          label: key,
          metadata: {
            age,
            refCount: existing.refCount,
          },
        });
        
        return existing.promise;
      }
    }

    // Wait briefly for potential duplicate requests
    await new Promise(resolve => setTimeout(resolve, COALESCE_WINDOW));

    // Create new request if none exists
    const request: PendingRequest<T> = {
      promise: fn(),
      timestamp: Date.now(),
      refCount: 1,
    };

    inFlightRequests.set(key, request);

    try {
      const result = await request.promise;
      return result;
    } finally {
      // Cleanup after request completes
      setTimeout(() => {
        if (inFlightRequests.get(key) === request) {
          inFlightRequests.delete(key);
        }
      }, COALESCE_WINDOW);
    }
  } catch (error) {
    await trackEvent({
      action: 'coalesce_error',
      category: 'error',
      label: key,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    throw error;
  }
}

// Distributed coalescing using KV store
export async function distributedCoalesce<T>(
  key: string,
  fn: () => Promise<T>,
  options: {
    timeout?: number;
    lockTTL?: number;
  } = {}
): Promise<T> {
  const { timeout = 5000, lockTTL = 10 } = options;
  const lockKey = `lock:${key}`;
  const now = Date.now();

  try {
    // Try to acquire lock
    const acquired = await kv.set(lockKey, now, {
      nx: true,
      ex: lockTTL,
    });

    if (!acquired) {
      // Wait for other request to complete
      await new Promise(resolve => setTimeout(resolve, timeout));
      const result = await kv.get(key);
      
      if (result) {
        await trackEvent({
          action: 'distributed_coalesce_hit',
          category: 'performance',
          label: key,
        });
        return result;
      }
    }

    // Execute function and store result
    const result = await fn();
    await kv.set(key, result, {
      ex: lockTTL,
    });

    return result;
  } catch (error) {
    await trackEvent({
      action: 'distributed_coalesce_error',
      category: 'error',
      label: key,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    throw error;
  } finally {
    // Release lock
    await kv.del(lockKey);
  }
} 