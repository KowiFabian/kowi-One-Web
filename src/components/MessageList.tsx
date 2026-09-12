import React from 'react';
import { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, loading }) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-lg ${
              message.type === 'user'
                ? 'bg-primary text-white rounded-br-none'
                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
            }`}
          >
            <p className="text-sm md:text-base leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="bg-white text-gray-900 border border-gray-200 rounded-bl-none px-4 py-3 rounded-lg">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;