"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useModal } from "@/hooks/use-modal";
import { useApi } from "@/hooks/use-api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PlusIcon } from "lucide-react";

export function CreateFamilyButton() {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useModal();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { execute, isLoading } = useApi({
    onSuccess: (data) => {
      setName("");
      setDescription("");
      onClose();
      router.push(`/families/${data.id}`);
      router.refresh();
    },
    successMessage: "Family created successfully",
  });

  const handleCreate = async () => {
    await execute("/api/families", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
  };

  return (
    <>
      <Button onClick={onOpen} className="w-full">
        <PlusIcon className="h-4 w-4 mr-2" />
        Create New Family
      </Button>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Family</DialogTitle>
            <DialogDescription>
              Create a space for your family to connect and share memories.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Family Name
              </label>
              <Input
                id="name"
                placeholder="Enter family name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                placeholder="Tell us about your family"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleCreate}
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Family"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 