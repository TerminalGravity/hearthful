'use client';

import { useState } from 'react';
import { Card, Input, Button, Avatar } from '@nextui-org/react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export function GameChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Implement AI response logic
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I can help you with game suggestions, rules explanations, and strategies. What would you like to know?',
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="h-[400px] overflow-y-auto space-y-4 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === 'assistant' ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              <Avatar
                size="sm"
                src={message.sender === 'assistant' ? '/ai-avatar.png' : undefined}
                fallback={message.sender === 'user' ? '👤' : '🤖'}
              />
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.sender === 'assistant'
                    ? 'bg-default-100'
                    : 'bg-primary text-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-default-400">
              <div className="animate-bounce">●</div>
              <div className="animate-bounce [animation-delay:0.2s]">●</div>
              <div className="animate-bounce [animation-delay:0.4s]">●</div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about games, rules, or strategies..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            isIconOnly
            color="primary"
            onClick={handleSendMessage}
            isLoading={isLoading}
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
} 