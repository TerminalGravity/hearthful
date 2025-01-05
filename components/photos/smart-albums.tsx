'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, Calendar, MapPin, Users, Loader2 } from 'lucide-react';

interface SmartAlbumSuggestion {
  id: string;
  type: 'date' | 'location' | 'people';
  title: string;
  description: string;
  photoCount: number;
  confidence: number;
}

export function SmartAlbums() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<SmartAlbumSuggestion[]>([]);
  const { toast } = useToast();

  const startPhotoAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/photos/analyze', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to analyze photos');

      const data = await response.json();
      setSuggestions(data.suggestions);

      toast({
        title: 'Analysis Complete',
        description: 'Your photos have been analyzed and organized into smart collections.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to analyze photos. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createSmartAlbum = async (suggestion: SmartAlbumSuggestion) => {
    try {
      const response = await fetch('/api/albums/smart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suggestionId: suggestion.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to create smart album');

      toast({
        title: 'Success!',
        description: 'Smart album created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create smart album. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getIconForType = (type: SmartAlbumSuggestion['type']) => {
    switch (type) {
      case 'date':
        return <Calendar className="h-5 w-5" />;
      case 'location':
        return <MapPin className="h-5 w-5" />;
      case 'people':
        return <Users className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium">Smart Albums</h3>
            <p className="text-sm text-muted-foreground">
              Let AI analyze your photos and suggest meaningful collections
            </p>
          </div>
          <Button
            onClick={startPhotoAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Photos
              </>
            )}
          </Button>
        </div>

        {isAnalyzing && (
          <div className="space-y-2">
            <Progress value={45} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Analyzing your photos using AI...
            </p>
          </div>
        )}

        <div className="grid gap-4 mt-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getIconForType(suggestion.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{suggestion.title}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => createSmartAlbum(suggestion)}
                    >
                      Create Album
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{suggestion.photoCount} photos</span>
                    <span>•</span>
                    <span>{suggestion.confidence}% confidence</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {!isAnalyzing && suggestions.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Smart Album Suggestions Yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Click "Analyze Photos" to get AI-powered album suggestions
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 