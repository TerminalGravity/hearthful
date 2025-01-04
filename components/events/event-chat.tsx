'use client';

import { useChat, Message } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { useCurrentFamily } from '@/hooks/use-current-family';
import { useEvents } from '@/hooks/use-events';
import { toast } from 'sonner';
import { Button, Card, ScrollShadow, Input, Chip, Spinner } from '@nextui-org/react';
import { 
  PlusIcon, 
  UserCircleIcon, 
  ComputerDesktopIcon,
  ChevronDownIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface EventChatProps {
  onEventGenerated: (event: any) => void;
  onEventScheduled: () => void;
}

interface Event {
  name: string;
  description: string;
  date: string;
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

function EventCard({ event, onSave, isSaving }: { event: Event; onSave: () => void; isSaving: boolean }) {
  return (
    <Card className="p-6 space-y-4 w-full bg-gradient-to-br from-primary-50 to-background">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-primary">{event.name}</h3>
          <p className="text-sm text-gray-600">{event.description}</p>
        </div>
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          color="primary"
          onClick={onSave}
          isLoading={isSaving}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <ClockIcon className="h-4 w-4" />
          <span>{new Date(event.date).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPinIcon className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <UserGroupIcon className="h-4 w-4" />
          <span>{event.participants.length} participants</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <TagIcon className="h-4 w-4" />
          <span>{event.type}</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {event.tags.map((tag, i) => (
          <Chip 
            key={i} 
            size="sm" 
            variant="flat" 
            color="primary"
            classNames={{
              base: "bg-primary-100",
              content: "text-primary-700 font-medium",
            }}
          >
            {tag}
          </Chip>
        ))}
      </div>

      <div className="space-y-4">
        {event.type === 'meal' && (
          <>
            <div>
              <h4 className="font-medium mb-2 text-primary-700">Meal Details</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li className="text-gray-700">Type: {event.details.mealType}</li>
                {event.details.cuisine && (
                  <li className="text-gray-700">Cuisine: {event.details.cuisine}</li>
                )}
                {event.details.dietaryNotes && (
                  <li className="text-gray-700">Dietary Notes: {event.details.dietaryNotes}</li>
                )}
              </ul>
            </div>
          </>
        )}
        {event.type === 'game' && (
          <>
            <div>
              <h4 className="font-medium mb-2 text-primary-700">Game Details</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li className="text-gray-700">Type: {event.details.gameType}</li>
                {event.details.duration && (
                  <li className="text-gray-700">Duration: {event.details.duration} minutes</li>
                )}
                {event.details.equipment && event.details.equipment.length > 0 && (
                  <li className="text-gray-700">
                    Equipment: {event.details.equipment.join(', ')}
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function ChatMessage({ 
  message, 
  onSaveEvent, 
  isSaving 
}: { 
  message: Message; 
  onSaveEvent: (content: string) => void;
  isSaving: boolean;
}) {
  let content: any = null;
  
  try {
    if (message.content.includes('"name":')) {
      const match = message.content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if ('name' in parsed && 'type' in parsed) {
          content = { type: 'event', data: parsed };
        }
      }
    }
  } catch (e) {
    console.error('Failed to parse message content:', e);
  }

  const isUser = message.role === 'user';

  return (
    <div 
      className={clsx(
        'group flex gap-3 text-gray-600 text-sm',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
          <ComputerDesktopIcon className="h-4 w-4 text-primary" />
        </div>
      )}
      
      <div className={clsx(
        'flex flex-col max-w-[85%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        {content ? (
          <>
            {content.type === 'event' && (
              <EventCard 
                event={content.data} 
                onSave={() => onSaveEvent(message.content)}
                isSaving={isSaving}
              />
            )}
          </>
        ) : (
          <Card 
            className={clsx(
              'px-4 py-2',
              isUser ? 'bg-primary text-white' : 'bg-gray-100'
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </Card>
        )}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
          <UserCircleIcon className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  );
}

export function EventChat({ onEventGenerated, onEventScheduled }: EventChatProps) {
  const { currentFamily } = useCurrentFamily();
  const { createEvent } = useEvents(currentFamily?.id);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: "👋 Hi! I'm your event planning assistant. I can help you:\n\n• Create family events\n• Plan meals and game nights\n• Manage participants and RSVPs\n\nWhat would you like to do?",
      },
    ],
    body: {
      familyId: currentFamily?.id,
    },
    onResponse: (response) => {
      if (!response.ok) {
        toast.error('Failed to get response. Please try again.');
      }
    },
    onFinish: (message) => {
      if (message.content.includes('"name":')) {
        try {
          const eventMatch = message.content.match(/\{[\s\S]*\}/);
          if (eventMatch) {
            const event = JSON.parse(eventMatch[0]);
            if (event.name && event.autoSave) {
              handleSaveEvent(message.content);
            }
          }
        } catch (e) {
          console.error('Failed to parse event:', e);
        }
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error('An error occurred. Please try again.');
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSaveEvent = async (message: string) => {
    try {
      const eventMatch = message.match(/\{[\s\S]*\}/);
      if (!eventMatch) return;

      const event = JSON.parse(eventMatch[0]);
      setIsSaving(true);

      const savedEvent = await createEvent({
        name: event.name,
        description: event.description,
        date: event.date,
        location: event.location,
        type: event.type,
        participants: event.participants,
        details: event.details,
        tags: event.tags,
        familyId: currentFamily?.id,
      });

      onEventGenerated(savedEvent);
      toast.success('Event saved!');
    } catch (error) {
      console.error('Failed to save event:', error);
      toast.error('Failed to save event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-xl">
        <div className="text-center space-y-4">
          <ComputerDesktopIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <div className="space-y-2">
            <p className="text-xl font-medium text-gray-700">Select a Family</p>
            <p className="text-sm text-gray-500">
              Please select a family to start planning events together.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-xl bg-background">
      <ScrollShadow ref={scrollRef} className="flex-grow p-4 space-y-6">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            onSaveEvent={handleSaveEvent}
            isSaving={isSaving}
          />
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center">
              <ComputerDesktopIcon className="h-4 w-4 text-primary" />
            </div>
            <Card className="px-4 py-2 bg-gray-100">
              <Spinner size="sm" color="primary" />
            </Card>
          </div>
        )}
      </ScrollShadow>

      <div className="p-4 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSubmit}>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me about creating events, planning activities, or managing participants..."
            size="lg"
            radius="lg"
            classNames={{
              input: "text-sm",
              inputWrapper: "shadow-sm",
            }}
            endContent={
              <Button 
                type="submit"
                isIconOnly
                color="primary"
                size="sm"
                isLoading={isLoading}
                className="mr-1"
              >
                <ChevronDownIcon className="h-4 w-4 rotate-180" />
              </Button>
            }
          />
        </form>
      </div>
    </div>
  );
} 