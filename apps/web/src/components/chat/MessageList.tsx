import { useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
}

/**
 * T048: MessageList component
 * Displays chat messages with auto-scroll
 */
export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-neutral-500">
          <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <MessageBubble
            key={`${message.timestamp}-${index}`}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}

/**
 * T049: MessageBubble component
 * Individual message with user/assistant styling
 */
interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-2xl rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-500 text-white ml-12'
            : 'bg-white border border-neutral-200 text-neutral-900 mr-12'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        <span
          className={`text-xs mt-1 block ${
            isUser ? 'text-blue-100' : 'text-neutral-400'
          }`}
        >
          {new Date(timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
