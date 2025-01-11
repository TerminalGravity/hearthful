"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCreateFamilyModal } from "./create-family-modal";
import { useFamilies } from "@/hooks/use-families";
import { Separator } from "@/components/ui/separator";
import { PlusCircle } from "lucide-react";

interface FamilySelectorDropdownProps {
  onFamilySelect?: (familyId: string) => void;
  selectedFamilyId?: string;
  className?: string;
}

export default function FamilySelectorDropdown({
  onFamilySelect,
  selectedFamilyId,
  className,
}: FamilySelectorDropdownProps) {
  const router = useRouter();
  const { families, isLoading } = useFamilies();
  const { setShowCreateFamilyModal, CreateFamilyModal } = useCreateFamilyModal();

  const handleFamilySelect = (value: string) => {
    onFamilySelect?.(value);
    // Update URL with selected family
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('familyId', value);
    router.push(`${window.location.pathname}?${searchParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Family</Label>
        <Select disabled>
          <SelectTrigger className="w-[240px] bg-white border-input">
            <SelectValue placeholder="Loading..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  const selectedFamily = families.find(f => f.id === selectedFamilyId);

  return (
    <div className="space-y-2">
      <Label>Family</Label>
      <Select
        value={selectedFamilyId}
        onValueChange={handleFamilySelect}
      >
        <SelectTrigger className="w-[240px] bg-white border-input">
          <SelectValue>
            {selectedFamily ? selectedFamily.name : "Select a family"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white">
          {families.map((family) => (
            <SelectItem 
              key={family.id} 
              value={family.id}
            >
              {family.name}
            </SelectItem>
          ))}
          <Separator className="my-2" />
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-2 py-1.5 text-sm font-normal hover:bg-accent hover:text-accent-foreground"
            onClick={() => setShowCreateFamilyModal(true)}
          >
            <PlusCircle className="h-4 w-4" />
            Create a Family
          </Button>
        </SelectContent>
      </Select>
      <CreateFamilyModal />
    </div>
  );
} 