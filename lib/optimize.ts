import { headers } from "next/headers";
import { trackEvent } from "./monitoring";

interface OptimizationOptions {
  compression?: boolean;
  priority?: 'high' | 'low' | 'auto';
  cacheControl?: string;
}

export async function optimizeRequest(
  req: Request,
  options: OptimizationOptions = {}
): Promise<Record<string, string>> {
  const headersList = await headers();
  const responseHeaders: Record<string, string> = {};

  try {
    // Client hints
    const memory = headersList.get('device-memory');
    const connection = headersList.get('downlink');
    const isLowEndDevice = Number(memory) < 4;
    const isSlowConnection = Number(connection) < 1;

    // Set performance headers
    responseHeaders['X-Content-Type-Options'] = 'nosniff';
    responseHeaders['X-Frame-Options'] = 'DENY';
    responseHeaders['Referrer-Policy'] = 'strict-origin-when-cross-origin';

    if (options.compression) {
      responseHeaders['Accept-Encoding'] = 'gzip, deflate, br';
    }

    // Set priority hints
    if (options.priority) {
      responseHeaders['Priority'] = options.priority;
    } else if (isLowEndDevice || isSlowConnection) {
      responseHeaders['Priority'] = 'low';
    }

    // Cache control
    if (options.cacheControl) {
      responseHeaders['Cache-Control'] = options.cacheControl;
    }

    await trackEvent({
      action: 'request_optimized',
      category: 'performance',
      metadata: {
        memory,
        connection,
        isLowEndDevice,
        isSlowConnection,
        options,
      },
    });

    return responseHeaders;
  } catch (error) {
    await trackEvent({
      action: 'optimization_error',
      category: 'error',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    return responseHeaders;
  }
}

export function getOptimalCacheControl(
  priority: 'high' | 'low' | 'auto' = 'auto',
  isAuthenticated: boolean = false
): string {
  const directives = ['no-transform'];

  if (isAuthenticated) {
    directives.push('private', 'no-store');
  } else if (priority === 'high') {
    directives.push('public', 'max-age=31536000');
  } else if (priority === 'low') {
    directives.push('public', 'max-age=60');
  } else {
    directives.push('public', 'max-age=3600');
  }

  return directives.join(', ');
} 