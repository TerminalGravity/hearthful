# Photo Sharing

The Photo Sharing feature allows families to create, organize, and share photo albums and memories within their family groups.

## Overview

Photo Sharing in Hearthful enables families to:
- Create and manage photo albums
- Upload and organize photos
- Tag family members
- Add descriptions and memories
- Control sharing permissions

## Features

### Album Management
- Create photo albums
- Set album privacy settings
- Organize photos by event/date
- Add album descriptions
- Set cover photos

### Photo Upload
- Bulk photo uploads
- Drag-and-drop interface
- Mobile upload support
- Auto-organization by date
- EXIF data preservation

### Photo Organization

#### Smart Albums
- Event-based albums
- Date-based collections
- Location grouping
- People collections
- Auto-tagged albums

#### Manual Organization
- Custom albums
- Photo moving/copying
- Batch operations
- Custom sorting
- Favorites marking

### Photo Enhancement
- Basic editing tools
- Auto-enhancement
- Filters and effects
- Cropping and rotation
- Metadata editing

## Usage Examples

### Creating an Album

```typescript
// Using the Photo UI
1. Navigate to Photos page
2. Click "Create New Album"
3. Fill in album details:
   - Name
   - Description
   - Privacy Settings
4. Upload photos
5. Organize and tag

// Using the API
const response = await fetch('/api/families/${familyId}/albums', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Summer Vacation 2024',
    description: 'Our family trip to the beach',
    privacy: 'family_only'
  })
});
```

### Uploading Photos

```typescript
// Using the Upload Component
<PhotoUpload
  albumId="album_123"
  onUpload={(files) => handleUpload(files)}
  accept="image/*"
  multiple
/>

// Using the API
const formData = new FormData();
photos.forEach(photo => {
  formData.append('photos', photo);
});

await fetch('/api/albums/${albumId}/photos', {
  method: 'POST',
  body: formData
});
```

## Best Practices

1. **Album Organization**
   - Use descriptive names
   - Add detailed descriptions
   - Set appropriate privacy
   - Organize chronologically

2. **Photo Management**
   - Tag people promptly
   - Add location data
   - Write descriptions
   - Maintain originals

3. **Sharing**
   - Respect privacy settings
   - Consider file sizes
   - Use batch operations
   - Share responsibly

## Technical Details

### Data Model

```typescript
interface Album {
  id: string;
  familyId: string;
  name: string;
  description?: string;
  coverPhotoId?: string;
  privacy: 'family_only' | 'members_only' | 'public';
  photoCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Photo {
  id: string;
  albumId: string;
  uploadedBy: string;
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
    takenAt?: Date;
    location?: {
      lat: number;
      lng: number;
      name?: string;
    };
  };
  tags: Array<{
    type: 'person' | 'location' | 'event';
    value: string;
  }>;
  createdAt: Date;
}

interface PhotoTag {
  id: string;
  photoId: string;
  type: 'person' | 'location' | 'event';
  value: string;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  createdBy: string;
  createdAt: Date;
}
```

### Storage Architecture

```typescript
// AWS S3 Storage Configuration
const storageConfig = {
  original: {
    bucket: 'hearthful-photos-original',
    acl: 'private'
  },
  processed: {
    bucket: 'hearthful-photos-processed',
    acl: 'public-read',
    variants: {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 800, height: 800 },
      large: { width: 1600, height: 1600 }
    }
  }
};

// Image Processing Pipeline
async function processUploadedPhoto(photo: File) {
  // 1. Upload original
  const original = await uploadToS3(photo, storageConfig.original);
  
  // 2. Generate variants
  const variants = await Promise.all(
    Object.entries(storageConfig.processed.variants)
      .map(([size, dimensions]) => 
        generateVariant(photo, dimensions)
      )
  );

  // 3. Store metadata
  const metadata = await extractMetadata(photo);
  
  return {
    original,
    variants,
    metadata
  };
}
```

## Integration Features

### AI Features
- Face recognition
- Auto-tagging
- Scene detection
- Object recognition
- Smart search

### Sharing Options
- Direct sharing
- Album sharing
- Link generation
- Social media export
- Email sharing

### Export Features
- Download originals
- Batch downloads
- Archive creation
- Print ordering
- Backup options

## Security and Privacy

1. **Access Control**
   - Album-level permissions
   - Photo-level privacy
   - Watermarking options
   - Download restrictions

2. **Data Protection**
   - Encrypted storage
   - EXIF cleaning
   - Location privacy
   - Secure sharing

## Performance Optimization

1. **Upload Optimization**
   - Chunked uploads
   - Resume support
   - Parallel processing
   - Background uploads

2. **Delivery Optimization**
   - CDN distribution
   - Lazy loading
   - Progressive loading
   - Responsive images

## Future Enhancements

1. **Planned Features**
   - AI-powered stories
   - Video support
   - Live photo albums
   - Collaborative editing

2. **Improvements**
   - Enhanced search
   - Better organization
   - Advanced editing
   - More sharing options 