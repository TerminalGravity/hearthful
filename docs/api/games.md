# Games API

This document outlines the API endpoints available for managing games and activities in Hearthful.

## Base URL

```
https://api.hearthful.dev/v1
```

## Authentication

All endpoints require authentication using a JWT token provided by Clerk:

```bash
Authorization: Bearer <your_jwt_token>
```

## Game Endpoints

### List Games

Retrieve games from the library.

```http
GET /api/games
```

#### Query Parameters

| Parameter | Type    | Description                      |
|-----------|---------|----------------------------------|
| page      | integer | Page number (default: 1)         |
| limit     | integer | Items per page (default: 20)     |
| type      | string  | Game type filter                 |
| location  | string  | Indoor/outdoor filter            |
| minAge    | integer | Minimum age requirement          |
| maxAge    | integer | Maximum age limit                |
| players   | integer | Number of players                |
| duration  | integer | Maximum duration (minutes)        |
| difficulty| string  | Difficulty level                 |

#### Response

```typescript
{
  games: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    playerCount: {
      min: number;
      max: number;
      recommended: number;
    };
    ageRange: {
      min: number;
      max?: number;
    };
    duration: {
      min: number;
      max: number;
    };
    difficulty: string;
    location: string;
    equipment: string[];
    thumbnailUrl?: string;
  }>;
  pagination: {
    total: number;
    pages: number;
    current: number;
    limit: number;
  };
}
```

### Get Game Recommendations

```http
POST /api/games/recommend
```

#### Request Body

```typescript
{
  players: {
    count: number;
    ageRange: {
      min: number;
      max: number;
    };
  };
  duration?: number;        // Maximum duration in minutes
  location?: 'indoor' | 'outdoor' | 'both';
  occasion?: string;        // Type of gathering
  preferences?: {
    types?: string[];      // Preferred game types
    difficulty?: string;   // Preferred difficulty
    equipment?: string[];  // Available equipment
  };
}
```

#### Response

```typescript
{
  recommendations: Array<{
    game: {
      id: string;
      name: string;
      description: string;
      type: string;
      duration: {
        min: number;
        max: number;
      };
      equipment: string[];
    };
    matchScore: number;    // 0-100 recommendation strength
    reasons: string[];     // Why this game was recommended
  }>;
}
```

### Get Game Details

```http
GET /api/games/{gameId}
```

#### Response

```typescript
{
  id: string;
  name: string;
  description: string;
  type: string;
  playerCount: {
    min: number;
    max: number;
    recommended: number;
  };
  ageRange: {
    min: number;
    max?: number;
  };
  duration: {
    min: number;
    max: number;
  };
  difficulty: string;
  location: string;
  equipment: string[];
  instructions: string;
  rules: string[];
  tips: string[];
  photos: Array<{
    url: string;
    thumbnailUrl: string;
  }>;
  categories: string[];
  tags: string[];
}
```

## Collection Endpoints

### List Collections

```http
GET /api/families/{familyId}/game-collections
```

#### Response

```typescript
{
  collections: Array<{
    id: string;
    name: string;
    description?: string;
    gameCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

### Create Collection

```http
POST /api/families/{familyId}/game-collections
```

#### Request Body

```typescript
{
  name: string;
  description?: string;
  gameIds?: string[];
}
```

## Activity Planning

### Create Activity Plan

```http
POST /api/events/{eventId}/activities
```

#### Request Body

```typescript
{
  activities: Array<{
    time: string;          // ISO 8601 time
    gameId: string;
    duration: number;      // Minutes
    location: string;
    equipment?: string[];
    teams?: number;
    notes?: string;
  }>;
}
```

### Update Activity Plan

```http
PATCH /api/events/{eventId}/activities
```

#### Request Body

```typescript
{
  activities: Array<{
    id: string;
    time?: string;
    gameId?: string;
    duration?: number;
    location?: string;
    equipment?: string[];
    teams?: number;
    notes?: string;
  }>;
}
```

## Equipment Management

### List Equipment

```http
GET /api/families/{familyId}/equipment
```

#### Response

```typescript
{
  equipment: Array<{
    id: string;
    name: string;
    quantity: number;
    condition: string;
    location?: string;
    lastUsed?: string;
  }>;
}
```

### Reserve Equipment

```http
POST /api/events/{eventId}/equipment
```

#### Request Body

```typescript
{
  reservations: Array<{
    equipmentId: string;
    quantity: number;
    from: string;     // ISO 8601 datetime
    to: string;       // ISO 8601 datetime
  }>;
}
```

## Weather Integration

### Get Activity Weather

```http
GET /api/events/{eventId}/activities/weather
```

#### Response

```typescript
{
  activities: Array<{
    id: string;
    time: string;
    forecast: {
      condition: string;
      temperature: number;
      precipitation: number;
      wind: number;
    };
    recommendations: {
      proceed: boolean;
      alternativeId?: string;
      notes?: string;
    };
  }>;
}
```

## Error Responses

Standard error responses as defined in the API standards:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 422 Unprocessable Entity

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

// Get game recommendations
const recommendations = await client.games.recommend({
  players: {
    count: 8,
    ageRange: { min: 5, max: 70 }
  },
  duration: 30,
  location: 'indoor',
  occasion: 'family_gathering'
});

// Create activity plan
const activityPlan = await client.events.createActivityPlan(eventId, {
  activities: [
    {
      time: '2024-07-04T14:00:00Z',
      gameId: recommendations[0].game.id,
      duration: 30,
      location: 'Main Hall'
    }
  ]
});
``` 