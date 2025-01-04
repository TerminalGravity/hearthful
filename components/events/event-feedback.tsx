'use client';

import { useState } from 'react';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { useEvents } from '@/hooks/use-events';
import { toast } from 'sonner';
import {
  Card,
  Button,
  Textarea,
  RadioGroup,
  Radio,
  Spinner,
} from '@nextui-org/react';
import {
  ChatBubbleBottomCenterTextIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface FeedbackFormData {
  rating: number;
  enjoyment: 'positive' | 'negative';
  comments: string;
  suggestions: string;
}

const initialFormData: FeedbackFormData = {
  rating: 5,
  enjoyment: 'positive',
  comments: '',
  suggestions: '',
};

export function EventFeedback() {
  const { currentFamily } = useCurrentFamily();
  const [formData, setFormData] = useState<FeedbackFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FeedbackFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement feedback submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Thank you for your feedback!');
      setFormData(initialFormData);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-xl">
        <div className="text-center space-y-4">
          <ChatBubbleBottomCenterTextIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <div className="space-y-2">
            <p className="text-xl font-medium text-gray-700">Select a Family</p>
            <p className="text-sm text-gray-500">
              Please select a family to provide event feedback.
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              How would you rate your overall experience?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  type="button"
                  isIconOnly
                  variant={formData.rating === rating ? 'solid' : 'flat'}
                  color={formData.rating === rating ? 'primary' : 'default'}
                  onClick={() => handleInputChange('rating', rating)}
                  className="w-12 h-12"
                >
                  <StarIcon className="h-5 w-5" />
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Did you enjoy the event?
            </label>
            <RadioGroup
              value={formData.enjoyment}
              onValueChange={(value) => handleInputChange('enjoyment', value)}
              orientation="horizontal"
            >
              <Radio
                value="positive"
                startContent={<FaceSmileIcon className="h-5 w-5 text-success" />}
              >
                Yes, it was great!
              </Radio>
              <Radio
                value="negative"
                startContent={<FaceFrownIcon className="h-5 w-5 text-danger" />}
              >
                No, it could be better
              </Radio>
            </RadioGroup>
          </div>

          <Textarea
            label="What did you like about the event?"
            placeholder="Share your thoughts..."
            value={formData.comments}
            onChange={(e) => handleInputChange('comments', e.target.value)}
            minRows={3}
          />

          <Textarea
            label="How can we improve future events?"
            placeholder="Your suggestions are valuable..."
            value={formData.suggestions}
            onChange={(e) => handleInputChange('suggestions', e.target.value)}
            minRows={3}
          />

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            Submit Feedback
          </Button>
        </div>
      </Card>
    </form>
  );
} 