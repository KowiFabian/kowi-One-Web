import React from 'react';
import { Message } from '@/types';

interface MessageListProps { messages: Message[]; loading: boolean; }

export default function MessageList({ messages, loading }: MessageListProps) {
  return <div className="space-y-4">
    {messages.map(message => <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] rounded-2xl px-4 py-3 md:max-w-[78%] md:px-5 md:py-4 ${
        message.type === 'user'
          ? 'rounded-br-sm bg-[#d7f2a7] text-[#17382f]'
          : 'rounded-bl-sm border border-white/10 bg-white/[.045] text-[#e9f4ec]'
      }`}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed md:text-base">{message.content}</p>
      </div>
    </div>)}
    {loading && <div className="flex justify-start"><div className="flex gap-2 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[.045] px-5 py-4">
      {[0,1,2].map(i => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-[#d7f2a7]" style={{ animationDelay: `${i * .12}s` }}/>)}
    </div></div>}
  </div>;
}
