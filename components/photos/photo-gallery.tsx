"use client";

import { useState, useEffect } from "react";
import { getEventPhotos, deleteEventPhoto } from "@/app/actions/event";
import { PhotoUpload } from "./photo-upload";
import { TrashIcon } from "@heroicons/react/24/outline";

interface Photo {
  id: string;
  url: string;
  caption?: string;
  uploadedBy: string;
  timestamp: string;
}

interface PhotoGalleryProps {
  eventId: string;
  canUpload?: boolean;
}

export function PhotoGallery({ eventId, canUpload = true }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPhotos = async () => {
    try {
      const data = await getEventPhotos(eventId);
      setPhotos(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [eventId]);

  const handleDelete = async (photoId: string) => {
    setDeleting(photoId);
    try {
      await deleteEventPhoto(eventId, photoId);
      setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
    } catch (err) {
      console.error(err);
      setError("Failed to delete photo");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {canUpload && (
        <PhotoUpload eventId={eventId} onUploadComplete={fetchPhotos} />
      )}

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
          >
            <img
              src={photo.url}
              alt={photo.caption || "Event photo"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />
            <div className="absolute inset-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="h-full flex flex-col justify-between text-white">
                <div className="self-end">
                  <button
                    onClick={() => handleDelete(photo.id)}
                    disabled={deleting === photo.id}
                    className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                {photo.caption && (
                  <p className="text-sm font-medium">{photo.caption}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && !error && (
        <p className="text-center text-gray-500">No photos yet</p>
      )}
    </div>
  );
} 