'use client';

import { useState } from 'react';
import { Card, Button, Slider, Chip } from '@nextui-org/react';
import {
  SparklesIcon,
  SunIcon,
  MoonIcon,
  SwatchIcon,
  PhotoIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';

interface Enhancement {
  id: string;
  name: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
}

interface Filter {
  id: string;
  name: string;
  preview: string;
  strength: number;
}

export function PhotoEnhancer() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const enhancements: Enhancement[] = [
    {
      id: 'brightness',
      name: 'Brightness',
      icon: <SunIcon className="h-4 w-4" />,
      value: 0,
      min: -100,
      max: 100,
      step: 1,
    },
    {
      id: 'contrast',
      name: 'Contrast',
      icon: <MoonIcon className="h-4 w-4" />,
      value: 0,
      min: -100,
      max: 100,
      step: 1,
    },
    {
      id: 'saturation',
      name: 'Saturation',
      icon: <SwatchIcon className="h-4 w-4" />,
      value: 0,
      min: -100,
      max: 100,
      step: 1,
    },
  ];

  const filters: Filter[] = [
    {
      id: 'vintage',
      name: 'Vintage',
      preview: '/sample/filters/vintage.jpg',
      strength: 0,
    },
    {
      id: 'dramatic',
      name: 'Dramatic',
      preview: '/sample/filters/dramatic.jpg',
      strength: 0,
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      preview: '/sample/filters/vibrant.jpg',
      strength: 0,
    },
  ];

  const [activeEnhancements, setActiveEnhancements] = useState<Enhancement[]>(enhancements);
  const [activeFilter, setActiveFilter] = useState<Filter | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedPhoto(url);
      setHistory([url]);
    }
  };

  const handleEnhancementChange = (id: string, value: number) => {
    setActiveEnhancements(prev =>
      prev.map(enhancement =>
        enhancement.id === id ? { ...enhancement, value } : enhancement
      )
    );
  };

  const handleFilterSelect = (filter: Filter) => {
    setActiveFilter(prev =>
      prev?.id === filter.id ? null : { ...filter, strength: 50 }
    );
  };

  const handleFilterStrengthChange = (strength: number) => {
    if (activeFilter) {
      setActiveFilter({ ...activeFilter, strength });
    }
  };

  const handleAutoEnhance = async () => {
    if (!selectedPhoto) return;

    setIsProcessing(true);
    try {
      // TODO: Implement AI auto-enhancement logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate new enhancement values
      setActiveEnhancements(prev =>
        prev.map(enhancement => ({
          ...enhancement,
          value: Math.random() * 50 - 25,
        }))
      );
      
      // Add to history
      setHistory(prev => [...prev, selectedPhoto]);
    } catch (error) {
      console.error('Error auto-enhancing:', error);
      alert('Failed to auto-enhance. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const previousState = history[history.length - 2];
      setSelectedPhoto(previousState);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-4">
          {selectedPhoto ? (
            <div className="relative aspect-video">
              <img
                src={selectedPhoto}
                alt="Selected"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:bg-default-100 transition-colors">
              <PhotoIcon className="h-12 w-12 text-default-400" />
              <p className="mt-2 text-default-600">
                Click to select a photo
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </label>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Enhancements</h3>
              <div className="flex gap-2">
                <Button
                  isIconOnly
                  variant="flat"
                  isDisabled={!selectedPhoto || history.length < 2}
                  onClick={handleUndo}
                >
                  <ArrowUturnLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  color="primary"
                  startContent={<SparklesIcon className="h-4 w-4" />}
                  isDisabled={!selectedPhoto}
                  isLoading={isProcessing}
                  onClick={handleAutoEnhance}
                >
                  Auto Enhance
                </Button>
              </div>
            </div>

            {activeEnhancements.map((enhancement) => (
              <div key={enhancement.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {enhancement.icon}
                    <span className="text-sm">{enhancement.name}</span>
                  </div>
                  <span className="text-sm text-default-400">
                    {enhancement.value > 0 ? '+' : ''}
                    {enhancement.value}
                  </span>
                </div>
                <Slider
                  size="sm"
                  step={enhancement.step}
                  minValue={enhancement.min}
                  maxValue={enhancement.max}
                  value={enhancement.value}
                  onChange={(value) => handleEnhancementChange(enhancement.id, value as number)}
                  className="max-w-md"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Filters</h3>
              {activeFilter && (
                <Button
                  variant="flat"
                  size="sm"
                  onClick={() => setActiveFilter(null)}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {filters.map((filter) => (
                <div
                  key={filter.id}
                  className={`cursor-pointer relative rounded-lg overflow-hidden ${
                    activeFilter?.id === filter.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleFilterSelect(filter)}
                >
                  <img
                    src={filter.preview}
                    alt={filter.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-2">
                    <p className="text-white text-xs text-center">
                      {filter.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {activeFilter && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Filter Strength</span>
                  <span className="text-sm text-default-400">
                    {activeFilter.strength}%
                  </span>
                </div>
                <Slider
                  size="sm"
                  step={1}
                  minValue={0}
                  maxValue={100}
                  value={activeFilter.strength}
                  onChange={(value) => handleFilterStrengthChange(value as number)}
                  className="max-w-md"
                />
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            variant="flat"
            isDisabled={!selectedPhoto}
          >
            Reset
          </Button>
          <Button
            color="primary"
            isDisabled={!selectedPhoto}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
} 