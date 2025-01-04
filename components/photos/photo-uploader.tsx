'use client';

import { useState, useCallback } from 'react';
import { Card, Button, Progress } from '@nextui-org/react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface UploadingPhoto {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function PhotoUploader() {
  const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhoto[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const newPhotos: UploadingPhoto[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'uploading',
    }));

    setUploadingPhotos(prev => [...prev, ...newPhotos]);

    // Simulate upload progress for each photo
    newPhotos.forEach(photo => {
      simulateUpload(photo.id);
    });
  };

  const simulateUpload = (photoId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadingPhotos(prev =>
          prev.map(photo =>
            photo.id === photoId
              ? { ...photo, progress: 100, status: 'success' }
              : photo
          )
        );
      } else {
        setUploadingPhotos(prev =>
          prev.map(photo =>
            photo.id === photoId
              ? { ...photo, progress }
              : photo
          )
        );
      }
    }, 500);
  };

  const handleRemovePhoto = (photoId: string) => {
    setUploadingPhotos(prev =>
      prev.map(photo =>
        photo.id === photoId
          ? { ...photo, status: 'error', error: 'Upload cancelled' }
          : photo
      )
    );
    setTimeout(() => {
      setUploadingPhotos(prev =>
        prev.filter(photo => photo.id !== photoId)
      );
    }, 2000);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-primary bg-primary/10' : 'border-default-200'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <PhotoIcon className="h-12 w-12 text-default-400" />
            <div>
              <p className="text-default-700 font-medium">
                Drag and drop your photos here
              </p>
              <p className="text-default-400 text-sm">
                or click to select files
              </p>
            </div>
            <label>
              <Button
                variant="flat"
                className="relative"
              >
                Select Photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                />
              </Button>
            </label>
          </div>
        </div>

        {uploadingPhotos.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Uploading Photos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {uploadingPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-default-50"
                >
                  <img
                    src={photo.preview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate">
                        {photo.file.name}
                      </p>
                      {photo.status === 'uploading' && (
                        <button
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="p-1 rounded-full hover:bg-default-100"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Progress
                      value={photo.progress}
                      color={
                        photo.status === 'success'
                          ? 'success'
                          : photo.status === 'error'
                          ? 'danger'
                          : 'primary'
                      }
                      size="sm"
                    />
                    {photo.error && (
                      <p className="text-xs text-danger mt-1">
                        {photo.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 