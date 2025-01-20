"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { uploadEventPhoto } from "@/app/actions/event";
import { CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface PhotoUploadProps {
  eventId: string;
  onUploadComplete?: () => void;
}

export function PhotoUpload({ eventId, onUploadComplete }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      await uploadEventPhoto(eventId, selectedFile);
      setSelectedFile(null);
      setPreview(null);
      onUploadComplete?.();
    } catch (err) {
      setError("Failed to upload photo. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <CloudArrowUpIcon className="h-8 w-8 mx-auto text-gray-400" />
          {isDragActive ? (
            <p className="text-sm text-gray-600">Drop the photo here</p>
          ) : (
            <div>
              <p className="text-sm text-gray-600">
                Drag and drop a photo here, or click to select
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Maximum file size: 5MB
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500 mt-2">{error}</div>
      )}

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
          >
            <XMarkIcon className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}

      {selectedFile && (
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md
              ${
                uploading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }
            `}
          >
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>
        </div>
      )}
    </div>
  );
} 