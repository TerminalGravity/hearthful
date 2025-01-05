import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

interface PhotoUploadProps {
  eventId?: string;
}

export default function UploadPhotosPage({ eventId }: PhotoUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [newAlbumName, setNewAlbumName] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 10485760, // 10MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    if (!selectedAlbum && !newAlbumName) {
      toast.error("Please select an album or create a new one");
      return;
    }

    setIsUploading(true);
    try {
      // Upload logic here
      toast.success("Photos uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload photos");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Upload Photos</h2>
          <p className="text-sm text-muted-foreground">
            Share your family memories
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="album">Album</Label>
              <Select
                value={selectedAlbum}
                onValueChange={(value) => {
                  setSelectedAlbum(value);
                  if (value !== "new") setNewAlbumName("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select album or create new" />
                </SelectTrigger>
                <SelectContent>
                  {eventId && (
                    <SelectItem value={`event-${eventId}`}>
                      Current Event Album
                    </SelectItem>
                  )}
                  <SelectItem value="new">Create New Album</SelectItem>
                  {/* Existing albums would be mapped here */}
                </SelectContent>
              </Select>
            </div>

            {selectedAlbum === "new" && (
              <div className="space-y-2">
                <Label htmlFor="newAlbumName">New Album Name</Label>
                <Input
                  id="newAlbumName"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="Summer Vacation 2024"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Photos</Label>
              <div
                {...getRootProps()}
                className={`
                  flex flex-col items-center justify-center rounded-lg border-2 border-dashed 
                  p-12 transition-colors duration-200 ease-in-out
                  ${isDragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-300 hover:border-primary/50"}
                `}
              >
                <input {...getInputProps()} />
                <div className="space-y-2 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="mx-auto h-12 w-12 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-primary">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Photos ({files.length})</Label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-lg">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          width={200}
                          height={200}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for these photos..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline" asChild>
            <Link href="/photos">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isUploading || files.length === 0}>
            {isUploading ? "Uploading..." : "Upload Photos"}
          </Button>
        </div>
      </form>
    </div>
  );
} 