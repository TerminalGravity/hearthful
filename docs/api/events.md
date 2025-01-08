# Event Planning API

This document outlines the API endpoints available for managing events in Hearthful.

## Base URL

```
https://api.hearthful.dev/v1
```

## Authentication

All endpoints require authentication using a JWT token provided by Clerk:

```bash
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### List Events

Retrieve events for a family.

```http
GET /api/families/{familyId}/events
```

#### Query Parameters

| Parameter | Type    | Description                     |
|-----------|---------|--------------------------------|
| page      | integer | Page number (default: 1)        |
| limit     | integer | Items per page (default: 10)    |
| status    | string  | Filter by status               |
| from      | string  | Start date (ISO 8601)          |
| to        | string  | End date (ISO 8601)            |
| type      | string  | Event type (one-time/recurring) |

#### Response

```typescript
{
  events: Array<{
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    location?: {
      address: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    coverImage?: string;
    isRecurring: boolean;
    rsvpCount: {
      attending: number;
      declined: number;
      maybe: number;
      noResponse: number;
    };
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

### Create Event

Create a new event.

```http
POST /api/families/{familyId}/events
```

#### Request Body

```typescript
{
  title: string;              // Required: Event title
  description?: string;       // Optional: Event description
  startDate: string;         // Required: ISO 8601 datetime
  endDate?: string;          // Optional: ISO 8601 datetime
  location?: {               // Optional: Event location
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  coverImage?: File;         // Optional: Event cover image
  isRecurring: boolean;      // Required: Whether event repeats
  recurringPattern?: {       // Required if isRecurring is true
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
}
```

#### Response

```typescript
{
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  coverImage?: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: string;
    interval: number;
    endDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Get Event Details

Retrieve details of a specific event.

```http
GET /api/events/{eventId}
```

#### Response

```typescript
{
  id: string;
  familyId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  coverImage?: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: string;
    interval: number;
    endDate?: string;
  };
  rsvps: {
    attending: number;
    declined: number;
    maybe: number;
    noResponse: number;
  };
  tasks: Array<{
    id: string;
    title: string;
    assignedTo?: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

### Update Event

Update event details.

```http
PATCH /api/events/{eventId}
```

#### Request Body

```typescript
{
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  coverImage?: File;
  recurringPattern?: {
    frequency: string;
    interval: number;
    endDate?: string;
  };
}
```

### Delete Event

Delete an event.

```http
DELETE /api/events/{eventId}
```

#### Query Parameters

| Parameter    | Type    | Description                                      |
|-------------|---------|--------------------------------------------------|
| deleteAll   | boolean | Delete all recurring instances (default: false)   |

### RSVP Management

#### List RSVPs

```http
GET /api/events/{eventId}/rsvps
```

#### Response

```typescript
{
  rsvps: Array<{
    id: string;
    userId: string;
    userName: string;
    status: 'attending' | 'declined' | 'maybe';
    guestCount: number;
    notes?: string;
    respondedAt: string;
  }>;
}
```

#### Submit RSVP

```http
POST /api/events/{eventId}/rsvps
```

##### Request Body

```typescript
{
  status: 'attending' | 'declined' | 'maybe';
  guestCount?: number;
  notes?: string;
}
```

### Task Management

#### List Tasks

```http
GET /api/events/{eventId}/tasks
```

#### Create Task

```http
POST /api/events/{eventId}/tasks
```

##### Request Body

```typescript
{
  title: string;
  assignedTo?: string;
  dueDate?: string;
}
```

#### Update Task Status

```http
PATCH /api/events/{eventId}/tasks/{taskId}
```

##### Request Body

```typescript
{
  status: 'pending' | 'completed';
}
```

## Calendar Integration

### Export to Calendar

```http
GET /api/events/{eventId}/calendar
```

#### Query Parameters

| Parameter | Type   | Description                    |
|-----------|--------|--------------------------------|
| format    | string | Calendar format (ical/google)  |

## Webhooks

### Event Notifications

Subscribe to event-related webhooks:

```typescript
{
  type: 'event.created' | 'event.updated' | 'event.deleted' | 'rsvp.updated';
  eventId: string;
  familyId: string;
  data: {
    // Event-specific data
  };
  timestamp: string;
}
```

## Error Responses

Standard error responses as defined in the API standards:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict

## Rate Limiting

- Rate limit: 100 requests per minute per IP
- Headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## SDK Example

```typescript
import { HearthfulClient } from '@hearthful/sdk';

const client = new HearthfulClient('your_api_key');

// Create an event
const event = await client.events.create(familyId, {
  title: 'Summer BBQ',
  startDate: '2024-07-04T18:00:00Z',
  location: {
    address: '123 Family Street'
  }
});

// Submit RSVP
const rsvp = await client.events.rsvp(event.id, {
  status: 'attending',
  guestCount: 2
});
``` 