import { headers } from 'next/headers';
import { track } from '@vercel/analytics/server';

interface LogEvent {
  action: string;
  category: 'api' | 'auth' | 'database' | 'cache' | 'error' | 'performance';
  label?: string;
  value?: number;
  error?: Error;
  metadata?: Record<string, any>;
}

interface PerformanceMetrics {
  ttfb?: number;      // Time to First Byte
  fcp?: number;       // First Contentful Paint
  lcp?: number;       // Largest Contentful Paint
  cls?: number;       // Cumulative Layout Shift
  fid?: number;       // First Input Delay
}

export async function trackEvent({
  action,
  category,
  label,
  value,
  metadata = {},
}: LogEvent) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    const referer = headersList.get('referer') || 'direct';
    const clientCountry = headersList.get('x-vercel-ip-country') || 'unknown';
    const clientRegion = headersList.get('x-vercel-ip-country-region') || 'unknown';

    await track(action, {
      category,
      label,
      value,
      userAgent,
      referer,
      clientCountry,
      clientRegion,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      ...metadata,
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

export async function trackAPIRequest(
  path: string,
  startTime: number,
  status: number,
  error?: Error
) {
  const duration = Date.now() - startTime;
  const success = status >= 200 && status < 400;

  const headersList = await headers();
  const contentLength = headersList.get('content-length');
  const contentType = headersList.get('content-type');
  const requestId = headersList.get('x-request-id') || 'unknown';

  await trackEvent({
    action: 'api_request',
    category: 'api',
    label: path,
    value: duration,
    metadata: {
      status,
      success,
      contentLength,
      contentType,
      requestId,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      } : undefined,
    },
  });
}

export async function trackPerformance(metrics: PerformanceMetrics) {
  await trackEvent({
    action: 'performance_metrics',
    category: 'performance',
    metadata: {
      ...metrics,
      timestamp: new Date().toISOString(),
    },
  });
}

export function captureError(error: Error, context: Record<string, any> = {}) {
  const errorId = Math.random().toString(36).substring(7);
  const timestamp = new Date().toISOString();

  console.error('Error:', {
    errorId,
    timestamp,
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...context,
  });

  trackEvent({
    action: 'error',
    category: 'error',
    label: error.name,
    metadata: {
      errorId,
      timestamp,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      ...context,
    },
  });

  return errorId;
} 