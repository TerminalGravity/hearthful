import { auth } from "@clerk/nextjs";
import { PhotoGallery } from "@/components/photos/photo-gallery";
import { PhotoUpload } from "@/components/photos/photo-upload";

export default async function PhotosPage() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Photo Library</h1>
        <PhotoUpload />
      </div>
      <PhotoGallery />
    </main>
  );
} 