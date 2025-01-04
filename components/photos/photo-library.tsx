'use client';

import { useState } from 'react';
import { Card, Input, Button, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  HeartIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface Photo {
  id: string;
  url: string;
  title: string;
  description?: string;
  date: string;
  tags: string[];
  album?: string;
  likes: number;
}

export function PhotoLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: '1',
      url: '/sample/family-photo-1.jpg',
      title: 'Summer Vacation 2023',
      description: 'Family trip to the beach',
      date: '2023-07-15',
      tags: ['vacation', 'beach', 'summer'],
      album: 'Summer 2023',
      likes: 5,
    },
    // Add more sample photos here
  ]);

  const tags = ['vacation', 'beach', 'summer', 'birthday', 'holiday', 'family', 'pets'];
  const albums = ['all', 'Summer 2023', 'Birthday Parties', 'Family Events'];

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => photo.tags.includes(tag));
    const matchesAlbum = selectedAlbum === 'all' || photo.album === selectedAlbum;
    return matchesSearch && matchesTags && matchesAlbum;
  });

  const handlePhotoAction = (photoId: string, action: 'like' | 'share' | 'edit' | 'delete') => {
    switch (action) {
      case 'like':
        setPhotos(prev => prev.map(photo =>
          photo.id === photoId ? { ...photo, likes: photo.likes + 1 } : photo
        ));
        break;
      case 'share':
        // TODO: Implement share functionality
        console.log('Share photo:', photoId);
        break;
      case 'edit':
        // TODO: Implement edit functionality
        console.log('Edit photo:', photoId);
        break;
      case 'delete':
        setPhotos(prev => prev.filter(photo => photo.id !== photoId));
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search photos..."
          startContent={<MagnifyingGlassIcon className="h-4 w-4 text-default-400" />}
          className="max-w-xs"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <FunnelIcon className="h-4 w-4 text-default-400" />
          {tags.map((tag) => (
            <Chip
              key={tag}
              variant="flat"
              isSelected={selectedTags.includes(tag)}
              onClick={() => {
                setSelectedTags(prev =>
                  prev.includes(tag)
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                );
              }}
              className="cursor-pointer"
            >
              {tag}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <select
          value={selectedAlbum}
          onChange={(e) => setSelectedAlbum(e.target.value)}
          className="rounded-lg border border-default-200 px-3 py-2"
        >
          {albums.map((album) => (
            <option key={album} value={album}>
              {album === 'all' ? 'All Albums' : album}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'solid' : 'flat'}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'masonry' ? 'solid' : 'flat'}
            onClick={() => setViewMode('masonry')}
          >
            Masonry
          </Button>
        </div>
      </div>

      <div className={`grid gap-4 ${
        viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
      }`}>
        {filteredPhotos.map((photo) => (
          <Card key={photo.id} className="group">
            <div className="relative">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  isIconOnly
                  variant="flat"
                  className="bg-white/20"
                  onClick={() => handlePhotoAction(photo.id, 'like')}
                >
                  <HeartIcon className="h-4 w-4" />
                </Button>
                <Button
                  isIconOnly
                  variant="flat"
                  className="bg-white/20"
                  onClick={() => handlePhotoAction(photo.id, 'share')}
                >
                  <ShareIcon className="h-4 w-4" />
                </Button>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      variant="flat"
                      className="bg-white/20"
                    >
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem
                      startContent={<PencilIcon className="h-4 w-4" />}
                      onClick={() => handlePhotoAction(photo.id, 'edit')}
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      startContent={<TrashIcon className="h-4 w-4" />}
                      className="text-danger"
                      color="danger"
                      onClick={() => handlePhotoAction(photo.id, 'delete')}
                    >
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <h3 className="font-semibold">{photo.title}</h3>
              {photo.description && (
                <p className="text-sm text-default-600">{photo.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-default-400">
                <span>{new Date(photo.date).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <HeartIcon className="h-4 w-4" />
                  {photo.likes}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {photo.tags.map((tag) => (
                  <Chip key={tag} size="sm" variant="flat">
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center text-default-400 py-8">
          No photos found matching your criteria.
        </div>
      )}
    </div>
  );
} 