"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  Upload,
  FolderPlus,
  X,
  MoreVertical,
  Pencil,
  Trash2,
  Sparkles,
  BookOpen,
  MessageSquare,
  Wrench,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useCurrentFamily } from "@/hooks/use-current-family";

interface Album {
  id: string;
  name: string;
  description?: string;
  photos: Photo[];
  createdBy: {
    name: string;
  };
}

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

export default function PhotosPage() {
  const { currentFamily, families } = useCurrentFamily();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [newAlbumData, setNewAlbumData] = useState({
    name: "",
    description: "",
  });
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [selectedTab, setSelectedTab] = useState("create");
  const [selectedToolTab, setSelectedToolTab] = useState("enhance");

  const router = useRouter();
  const { toast } = useToast();

  const handleFamilyChange = (familyId: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("familyId", familyId);
    window.history.pushState(null, "", `?${searchParams.toString()}`);
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
        title: "No files selected",
        description: "Please select at least one photo to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    if (selectedAlbum) formData.append("albumId", selectedAlbum);

    try {
      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload photos");

      toast({
        title: "Success!",
        description: "Photos uploaded successfully.",
      });

      setSelectedFiles([]);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const createAlbum = async () => {
    if (!newAlbumData.name) {
      toast({
        title: "Album name required",
        description: "Please enter a name for the album.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAlbum(true);
    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlbumData),
      });

      if (!res.ok) throw new Error("Failed to create album");

      toast({
        title: "Success!",
        description: "Album created successfully.",
      });

      setNewAlbumData({ name: "", description: "" });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create album. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Photos</h1>
        <Select
          value={currentFamily?.id}
          onValueChange={handleFamilyChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a family" />
          </SelectTrigger>
          <SelectContent>
            {families?.map((family) => (
              <SelectItem key={family.id} value={family.id}>
                {family.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!currentFamily ? (
        <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-xl">
          <div className="text-center space-y-4">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <div className="space-y-2">
              <p className="text-xl font-medium text-gray-700">Select a Family</p>
              <p className="text-sm text-gray-500">
                Please select a family to start sharing photos together.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex items-center gap-6 border-b border-gray-200">
            <button
              onClick={() => setSelectedTab("create")}
              className={cn(
                "flex items-center gap-2 px-2 py-3 border-b-2",
                selectedTab === "create"
                  ? "border-primary text-primary"
                  : "border-transparent"
              )}
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </button>
            <button
              onClick={() => setSelectedTab("assistant")}
              className={cn(
                "flex items-center gap-2 px-2 py-3 border-b-2",
                selectedTab === "assistant"
                  ? "border-primary text-primary"
                  : "border-transparent"
              )}
            >
              <Sparkles className="h-4 w-4" />
              <span>Assistant</span>
            </button>
            <button
              onClick={() => setSelectedTab("tools")}
              className={cn(
                "flex items-center gap-2 px-2 py-3 border-b-2",
                selectedTab === "tools"
                  ? "border-primary text-primary"
                  : "border-transparent"
              )}
            >
              <Wrench className="h-4 w-4" />
              <span>Tools</span>
            </button>
            <button
              onClick={() => setSelectedTab("library")}
              className={cn(
                "flex items-center gap-2 px-2 py-3 border-b-2",
                selectedTab === "library"
                  ? "border-primary text-primary"
                  : "border-transparent"
              )}
            >
              <BookOpen className="h-4 w-4" />
              <span>Library</span>
            </button>
            <button
              onClick={() => setSelectedTab("feedback")}
              className={cn(
                "flex items-center gap-2 px-2 py-3 border-b-2",
                selectedTab === "feedback"
                  ? "border-primary text-primary"
                  : "border-transparent"
              )}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Feedback</span>
            </button>
          </div>

          <div className="py-6">
            {selectedTab === "create" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center",
                      "hover:border-primary/50 transition-colors",
                      "cursor-pointer"
                    )}
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

                      <div className="mt-6 flex gap-4">
                        <Button
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="flex-1"
                        >
                          {isUploading
                            ? "Uploading..."
                            : `Upload ${selectedFiles.length} Photos`}
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
                  )}
                </Card>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <FolderPlus className="mr-2 h-4 w-4" />
                      Create New Album
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
                          placeholder="Enter album name"
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
                          placeholder="Enter album description"
                        />
                      </div>
                      <Button
                        onClick={createAlbum}
                        disabled={isCreatingAlbum}
                        className="w-full"
                      >
                        {isCreatingAlbum ? "Creating..." : "Create Album"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {selectedTab === "tools" && (
              <Tabs value={selectedToolTab} onValueChange={setSelectedToolTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="enhance" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Enhance Photos
                  </TabsTrigger>
                  <TabsTrigger value="smart-albums" className="gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Smart Albums
                  </TabsTrigger>
                  <TabsTrigger value="stories" className="gap-2">
                    <Video className="h-4 w-4" />
                    Photo Stories
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="enhance">
                  <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Enhance Photos</h3>
                    <p className="text-muted-foreground">
                      Automatically enhance your photos with AI-powered tools.
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="smart-albums">
                  <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Smart Albums</h3>
                    <p className="text-muted-foreground">
                      Automatically organize your photos into smart albums based on
                      people, places, and events.
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="stories">
                  <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Photo Stories</h3>
                    <p className="text-muted-foreground">
                      Create beautiful stories from your photos with AI-generated
                      narratives.
                    </p>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {selectedTab === "library" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album) => (
                  <Card key={album.id} className="overflow-hidden">
                    <div className="aspect-video relative group">
                      {album.photos.length > 0 ? (
                        <Image
                          src={album.photos[0].url}
                          alt={album.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" onClick={() => {}}>
                          View Album
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{album.name}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {album.photos.length} photos • Created by{" "}
                        {album.createdBy.name}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {selectedTab === "assistant" && (
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Photo Assistant</h3>
                <p className="text-muted-foreground">
                  Get AI-powered suggestions and help with your photos.
                </p>
              </Card>
            )}

            {selectedTab === "feedback" && (
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Share Your Feedback</h3>
                <p className="text-muted-foreground">
                  Help us improve the photo sharing experience by providing your
                  feedback and suggestions.
                </p>
                <Textarea
                  className="mt-4"
                  placeholder="Type your feedback here..."
                />
                <Button className="mt-4">Submit Feedback</Button>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 