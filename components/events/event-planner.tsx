'use client';

import { useState } from 'react';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { useEvents } from '@/hooks/use-events';
import { toast } from 'sonner';
import {
  Card,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Chip,
  Spinner,
} from '@nextui-org/react';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  TagIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface EventPlannerProps {
  onEventScheduled: () => void;
}

interface EventFormData {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'meal' | 'game';
  participants: string[];
  details: {
    mealType?: string;
    cuisine?: string;
    dietaryNotes?: string;
    gameType?: string;
    duration?: number;
    equipment?: string[];
  };
  tags: string[];
}

const initialFormData: EventFormData = {
  name: '',
  description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: format(new Date(), 'HH:mm'),
  location: '',
  type: 'meal',
  participants: [],
  details: {},
  tags: [],
};

export function EventPlanner({ onEventScheduled }: EventPlannerProps) {
  const { currentFamily } = useCurrentFamily();
  const { createEvent, isLoading } = useEvents(currentFamily?.id);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDetailsChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value,
      },
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const event = await createEvent({
        ...formData,
        date: dateTime.toISOString(),
        familyId: currentFamily?.id,
      });

      if (event) {
        toast.success('Event scheduled successfully!');
        onEventScheduled();
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error('Failed to schedule event:', error);
      toast.error('Failed to schedule event. Please try again.');
    }
  };

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-xl">
        <div className="text-center space-y-4">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <div className="space-y-2">
            <p className="text-xl font-medium text-gray-700">Select a Family</p>
            <p className="text-sm text-gray-500">
              Please select a family to start planning events.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Event Name"
              placeholder="Enter event name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />

            <Textarea
              label="Description"
              placeholder="Enter event description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />

            <Input
              type="time"
              label="Time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              required
            />
          </div>

          <Input
            label="Location"
            placeholder="Enter event location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            required
          />

          <Select
            label="Event Type"
            placeholder="Select event type"
            selectedKeys={[formData.type]}
            onChange={(e) => handleInputChange('type', e.target.value)}
            required
          >
            <SelectItem key="meal" value="meal">Meal</SelectItem>
            <SelectItem key="game" value="game">Game</SelectItem>
          </Select>

          {formData.type === 'meal' && (
            <div className="space-y-4">
              <Input
                label="Meal Type"
                placeholder="Enter meal type"
                value={formData.details.mealType || ''}
                onChange={(e) => handleDetailsChange('mealType', e.target.value)}
                required
              />

              <Input
                label="Cuisine"
                placeholder="Enter cuisine"
                value={formData.details.cuisine || ''}
                onChange={(e) => handleDetailsChange('cuisine', e.target.value)}
              />

              <Textarea
                label="Dietary Notes"
                placeholder="Enter any dietary notes"
                value={formData.details.dietaryNotes || ''}
                onChange={(e) => handleDetailsChange('dietaryNotes', e.target.value)}
              />
            </div>
          )}

          {formData.type === 'game' && (
            <div className="space-y-4">
              <Input
                label="Game Type"
                placeholder="Enter game type"
                value={formData.details.gameType || ''}
                onChange={(e) => handleDetailsChange('gameType', e.target.value)}
                required
              />

              <Input
                type="number"
                label="Duration (minutes)"
                placeholder="Enter game duration"
                value={formData.details.duration?.toString() || ''}
                onChange={(e) => handleDetailsChange('duration', parseInt(e.target.value))}
              />

              <div className="space-y-2">
                <Input
                  label="Equipment"
                  placeholder="Add equipment and press Enter"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <div className="flex gap-2 flex-wrap">
                  {formData.details.equipment?.map((item, i) => (
                    <Chip
                      key={i}
                      onClose={() => {
                        const newEquipment = formData.details.equipment?.filter((_, index) => index !== i);
                        handleDetailsChange('equipment', newEquipment);
                      }}
                      variant="flat"
                      color="primary"
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                label="Tags"
                placeholder="Add tags and press Enter"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                isIconOnly
                color="primary"
                variant="flat"
                onClick={handleAddTag}
                className="mt-7"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {formData.tags.map((tag, i) => (
                <Chip
                  key={i}
                  onClose={() => handleRemoveTag(tag)}
                  variant="flat"
                  color="primary"
                >
                  {tag}
                </Chip>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Schedule Event
          </Button>
        </div>
      </Card>
    </form>
  );
} 