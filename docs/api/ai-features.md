# AI Features API

This document outlines the API endpoints available for AI-powered features in Hearthful.

## Base URL

```
https://api.hearthful.dev/v1
```

## Authentication

All endpoints require authentication using a JWT token provided by Clerk:

```bash
Authorization: Bearer <your_jwt_token>
```

## Recommendation Endpoints

### Get Game Recommendations

```http
POST /api/ai/recommendations/games
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
  weather?: {
    condition: string;
    temperature: number;
    precipitation: number;
  };
}
```

#### Response

```typescript
{
  recommendations: Array<{
    game: Game;
    matchScore: number;      // 0-100
    reasons: string[];       // Why recommended
    considerations: {
      weather: boolean;
      equipment: boolean;
      accessibility: boolean;
      previousSuccess: boolean;
    };
  }>;
}
```

### Get Recipe Recommendations

```http
POST /api/ai/recommendations/recipes
```

#### Request Body

```typescript
{
  dietary?: {
    restrictions: string[];
    preferences: string[];
  };
  occasion?: string;
  servings: number;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  timeLimit?: number;      // Minutes
  availableIngredients?: string[];
  season?: string;
}
```

#### Response

```typescript
{
  recommendations: Array<{
    recipe: Recipe;
    matchScore: number;
    adaptations: Array<{
      type: 'ingredient' | 'method' | 'portion';
      suggestion: string;
      reason: string;
    }>;
    nutritionalFit: number;
  }>;
}
```

## Content Analysis

### Analyze Photo

```http
POST /api/ai/analyze/photo
```

#### Request Body

```typescript
{
  photoUrl: string;
  analysisTypes: Array<
    'faces' |
    'objects' |
    'scene' |
    'text' |
    'emotions' |
    'altText'
  >;
}
```

#### Response

```typescript
{
  faces: Array<{
    boundingBox: BoundingBox;
    person?: {
      id: string;
      confidence: number;
    };
    age: {
      min: number;
      max: number;
    };
    emotion: string;
  }>;
  objects: Array<{
    label: string;
    confidence: number;
    boundingBox?: BoundingBox;
  }>;
  scene: {
    setting: string;
    timeOfDay: string;
    weather?: string;
    occasion?: string;
  };
  altText: string;
  suggestedTags: string[];
}
```

### Analyze Recipe

```http
POST /api/ai/analyze/recipe
```

#### Request Body

```typescript
{
  recipe: {
    ingredients: string[];
    instructions: string[];
    servings: number;
  };
  analysisTypes: Array<
    'nutrition' |
    'complexity' |
    'timing' |
    'equipment' |
    'substitutions'
  >;
}
```

#### Response

```typescript
{
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    vitamins: Record<string, number>;
  };
  complexity: {
    score: number;         // 0-100
    factors: string[];
    skillLevel: string;
  };
  timing: {
    prep: number;         // Minutes
    cook: number;
    total: number;
    concurrent: boolean;
  };
  equipment: string[];
  substitutions: Array<{
    ingredient: string;
    alternatives: Array<{
      name: string;
      ratio: number;
      notes: string;
    }>;
  }>;
}
```

## Natural Language Processing

### Smart Search

```http
POST /api/ai/search
```

#### Request Body

```typescript
{
  query: string;
  features: Array<'recipes' | 'photos' | 'games' | 'events'>;
  context?: {
    event?: string;
    season?: string;
    location?: string;
  };
  filters?: {
    date?: DateRange;
    people?: string[];
    tags?: string[];
  };
}
```

#### Response

```typescript
{
  results: {
    recipes: Recipe[];
    photos: Photo[];
    games: Game[];
    events: Event[];
  };
  relevance: Map<string, number>;
  suggestedFilters: string[];
  relatedQueries: string[];
}
```

### Generate Content

```http
POST /api/ai/generate
```

#### Request Body

```typescript
{
  type: 'recipe' | 'game' | 'event' | 'photo';
  context: {
    purpose: string;
    tone: string;
    length: 'short' | 'medium' | 'long';
  };
  data: any;              // Type-specific data
}
```

#### Response

```typescript
{
  content: {
    title?: string;
    description: string;
    tags: string[];
    sections?: {
      [key: string]: string;
    };
  };
  alternatives: Array<{
    content: string;
    style: string;
  }>;
}
```

## Personalization

### Get Family Insights

```http
GET /api/ai/insights/family/{familyId}
```

#### Response

```typescript
{
  preferences: {
    activities: Map<string, number>;
    recipes: Map<string, number>;
    scheduling: {
      preferredDays: string[];
      preferredTimes: string[];
    };
  };
  dynamics: {
    subgroups: Array<{
      members: string[];
      commonInterests: string[];
      activityLevel: number;
    }>;
  };
  recommendations: {
    activities: string[];
    recipes: string[];
    events: string[];
  };
}
```

### Update Learning Model

```http
POST /api/ai/learn
```

#### Request Body

```typescript
{
  type: 'preference' | 'interaction' | 'feedback';
  data: {
    userId: string;
    itemId: string;
    itemType: string;
    interaction: string;
    rating?: number;
    feedback?: string;
  };
}
```

## Error Handling

Standard error responses:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 422 Unprocessable Entity
- 429 Too Many Requests
- 500 AI Processing Error

Error response format:

```typescript
{
  error: {
    type: 'confidence' | 'processing' | 'data' | 'privacy';
    message: string;
    suggestions?: string[];
    fallback?: any;
  };
}
```

## Rate Limiting

- Rate limit: 50 requests per minute per IP
- Headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## SDK Example

```typescript
import { HearthfulAI } from '@hearthful/ai-sdk';

const ai = new HearthfulAI('your_api_key');

// Get game recommendations
const gameRecs = await ai.recommend.games({
  players: {
    count: 8,
    ageRange: { min: 5, max: 70 }
  },
  location: 'indoor',
  occasion: 'family_gathering'
});

// Analyze photo
const photoAnalysis = await ai.analyze.photo({
  photoUrl: 'https://example.com/photo.jpg',
  analysisTypes: ['faces', 'scene', 'altText']
});

// Get personalized insights
const insights = await ai.insights.family(familyId);
``` 