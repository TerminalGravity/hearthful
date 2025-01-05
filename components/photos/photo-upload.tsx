"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { Upload, FolderPlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrentFamily } from '@/hooks/use-current-family';

interface Album {
  id: string;
  name: string;
  _count?: {
    photos: number;
  };
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

export function PhotoUpload() {
  const { currentFamily } = useCurrentFamily();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [newAlbumData, setNewAlbumData] = useState({
    name: '',
    description: '',
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{
    id: string;
    url: string;
    caption: string;
    album: {
      name: string;
      family: {
        name: string;
      };
    };
  }>>([]);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (currentFamily) {
      fetchAlbums();
    }
  }, [currentFamily]);

  const fetchAlbums = async () => {
    if (!currentFamily) return;

    setIsLoadingAlbums(true);
    try {
      const response = await fetch(`/api/albums?familyId=${currentFamily.id}`);
      if (!response.ok) throw new Error('Failed to fetch albums');
      
      const data = await response.json();
      setAlbums(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load albums. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAlbums(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one photo to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedAlbum) {
      toast({
        title: 'No album selected',
        description: 'Please select or create an album before uploading.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('files', file));
      formData.append('albumId', selectedAlbum);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/photos/upload');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadedPhotos((prev) => [...prev, ...response.photos]);
          toast({
            title: 'Success!',
            description: 'Photos uploaded successfully.',
          });
          setSelectedFiles([]);
        } else {
          throw new Error('Failed to upload photos');
        }
        setUploadProgress(0);
        setIsUploading(false);
      };

      xhr.onerror = () => {
        toast({
          title: 'Error',
          description: 'Failed to upload photos. Please try again.',
          variant: 'destructive',
        });
        setUploadProgress(0);
        setIsUploading(false);
      };

      xhr.send(formData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload photos. Please try again.',
        variant: 'destructive',
      });
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const createAlbum = async () => {
    if (!currentFamily) {
      toast({
        title: 'No family selected',
        description: 'Please select a family before creating an album.',
        variant: 'destructive',
      });
      return;
    }

    if (!newAlbumData.name) {
      toast({
        title: 'Album name required',
        description: 'Please enter a name for the album.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingAlbum(true);
    try {
      const res = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAlbumData,
          familyId: currentFamily.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to create album');

      const newAlbum = await res.json();
      setAlbums((prev) => [...prev, newAlbum]);
      setSelectedAlbum(newAlbum.id);

      toast({
        title: 'Success!',
        description: 'Album created successfully.',
      });

      setNewAlbumData({ name: '', description: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create album. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Select Album</h3>
          <div className="flex gap-4">
            <Select
              value={selectedAlbum || ''}
              onValueChange={setSelectedAlbum}
              disabled={isLoadingAlbums}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={isLoadingAlbums ? "Loading..." : "Choose an album"} />
              </SelectTrigger>
              <SelectContent>
                {albums.map((album) => (
                  <SelectItem key={album.id} value={album.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{album.name}</span>
                      {album._count && (
                        <span className="text-xs text-muted-foreground">
                          {album._count.photos} photos
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!currentFamily}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Album
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Album</DialogTitle>
                  <DialogDescription>
                    Create a new album to organize your photos.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Album Name</label>
                    <Input
                      value={newAlbumData.name}
                      onChange={(e) =>
                        setNewAlbumData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Summer Vacation 2023"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newAlbumData.description}
                      onChange={(e) =>
                        setNewAlbumData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Photos from our summer vacation..."
                    />
                  </div>
                  <Button
                    onClick={createAlbum}
                    disabled={isCreatingAlbum || !currentFamily}
                    className="w-full"
                  >
                    {isCreatingAlbum ? 'Creating...' : 'Create Album'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">
              Drag and drop photos here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supported formats: JPG, PNG, GIF
            </p>
            <Input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              id="photo-upload"
            />
            <Button asChild variant="secondary">
              <label htmlFor="photo-upload" className="cursor-pointer">
                Browse Files
              </label>
            </Button>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Selected Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-lg overflow-hidden"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6">
              {isUploading && (
                <div className="mb-4 space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Uploading {uploadProgress}%
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedAlbum}
                  className="flex-1"
                >
                  {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photos`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedFiles([])}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {uploadedPhotos.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Recently Uploaded Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-4">
                  <div className="text-white text-sm">
                    <p className="font-medium">{photo.caption}</p>
                    <p className="text-xs mt-1">
                      Album: {photo.album.name}
                    </p>
                    <p className="text-xs">
                      Family: {photo.album.family.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
} 