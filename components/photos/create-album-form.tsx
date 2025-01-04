'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PhotoUploader } from './photo-uploader';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  tags: z.string().optional(),
});

interface CreateAlbumFormProps {
  familyId: string;
}

export function CreateAlbumForm({ familyId }: CreateAlbumFormProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [albumId, setAlbumId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsCreating(true);

    try {
      const response = await fetch(`/api/families/${familyId}/albums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create album');
      }

      const album = await response.json();
      setAlbumId(album.id);
      toast.success('Album created successfully');
    } catch (error) {
      console.error('Album creation error:', error);
      toast.error('Failed to create album');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadComplete = () => {
    router.refresh();
    router.push(`/families/${familyId}/photos`);
  };

  return (
    <div className="space-y-6">
      {!albumId ? (
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Album Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter album title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter album description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter tags separated by commas"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating Album...' : 'Create Album'}
              </Button>
            </form>
          </Form>
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Photos</h2>
          <PhotoUploader
            familyId={familyId}
            albumId={albumId}
            onUploadComplete={handleUploadComplete}
          />
        </Card>
      )}
    </div>
  );
} 