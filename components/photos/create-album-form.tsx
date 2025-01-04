'use client';

import { useState } from 'react';
import { Card, Input, Button, Textarea, Chip } from '@nextui-org/react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AlbumFormData {
  title: string;
  description: string;
  coverPhoto?: File;
  photos: File[];
  tags: string[];
}

export function CreateAlbumForm() {
  const [formData, setFormData] = useState<AlbumFormData>({
    title: '',
    description: '',
    photos: [],
    tags: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  const suggestedTags = ['family', 'vacation', 'birthday', 'holiday', 'pets', 'school', 'sports'];

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      if (!formData.coverPhoto) {
        setFormData(prev => ({
          ...prev,
          coverPhoto: files[0],
          photos: [...prev.photos, ...files],
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, ...files],
        }));
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      coverPhoto: index === 0 ? prev.photos[1] || undefined : prev.coverPhoto,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement album creation logic
      console.log('Creating album:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        photos: [],
        tags: [],
      });
      
      // Show success message
      alert('Album created successfully!');
    } catch (error) {
      console.error('Error creating album:', error);
      alert('Failed to create album. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Album Title"
            placeholder="Enter album title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            isRequired
          />

          <Textarea
            label="Description"
            placeholder="Describe your album..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Tags</p>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  onClose={() => handleRemoveTag(tag)}
                  variant="flat"
                >
                  {tag}
                </Chip>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newTag))}
              />
              <Button
                type="button"
                onClick={() => handleAddTag(newTag)}
                disabled={!newTag}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestedTags
                .filter(tag => !formData.tags.includes(tag))
                .map((tag) => (
                  <Chip
                    key={tag}
                    variant="flat"
                    className="cursor-pointer"
                    onClick={() => handleAddTag(tag)}
                  >
                    {tag}
                  </Chip>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Photos</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                      Cover Photo
                    </div>
                  )}
                </div>
              ))}
              <label className="border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-default-100 transition-colors">
                <PhotoIcon className="h-8 w-8 text-default-400" />
                <span className="text-sm text-default-600">
                  Add Photos
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotosChange}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="flat"
            onClick={() => {
              setFormData({
                title: '',
                description: '',
                photos: [],
                tags: [],
              });
            }}
          >
            Clear
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            isDisabled={formData.photos.length === 0}
          >
            Create Album
          </Button>
        </div>
      </form>
    </Card>
  );
} 