import { useState } from "react";
import { Input, Textarea, Button, Avatar, Upload } from "@nextui-org/react";
import { toast } from "sonner";

interface FamilyDetailsProps {
  family: Family;
  onUpdate: (updatedFamily: Family) => void;
}

export default function FamilyDetails({ family, onUpdate }: FamilyDetailsProps) {
  const [name, setName] = useState(family.name);
  const [description, setDescription] = useState(family.description);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      if (avatar) {
        formData.append("avatar", avatar);
      }

      const response = await fetch(`/api/families/${family.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update family details.");
      }

      const updatedFamily = await response.json();
      onUpdate(updatedFamily);
      toast.success("Family details updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating family details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar src={family.avatarUrl} size="lg" />
        <Upload
          onChange={(files) => {
            if (files.length > 0) {
              setAvatar(files[0]);
            }
          }}
          accept="image/*"
        >
          <Button auto color="primary">Change Avatar</Button>
        </Upload>
      </div>
      <Input
        label="Family Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter family name"
        fullWidth
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter a brief description about your family"
        fullWidth
      />
      <Button onPress={handleSave} disabled={isSubmitting} color="primary">
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
} 