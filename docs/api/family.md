# Family Management API

This document outlines the API endpoints available for managing families in Hearthful.

## Base URL

```
https://api.hearthful.dev/v1
```

## Authentication

All API endpoints require authentication using a JWT token provided by Clerk. Include the token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### List Families

Retrieve a list of families the authenticated user belongs to.

```http
GET /api/families
```

#### Query Parameters

| Parameter | Type    | Description                    |
|-----------|---------|--------------------------------|
| page      | integer | Page number (default: 1)       |
| limit     | integer | Items per page (default: 10)   |
| status    | string  | Filter by status (all/active)  |

#### Response

```typescript
{
  families: Array<{
    id: string;
    name: string;
    description: string;
    memberCount: number;
    role: 'Admin' | 'Member' | 'Guest';
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    total: number;
    pages: number;
    current: number;
    limit: number;
  };
}
```

### Create Family

Create a new family group.

```http
POST /api/families
```

#### Request Body

```typescript
{
  name: string;          // Required: Family name
  description?: string;  // Optional: Family description
  privacy: 'public' | 'private';  // Required: Privacy setting
  profilePicture?: File;  // Optional: Family profile picture
}
```

#### Response

```typescript
{
  id: string;
  name: string;
  description: string;
  privacy: 'public' | 'private';
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Get Family Details

Retrieve details of a specific family.

```http
GET /api/families/{familyId}
```

#### Response

```typescript
{
  id: string;
  name: string;
  description: string;
  privacy: 'public' | 'private';
  profilePicture?: string;
  memberCount: number;
  events: Array<{
    id: string;
    title: string;
    date: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

### Update Family

Update family details.

```http
PATCH /api/families/{familyId}
```

#### Request Body

```typescript
{
  name?: string;
  description?: string;
  privacy?: 'public' | 'private';
  profilePicture?: File;
}
```

#### Response

```typescript
{
  id: string;
  name: string;
  description: string;
  privacy: 'public' | 'private';
  profilePicture?: string;
  updatedAt: string;
}
```

### Delete Family

Delete a family group (Admin only).

```http
DELETE /api/families/{familyId}
```

#### Response

```typescript
{
  success: true;
  message: string;
}
```

### Member Management

#### List Members

```http
GET /api/families/{familyId}/members
```

#### Response

```typescript
{
  members: Array<{
    id: string;
    userId: string;
    name: string;
    email: string;
    role: 'Admin' | 'Member' | 'Guest';
    status: 'active' | 'inactive' | 'blocked';
    joinedAt: string;
  }>;
}
```

#### Invite Members

```http
POST /api/families/{familyId}/invites
```

##### Request Body

```typescript
{
  emails: string[];
  role: 'Member' | 'Guest';
  message?: string;
}
```

##### Response

```typescript
{
  success: true;
  invites: Array<{
    email: string;
    status: 'sent' | 'failed';
    error?: string;
  }>;
}
```

#### Update Member Role

```http
PATCH /api/families/{familyId}/members/{memberId}
```

##### Request Body

```typescript
{
  role: 'Admin' | 'Member' | 'Guest';
}
```

##### Response

```typescript
{
  success: true;
  member: {
    id: string;
    role: string;
    updatedAt: string;
  };
}
```

#### Remove Member

```http
DELETE /api/families/{familyId}/members/{memberId}
```

##### Response

```typescript
{
  success: true;
  message: string;
}
```

## Error Responses

All endpoints may return the following errors:

### 400 Bad Request

```typescript
{
  error: string;
  message: string;
  details?: Record<string, string>;
}
```

### 401 Unauthorized

```typescript
{
  error: 'unauthorized';
  message: 'Authentication required';
}
```

### 403 Forbidden

```typescript
{
  error: 'forbidden';
  message: 'Insufficient permissions';
}
```

### 404 Not Found

```typescript
{
  error: 'not_found';
  message: 'Resource not found';
}
```

## Rate Limiting

- Rate limit: 100 requests per minute per IP
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Webhooks

### Family Events

Subscribe to family-related events:

```typescript
{
  type: 'family.created' | 'family.updated' | 'family.deleted' | 'member.joined' | 'member.left';
  familyId: string;
  data: {
    // Event-specific data
  };
  timestamp: string;
}
```

## SDK Example

```typescript
import { HearthfulClient } from '@hearthful/sdk';

const client = new HearthfulClient('your_api_key');

// Create a family
const family = await client.families.create({
  name: 'Smith Family',
  privacy: 'private'
});

// Invite members
const invites = await client.families.invite(family.id, {
  emails: ['member@example.com'],
  role: 'Member'
});
``` 