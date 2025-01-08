# Recipe Management API

This document outlines the API endpoints available for managing recipes in Hearthful.

## Base URL

```
https://api.hearthful.dev/v1
```

## Authentication

All endpoints require authentication using a JWT token provided by Clerk:

```bash
Authorization: Bearer <your_jwt_token>
```

## Recipe Endpoints

### List Recipes

Retrieve recipes for a family.

```http
GET /api/families/{familyId}/recipes
```

#### Query Parameters

| Parameter | Type    | Description                      |
|-----------|---------|----------------------------------|
| page      | integer | Page number (default: 1)         |
| limit     | integer | Items per page (default: 20)     |
| sort      | string  | Sort order (recent/name/rating)  |
| category  | string  | Filter by category              |
| tags      | array   | Filter by tags                  |
| search    | string  | Search in name and description  |

#### Response

```typescript
{
  recipes: Array<{
    id: string;
    name: string;
    description?: string;
    prepTime: string;
    cookTime: string;
    servings: number;
    difficulty: string;
    thumbnailUrl?: string;
    categories: string[];
    tags: string[];
    createdBy: string;
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

### Create Recipe

Create a new recipe.

```http
POST /api/families/{familyId}/recipes
```

#### Request Body

```typescript
{
  name: string;              // Required: Recipe name
  description?: string;      // Optional: Recipe description
  servings: number;         // Required: Number of servings
  prepTime: string;         // Required: Preparation time
  cookTime: string;         // Required: Cooking time
  difficulty: 'easy' | 'medium' | 'hard';  // Required
  costEstimate?: 'budget' | 'moderate' | 'expensive';
  ingredients: Array<{      // Required: List of ingredients
    item: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{     // Required: Cooking steps
    step: number;
    text: string;
    photo?: File;
  }>;
  categories: string[];     // Required: Recipe categories
  tags?: string[];         // Optional: Recipe tags
  photos?: File[];         // Optional: Recipe photos
  nutrition?: {            // Optional: Nutritional info
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}
```

### Get Recipe Details

```http
GET /api/recipes/{recipeId}
```

#### Response

```typescript
{
  id: string;
  familyId: string;
  name: string;
  description?: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  costEstimate?: string;
  photos: Array<{
    id: string;
    url: string;
    thumbnailUrl: string;
  }>;
  ingredients: Array<{
    item: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    step: number;
    text: string;
    photo?: {
      url: string;
      thumbnailUrl: string;
    };
  }>;
  categories: string[];
  tags: string[];
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### Update Recipe

```http
PATCH /api/recipes/{recipeId}
```

#### Request Body

Same as Create Recipe, all fields optional.

### Delete Recipe

```http
DELETE /api/recipes/{recipeId}
```

## Collection Endpoints

### List Collections

```http
GET /api/families/{familyId}/recipe-collections
```

#### Response

```typescript
{
  collections: Array<{
    id: string;
    name: string;
    description?: string;
    coverPhotoUrl?: string;
    recipeCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

### Create Collection

```http
POST /api/families/{familyId}/recipe-collections
```

#### Request Body

```typescript
{
  name: string;
  description?: string;
  coverPhoto?: File;
  recipeIds?: string[];
}
```

## Meal Planning

### Create Meal Plan

```http
POST /api/families/{familyId}/meal-plans
```

#### Request Body

```typescript
{
  name: string;
  date: string;           // ISO 8601 date
  eventId?: string;       // Optional: Associated event
  servings: number;
  meals: Array<{
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    recipes: string[];    // Recipe IDs
    notes?: string;
  }>;
}
```

### Generate Shopping List

```http
GET /api/meal-plans/{mealPlanId}/shopping-list
```

#### Response

```typescript
{
  items: Array<{
    category: string;
    ingredients: Array<{
      item: string;
      amount: number;
      unit: string;
      recipes: Array<{
        id: string;
        name: string;
      }>;
    }>;
  }>;
}
```

## Recipe Search

### Search Recipes

```http
GET /api/recipes/search
```

#### Query Parameters

| Parameter  | Type    | Description                    |
|------------|---------|--------------------------------|
| query      | string  | Search query                   |
| categories | array   | Filter by categories           |
| tags       | array   | Filter by tags                 |
| difficulty | string  | Filter by difficulty           |
| time       | string  | Max total time (minutes)       |
| ingredients| array   | Required ingredients           |

## AI Features

### Get Recipe Suggestions

```http
POST /api/recipes/suggest
```

#### Request Body

```typescript
{
  ingredients?: string[];    // Available ingredients
  preferences?: {           // Dietary preferences
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
  };
  timeLimit?: number;       // Maximum cooking time
}
```

### Get Ingredient Substitutions

```http
POST /api/recipes/{recipeId}/substitutions
```

#### Request Body

```typescript
{
  ingredient: string;
  dietary?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
  };
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

// Create a recipe
const recipe = await client.recipes.create(familyId, {
  name: 'Grandma\'s Apple Pie',
  servings: 8,
  prepTime: '30 minutes',
  cookTime: '45 minutes',
  ingredients: [
    { item: 'Apples', amount: 6, unit: 'large' }
  ],
  instructions: [
    { step: 1, text: 'Preheat oven to 375°F' }
  ]
});

// Generate shopping list
const shoppingList = await client.mealPlans.getShoppingList(mealPlanId);
``` 