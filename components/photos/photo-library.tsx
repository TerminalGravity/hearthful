'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

interface Album {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  createdAt: string;
  photos: {
    id: string;
    url: string;
    isCover: boolean;
  }[];
  createdBy: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface PhotoLibraryProps {
  familyId: string;
  albums: Album[];
}

export function PhotoLibrary({ familyId, albums }: PhotoLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    album.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    album.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link href={`/families/${familyId}/photos/create`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Album
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAlbums.map((album) => (
          <Link
            key={album.id}
            href={`/families/${familyId}/photos/albums/${album.id}`}
          >
            <Card className="group overflow-hidden">
              <div className="aspect-square relative">
                {album.photos[0] ? (
                  <Image
                    src={album.photos[0].url}
                    alt={album.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No photos</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{album.title}</h3>
                {album.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {album.description}
                  </p>
                )}
                {album.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {album.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  {album.createdBy.avatarUrl && (
                    <Image
                      src={album.createdBy.avatarUrl}
                      alt={album.createdBy.displayName || ''}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {album.createdBy.displayName || 'Unknown'} •{' '}
                    {new Date(album.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredAlbums.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No albums found</p>
        </div>
      )}
    </div>
  );
} 