'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ImageIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface Album {
  id: string;
  name: string;
  description?: string;
  photos: Photo[];
  createdBy: {
    name: string;
  };
}

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

export function PhotoLibrary() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const handleDeleteAlbum = async (albumId: string) => {
    try {
      const res = await fetch(`/api/albums/${albumId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete album');

      toast({
        title: 'Success!',
        description: 'Album deleted successfully.',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete album. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditAlbum = (albumId: string) => {
    // Navigate to album edit page or open edit modal
    router.push(`/photos/albums/${albumId}/edit`);
  };

  const handleViewAlbum = (albumId: string) => {
    router.push(`/photos/albums/${albumId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {albums.map((album) => (
        <Card key={album.id} className="overflow-hidden">
          <div className="aspect-video relative group">
            {album.photos.length > 0 ? (
              <Image
                src={album.photos[0].url}
                alt={album.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="secondary"
                onClick={() => handleViewAlbum(album.id)}
              >
                View Album
              </Button>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{album.name}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleEditAlbum(album.id)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDeleteAlbum(album.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {album.photos.length} photos • Created by {album.createdBy.name}
            </p>
            {album.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {album.description}
              </p>
            )}
          </div>
        </Card>
      ))}

      {albums.length === 0 && (
        <div className="col-span-full flex items-center justify-center h-[400px] border-2 border-dashed rounded-xl">
          <div className="text-center space-y-4">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <div className="space-y-2">
              <p className="text-xl font-medium text-gray-700">No Albums Yet</p>
              <p className="text-sm text-gray-500">
                Create your first album to start organizing your photos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 