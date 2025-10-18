import { useState, KeyboardEvent } from 'react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

/**
 * T050: InputArea component
 * Message input with send button and keyboard shortcuts
 */
export function InputArea({ onSendMessage, disabled = false }: InputAreaProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-neutral-200 p-4 bg-white">
      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem... (Ctrl+Enter para enviar)"
          disabled={disabled}
          className="flex-1 resize-none border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          rows={3}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors self-end"
        >
          Enviar
        </button>
      </div>
      <p className="text-xs text-neutral-500 mt-2">
        Dica: Pressione Ctrl+Enter para enviar rapidamente
      </p>
    </div>
  );
}
