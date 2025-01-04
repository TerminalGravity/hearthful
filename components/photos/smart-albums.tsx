'use client';

import { useState } from 'react';
import { Card, Button, Chip } from '@nextui-org/react';
import {
  SparklesIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface SmartAlbum {
  id: string;
  title: string;
  description: string;
  type: 'date' | 'location' | 'people' | 'event' | 'theme';
  photoCount: number;
  coverPhotos: string[];
  tags: string[];
  confidence: number;
}

export function SmartAlbums() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [albums, setAlbums] = useState<SmartAlbum[]>([
    {
      id: '1',
      title: 'Summer Beach Trip 2023',
      description: 'Photos from our family vacation at the beach',
      type: 'event',
      photoCount: 45,
      coverPhotos: ['/sample/beach-1.jpg', '/sample/beach-2.jpg', '/sample/beach-3.jpg'],
      tags: ['beach', 'vacation', 'summer', 'family'],
      confidence: 0.95,
    },
    // Add more sample albums here
  ]);

  const handleGenerateAlbums = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement AI album generation logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add new generated albums
      const newAlbum: SmartAlbum = {
        id: Date.now().toString(),
        title: 'Birthday Celebrations',
        description: 'Collection of birthday party photos',
        type: 'theme',
        photoCount: 32,
        coverPhotos: ['/sample/birthday-1.jpg', '/sample/birthday-2.jpg'],
        tags: ['birthday', 'party', 'celebration'],
        confidence: 0.88,
      };
      
      setAlbums(prev => [...prev, newAlbum]);
    } catch (error) {
      console.error('Error generating albums:', error);
      alert('Failed to generate albums. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getAlbumIcon = (type: SmartAlbum['type']) => {
    switch (type) {
      case 'date':
        return <CalendarDaysIcon className="h-5 w-5" />;
      case 'location':
        return <MapPinIcon className="h-5 w-5" />;
      case 'people':
        return <UserGroupIcon className="h-5 w-5" />;
      case 'theme':
        return <TagIcon className="h-5 w-5" />;
      default:
        return <SparklesIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Smart Albums</h3>
          <p className="text-sm text-default-600">
            AI-powered photo organization based on dates, locations, people, and themes
          </p>
        </div>
        <Button
          color="primary"
          startContent={<SparklesIcon className="h-4 w-4" />}
          onClick={handleGenerateAlbums}
          isLoading={isGenerating}
        >
          Generate Albums
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {albums.map((album) => (
          <Card key={album.id} className="p-4">
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden relative">
                <div className="grid grid-cols-2 gap-1 h-full">
                  {album.coverPhotos.slice(0, 4).map((photo, index) => (
                    <div
                      key={index}
                      className={`relative ${
                        index === 0 && album.coverPhotos.length === 1
                          ? 'col-span-2 row-span-2'
                          : ''
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`Cover ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                  {album.photoCount} photos
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getAlbumIcon(album.type)}
                  <h4 className="font-semibold">{album.title}</h4>
                </div>
                <p className="text-sm text-default-600 mb-2">
                  {album.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-default-400">
                  <SparklesIcon className="h-4 w-4" />
                  {(album.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {album.tags.map((tag) => (
                  <Chip key={tag} size="sm" variant="flat">
                    {tag}
                  </Chip>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button size="sm" variant="flat">
                  Edit
                </Button>
                <Button size="sm" color="primary">
                  View
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {albums.length === 0 && (
        <div className="text-center text-default-400 py-8">
          No smart albums generated yet. Click the button above to start.
        </div>
      )}
    </div>
  );
} 