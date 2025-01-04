'use client';

import { useState } from 'react';
import { Card, Button, Input, Textarea } from '@nextui-org/react';
import {
  SparklesIcon,
  PencilIcon,
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
} from '@heroicons/react/24/outline';

interface Story {
  id: string;
  title: string;
  description: string;
  photos: {
    url: string;
    caption: string;
  }[];
  duration: number; // in seconds
  createdAt: Date;
}

export function PhotoStories() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stories, setStories] = useState<Story[]>([
    {
      id: '1',
      title: 'Family Reunion 2023',
      description: 'A beautiful day spent with extended family',
      photos: [
        {
          url: '/sample/reunion-1.jpg',
          caption: 'Everyone gathered in the backyard',
        },
        {
          url: '/sample/reunion-2.jpg',
          caption: 'Sharing stories over dinner',
        },
        {
          url: '/sample/reunion-3.jpg',
          caption: 'Group photo by the lake',
        },
      ],
      duration: 5,
      createdAt: new Date(),
    },
    // Add more sample stories here
  ]);

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement AI story generation logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newStory: Story = {
        id: Date.now().toString(),
        title: 'Summer Adventures',
        description: 'Highlights from our summer activities',
        photos: [
          {
            url: '/sample/summer-1.jpg',
            caption: 'Morning hike in the mountains',
          },
          {
            url: '/sample/summer-2.jpg',
            caption: 'Picnic by the river',
          },
        ],
        duration: 5,
        createdAt: new Date(),
      };
      
      setStories(prev => [...prev, newStory]);
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentSlide((prev) =>
      prev === stories[0].photos.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevious = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? stories[0].photos.length - 1 : prev - 1
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Photo Stories</h3>
          <p className="text-sm text-default-600">
            Create beautiful narratives from your photo collections
          </p>
        </div>
        <Button
          color="primary"
          startContent={<SparklesIcon className="h-4 w-4" />}
          onClick={handleGenerateStory}
          isLoading={isGenerating}
        >
          Generate Story
        </Button>
      </div>

      {stories.length > 0 && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden relative">
              <img
                src={stories[0].photos[currentSlide].url}
                alt={stories[0].photos[currentSlide].caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white text-sm">
                  {stories[0].photos[currentSlide].caption}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{stories[0].title}</h4>
                <p className="text-sm text-default-600">
                  {stories[0].description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onClick={handlePrevious}
                >
                  <BackwardIcon className="h-4 w-4" />
                </Button>
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onClick={handleNext}
                >
                  <ForwardIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Story title"
                value={stories[0].title}
                startContent={<PencilIcon className="h-4 w-4" />}
                className="flex-1"
              />
              <Button color="primary" size="sm">
                Save
              </Button>
            </div>

            <Textarea
              placeholder="Story description"
              value={stories[0].description}
              className="w-full"
            />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.slice(1).map((story) => (
          <Card key={story.id} className="p-4">
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={story.photos[0].url}
                  alt={story.photos[0].caption}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h4 className="font-semibold">{story.title}</h4>
                <p className="text-sm text-default-600">{story.description}</p>
                <p className="text-xs text-default-400 mt-1">
                  {story.photos.length} photos ·{' '}
                  {new Date(story.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button size="sm" variant="flat">
                  Edit
                </Button>
                <Button size="sm" color="primary">
                  Play
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {stories.length === 0 && (
        <div className="text-center text-default-400 py-8">
          No stories created yet. Click the button above to start.
        </div>
      )}
    </div>
  );
} 