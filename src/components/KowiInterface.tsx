'use client';

import React, { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import InputField from './InputField';
import GoalPanel from './GoalPanel';
import { Message, ConversationState } from '@/types';
import { kowiChat } from '@/lib/api';

const KowiInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '¿Qué quieres conseguir?',
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState<ConversationState | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string>(Date.now().toString());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await kowiChat(
        text,
        messages,
        conversationIdRef.current
      );

      if (response.success && response.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        if (response.data.goal) {
          setGoal(response.data.goal);
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'Disculpa, algo salió mal. Por favor intenta de nuevo.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Error de conexión. Por favor intenta de nuevo más tarde.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: '¿Qué quieres conseguir?',
        timestamp: new Date(),
      },
    ]);
    setGoal(null);
    conversationIdRef.current = Date.now().toString();
  };

  return (
    <div className="flex h-screen bg-secondary">
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-primary">KOWI</h1>
            <p className="text-sm text-gray-600 mt-1">
              Tu intención. Tu camino. Tu acción.
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <MessageList messages={messages} loading={loading} />
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <InputField
              onSend={handleSendMessage}
              disabled={loading}
              placeholder="Escribe tu objetivo..."
            />
          </div>
        </div>
      </div>

      {goal && (
        <GoalPanel
          goal={goal}
          onNewConversation={handleNewConversation}
        />
      )}
    </div>
  );
};

export default KowiInterface;