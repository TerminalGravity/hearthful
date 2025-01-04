# Authentication Flow Documentation

## Overview
This document outlines the authentication implementation using Clerk in our Next.js application, focusing on proper headers handling and session management.

## Core Components

### 1. Authentication Middleware
```typescript
// middleware/auth.ts
import { headers } from 'next/headers';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { AppError } from '@/utils/error-handling';

export async function withAuth(handler: Function) {
  return async (req: Request) => {
    try {
      const headersList = await headers();
      const session = await auth();
      const { userId } = session || {};

      if (!userId) {
        throw new AppError(401, 'Unauthorized', 'AUTH_REQUIRED');
      }

      return handler(req, { userId, headers: headersList, session });
    } catch (error) {
      return handleError(error);
    }
  };
}
```

### 2. Session Types
```typescript
// types/auth.ts
export interface Session {
  userId: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  expiresAt?: number;
}

export interface AuthContext {
  userId: string;
  headers: Headers;
  session: Session;
}
```

## Implementation Guide

### 1. Protected API Routes
```typescript
// Example protected API route
import { withAuth } from '@/middleware/auth';

export const GET = withAuth(async (req: Request, context: AuthContext) => {
  const { userId } = context;
  // Implementation
});
```

### 2. Protected Pages
```typescript
// Example protected page
export default async function ProtectedPage() {
  const headersList = await headers();
  const session = await auth();
  const { userId } = session || {};

  if (!userId) {
    redirect('/sign-in');
  }

  return <div>Protected Content</div>;
}
```

### 3. Error Handling
```typescript
// utils/error-handling.ts
export class AuthError extends AppError {
  constructor(message: string, code: string) {
    super(401, message, code);
  }
}

export const authErrors = {
  SESSION_EXPIRED: new AuthError('Session expired', 'AUTH_SESSION_EXPIRED'),
  INVALID_TOKEN: new AuthError('Invalid token', 'AUTH_INVALID_TOKEN'),
  UNAUTHORIZED: new AuthError('Unauthorized', 'AUTH_UNAUTHORIZED'),
};
```

## Best Practices

1. **Headers Handling**
   - Always await headers() before using
   - Pass headers through context
   - Handle missing headers gracefully

2. **Session Management**
   - Use proper type checking
   - Handle session expiration
   - Implement refresh token logic

3. **Error Handling**
   - Use custom error classes
   - Provide meaningful error messages
   - Log authentication failures

4. **Security Considerations**
   - Implement rate limiting
   - Use secure session storage
   - Validate tokens properly

## Common Patterns

### 1. API Route Pattern
```typescript
export const handler = withAuth(async (req: Request, context: AuthContext) => {
  try {
    // 1. Extract and validate input
    const data = await validateRequest(req);

    // 2. Check permissions
    await validatePermissions(context.userId, data);

    // 3. Perform operation
    const result = await performOperation(data, context);

    // 4. Return response
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
});
```

### 2. Page Pattern
```typescript
export default async function SecurePage() {
  // 1. Authentication
  const headersList = await headers();
  const session = await auth();
  const { userId } = session || {};

  if (!userId) {
    redirect('/sign-in');
  }

  // 2. Data Fetching
  const data = await fetchSecureData(userId);

  // 3. Render
  return (
    <ErrorBoundary>
      <SecureContent data={data} />
    </ErrorBoundary>
  );
}
```

## Testing

### 1. Mock Authentication
```typescript
// tests/mocks/auth.ts
export const mockAuth = {
  userId: 'test-user-id',
  session: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
  },
};
```

### 2. Test Cases
```typescript
describe('Authentication', () => {
  it('should handle missing auth', async () => {
    // Test implementation
  });

  it('should handle expired sessions', async () => {
    // Test implementation
  });

  it('should handle invalid tokens', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Common Issues

1. **Headers() Iteration Errors**
   - Cause: Using headers synchronously
   - Solution: Always await headers()

2. **Session Undefined**
   - Cause: Missing auth check
   - Solution: Add proper null checks

3. **Token Expiration**
   - Cause: Expired session
   - Solution: Implement refresh logic

## Migration Guide

### From Previous Version

1. Update all API routes to use withAuth
2. Add proper type checking
3. Implement error boundaries
4. Update tests with new patterns 