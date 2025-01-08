# Integration APIs

This document outlines the API endpoints available for cross-feature integrations in Hearthful.

## Base URL

```
https://api.hearthful.dev/v1
```

## Authentication

All endpoints require authentication using a JWT token provided by Clerk:

```bash
Authorization: Bearer <your_jwt_token>
```

## Event Integration Endpoints

### Create Event Plan

```http
POST /api/events/{eventId}/plan
```

#### Request Body

```typescript
{
  type: string;           // Event type
  date: string;          // ISO 8601 date
  duration: number;      // Hours
  attendees: string[];   // User IDs
  location: {
    type: 'indoor' | 'outdoor' | 'both';
    address?: string;
    venue?: string;
  };
  preferences: {
    activities?: string[];
    dietary?: string[];
    budget?: {
      total: number;
      breakdown: Record<string, number>;
    };
  };
}
```

#### Response

```typescript
{
  event: Event;
  schedule: Array<{
    time: string;
    duration: number;
    type: 'activity' | 'meal' | 'break';
    details: {
      game?: Game;
      recipe?: Recipe;
      description?: string;
    };
    location: string;
    equipment: string[];
    assignments: Array<{
      role: string;
      assignee: string;
    }>;
  }>;
  resources: {
    equipment: Equipment[];
    shopping: ShoppingList;
    preparations: Task[];
  };
}
```

### Update Event Plan

```http
PATCH /api/events/{eventId}/plan
```

#### Request Body

```typescript
{
  updates: Array<{
    time: string;
    changes: {
      activity?: string;
      duration?: number;
      location?: string;
      assignments?: Array<{
        role: string;
        assignee: string;
      }>;
    };
  }>;
}
```

## Content Integration

### Create Content Collection

```http
POST /api/collections
```

#### Request Body

```typescript
{
  name: string;
  type: 'holiday' | 'tradition' | 'milestone';
  content: {
    events?: string[];    // Event IDs
    photos?: string[];    // Photo IDs
    recipes?: string[];   // Recipe IDs
    games?: string[];     // Game IDs
  };
  metadata: {
    description?: string;
    tags?: string[];
    season?: string;
    occasion?: string;
  };
}
```

### Link Content Items

```http
POST /api/content/link
```

#### Request Body

```typescript
{
  primary: {
    type: 'event' | 'recipe' | 'game' | 'photo';
    id: string;
  };
  related: Array<{
    type: 'event' | 'recipe' | 'game' | 'photo';
    id: string;
    relationship: 'used_in' | 'inspired_by' | 'part_of' | 'related_to';
  }>;
}
```

## Resource Management

### Reserve Resources

```http
POST /api/resources/reserve
```

#### Request Body

```typescript
{
  eventId: string;
  resources: Array<{
    type: 'equipment' | 'venue' | 'material';
    id: string;
    quantity: number;
    from: string;     // ISO 8601 datetime
    to: string;       // ISO 8601 datetime
  }>;
}
```

### Get Resource Availability

```http
GET /api/resources/availability
```

#### Query Parameters

| Parameter | Type   | Description            |
|-----------|--------|------------------------|
| type      | string | Resource type         |
| from      | string | Start datetime        |
| to        | string | End datetime          |
| location  | string | Optional location     |

#### Response

```typescript
{
  available: Array<{
    resource: Resource;
    slots: Array<{
      from: string;
      to: string;
      quantity: number;
    }>;
  }>;
  conflicts: Array<{
    resource: Resource;
    reservations: Reservation[];
  }>;
}
```

## Timeline Integration

### Get Timeline

```http
GET /api/timeline
```

#### Query Parameters

| Parameter | Type    | Description                |
|-----------|---------|----------------------------|
| from      | string  | Start date                |
| to        | string  | End date                  |
| types     | string  | Content types to include  |
| family    | string  | Family ID                 |

#### Response

```typescript
{
  timeline: Array<{
    date: string;
    items: Array<{
      type: 'event' | 'recipe' | 'game' | 'photo';
      content: any;
      metadata: {
        importance: number;
        tags: string[];
        people: string[];
      };
    }>;
  }>;
  highlights: {
    events: Event[];
    photos: Photo[];
    recipes: Recipe[];
    games: Game[];
  };
}
```

## Memory Integration

### Create Memory

```http
POST /api/memories
```

#### Request Body

```typescript
{
  type: 'event' | 'tradition' | 'milestone';
  date: string;
  title: string;
  description: string;
  content: {
    photos?: string[];
    recipes?: string[];
    games?: string[];
    stories?: Array<{
      author: string;
      text: string;
      media?: string[];
    }>;
  };
  people: string[];
  location?: string;
  tags: string[];
}
```

### Get Memory Book

```http
GET /api/families/{familyId}/memories
```

#### Query Parameters

| Parameter | Type   | Description            |
|-----------|--------|------------------------|
| year      | number | Optional year filter   |
| type      | string | Memory type filter     |
| people    | string | People involved        |

#### Response

```typescript
{
  memories: Array<{
    memory: Memory;
    related: {
      events: Event[];
      photos: Photo[];
      recipes: Recipe[];
      games: Game[];
    };
    context: {
      season: string;
      occasion: string;
      location: string;
    };
  }>;
  collections: Array<{
    type: string;
    memories: string[];
    highlights: any[];
  }>;
}
```

## Error Handling

Standard error responses:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Unprocessable Entity

Error response format:

```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
    resolution?: string[];
  };
}
```

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

// Create comprehensive event plan
const eventPlan = await client.events.createPlan(eventId, {
  type: 'family_reunion',
  date: '2024-07-04',
  duration: 6,
  attendees: ['user1', 'user2'],
  location: {
    type: 'both',
    venue: 'Family Farm'
  }
});

// Create memory collection
const memory = await client.memories.create({
  type: 'tradition',
  title: 'Annual Summer BBQ',
  content: {
    photos: ['photo1', 'photo2'],
    recipes: ['recipe1'],
    games: ['game1']
  },
  people: ['user1', 'user2']
});

// Get family timeline
const timeline = await client.timeline.get({
  from: '2024-01-01',
  to: '2024-12-31',
  types: ['events', 'photos', 'recipes']
});
``` 