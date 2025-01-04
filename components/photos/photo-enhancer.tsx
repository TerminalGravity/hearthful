'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wand2,
  SunMedium,
  Contrast,
  Droplets,
  Sparkles,
  RotateCcw,
  Download,
} from 'lucide-react';

interface PhotoEnhancerProps {
  photoUrl: string;
  onEnhance?: (enhancedUrl: string) => void;
}

export function PhotoEnhancer({ photoUrl, onEnhance }: PhotoEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(photoUrl);
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
  });
  const [history, setHistory] = useState<string[]>([photoUrl]);

  const handleAdjustment = (type: keyof typeof adjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [type]: value }));
    // In a real implementation, we would apply the adjustments in real-time
    // For now, we'll just simulate it
    console.log(`Adjusting ${type} to ${value}`);
  };

  const handleAutoEnhance = async () => {
    setIsEnhancing(true);
    try {
      // In a real implementation, we would call an AI service to enhance the photo
      // For now, we'll just simulate it with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate receiving an enhanced photo URL
      const enhancedUrl = currentPhotoUrl;
      setCurrentPhotoUrl(enhancedUrl);
      setHistory(prev => [...prev, enhancedUrl]);
      onEnhance?.(enhancedUrl);
      
      toast.success('Photo enhanced successfully');
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error('Failed to enhance photo');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const previousUrl = history[history.length - 2];
      setCurrentPhotoUrl(previousUrl);
      setHistory(prev => prev.slice(0, -1));
      setAdjustments({
        brightness: 0,
        contrast: 0,
        saturation: 0,
      });
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentPhotoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'enhanced-photo.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download photo');
    }
  };

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="aspect-square relative rounded-lg overflow-hidden">
            <Image
              src={currentPhotoUrl}
              alt="Photo to enhance"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={history.length <= 1}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Button
            onClick={handleAutoEnhance}
            disabled={isEnhancing}
            className="w-full"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {isEnhancing ? 'Enhancing...' : 'Auto Enhance'}
          </Button>

          <Tabs defaultValue="adjust">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="adjust">Manual Adjust</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
            </TabsList>
            <TabsContent value="adjust" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <SunMedium className="h-4 w-4" />
                      Brightness
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {adjustments.brightness}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.brightness]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={([value]) => handleAdjustment('brightness', value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Contrast className="h-4 w-4" />
                      Contrast
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {adjustments.contrast}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.contrast]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={([value]) => handleAdjustment('contrast', value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      Saturation
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {adjustments.saturation}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.saturation]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={([value]) => handleAdjustment('saturation', value)}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="filters" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['Natural', 'Vivid', 'Dramatic', 'Warm', 'Cool', 'B&W'].map((filter) => (
                  <Button
                    key={filter}
                    variant="outline"
                    className="h-auto py-4"
                    onClick={() => {
                      // In a real implementation, we would apply the filter
                      console.log(`Applying ${filter} filter`);
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {filter}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Card>
  );
} 