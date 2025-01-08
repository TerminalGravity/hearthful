# Photo Sharing API

This document outlines the API endpoints available for managing photos and albums in Hearthful.

## Base URL

```
https://api.hearthful.dev/v1
```

## Authentication

All endpoints require authentication using a JWT token provided by Clerk:

```bash
Authorization: Bearer <your_jwt_token>
```

## Album Endpoints

### List Albums

Retrieve albums for a family.

```http
GET /api/families/{familyId}/albums
```

#### Query Parameters

| Parameter | Type    | Description                     |
|-----------|---------|--------------------------------|
| page      | integer | Page number (default: 1)        |
| limit     | integer | Items per page (default: 20)    |
| sort      | string  | Sort order (recent/name/count)  |
| filter    | string  | Filter by type (all/shared)     |

#### Response

```typescript
{
  albums: Array<{
    id: string;
    name: string;
    description?: string;
    coverPhotoUrl?: string;
    photoCount: number;
    privacy: 'family_only' | 'members_only' | 'public';
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

### Create Album

Create a new photo album.

```http
POST /api/families/{familyId}/albums
```

#### Request Body

```typescript
{
  name: string;              // Required: Album name
  description?: string;      // Optional: Album description
  privacy: 'family_only' | 'members_only' | 'public';  // Required
  coverPhotoId?: string;    // Optional: Cover photo ID
}
```

### Get Album Details

```http
GET /api/albums/{albumId}
```

#### Response

```typescript
{
  id: string;
  familyId: string;
  name: string;
  description?: string;
  coverPhotoUrl?: string;
  privacy: string;
  photoCount: number;
  photos: Array<{
    id: string;
    thumbnailUrl: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

## Photo Endpoints

### List Photos

```http
GET /api/albums/{albumId}/photos
```

#### Query Parameters

| Parameter | Type    | Description                      |
|-----------|---------|----------------------------------|
| page      | integer | Page number (default: 1)         |
| limit     | integer | Items per page (default: 50)     |
| sort      | string  | Sort order (date/name)           |
| filter    | string  | Filter by tag/person/location    |

#### Response

```typescript
{
  photos: Array<{
    id: string;
    filename: string;
    thumbnailUrl: string;
    mediumUrl: string;
    largeUrl: string;
    metadata: {
      width: number;
      height: number;
      size: number;
      takenAt?: string;
    };
    tags: Array<{
      type: string;
      value: string;
    }>;
    createdAt: string;
  }>;
  pagination: {
    total: number;
    pages: number;
    current: number;
    limit: number;
  };
}
```

### Upload Photos

```http
POST /api/albums/{albumId}/photos
```

#### Request Body

Multipart form data containing:
- `photos[]`: Array of photo files
- `metadata`: JSON string with additional info (optional)

#### Response

```typescript
{
  uploaded: Array<{
    id: string;
    filename: string;
    thumbnailUrl: string;
    status: 'success';
  }>;
  failed: Array<{
    filename: string;
    error: string;
    status: 'failed';
  }>;
}
```

### Get Photo Details

```http
GET /api/photos/{photoId}
```

#### Response

```typescript
{
  id: string;
  albumId: string;
  filename: string;
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    mimeType: string;
    takenAt?: string;
    location?: {
      lat: number;
      lng: number;
      name?: string;
    };
  };
  tags: Array<{
    type: 'person' | 'location' | 'event';
    value: string;
    coordinates?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}
```

### Update Photo

```http
PATCH /api/photos/{photoId}
```

#### Request Body

```typescript
{
  filename?: string;
  metadata?: {
    takenAt?: string;
    location?: {
      lat: number;
      lng: number;
      name?: string;
    };
  };
}
```

### Delete Photos

```http
DELETE /api/photos
```

#### Request Body

```typescript
{
  photoIds: string[];
}
```

## Tag Management

### Add Tag

```http
POST /api/photos/{photoId}/tags
```

#### Request Body

```typescript
{
  type: 'person' | 'location' | 'event';
  value: string;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

### Remove Tag

```http
DELETE /api/photos/{photoId}/tags/{tagId}
```

## Sharing

### Generate Share Link

```http
POST /api/albums/{albumId}/share
```

#### Request Body

```typescript
{
  expiration?: string;  // ISO 8601 duration
  password?: string;    // Optional password protection
}
```

#### Response

```typescript
{
  shareUrl: string;
  expiration?: string;
  accessKey: string;
}
```

## Batch Operations

### Move Photos

```http
POST /api/photos/move
```

#### Request Body

```typescript
{
  photoIds: string[];
  targetAlbumId: string;
}
```

### Copy Photos

```http
POST /api/photos/copy
```

#### Request Body

```typescript
{
  photoIds: string[];
  targetAlbumId: string;
}
```

## Error Responses

Standard error responses as defined in the API standards:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 413 Payload Too Large

## Upload Limits

- Maximum file size: 25MB per photo
- Maximum batch upload: 100 photos
- Supported formats: JPEG, PNG, HEIF, WEBP

## SDK Example

```typescript
import { HearthfulClient } from '@hearthful/sdk';

const client = new HearthfulClient('your_api_key');

// Create an album
const album = await client.albums.create(familyId, {
  name: 'Summer Vacation 2024',
  privacy: 'family_only'
});

// Upload photos
const photos = await client.photos.upload(album.id, {
  files: photoFiles,
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
});

// Add tags
await client.photos.addTag(photos[0].id, {
  type: 'person',
  value: 'John Smith'
});
``` 