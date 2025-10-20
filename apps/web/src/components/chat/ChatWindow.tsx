import { useEffect, useState } from 'react';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { ProgressBar } from './ProgressBar';
import { GenerationModal } from '../generation/GenerationModal';
import { socketService } from '../../services/socket.service';
import { useDocumentsStore } from '../../stores/documents.store';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  documentoId: string;
  onColetaCompleta?: () => void;
}

/**
 * T047: ChatWindow component
 * Main chat interface with message list, input, and progress
 */
export function ChatWindow({ documentoId, onColetaCompleta }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [progress, setProgress] = useState(0);
  const [camposColetados, setCamposColetados] = useState(0);
  const [camposFaltantes, setCamposFaltantes] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // T097, T098: Generation modal state
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  
  // T095: Connect to documents store for generation events
  const {
    onGenerationStarted,
    onGenerationProgress,
    onSectionGenerated,
    onGenerationComplete,
    onGenerationError,
  } = useDocumentsStore();

  useEffect(() => {
    // Connect to WebSocket
    socketService.connect();

    // T055: Connection status listener
    socketService.on('connect', () => {
      setIsConnected(true);
      console.log('[ChatWindow] Socket connected');

      // Join document room
      socketService.emit('entrar_documento', { documentoId });
    });

    socketService.on('disconnect', () => {
      setIsConnected(false);
      console.log('[ChatWindow] Socket disconnected');
    });

    // T053: Listen for session loaded
    socketService.on('sessao_carregada', (data: any) => {
      console.log('[ChatWindow] Session loaded:', data);
      setMessages(data.mensagens || []);
      setProgress(data.progresso || 0);

      // Calculate campos coletados
      const coletados = Math.round((data.progresso / 100) * 11);
      setCamposColetados(coletados);
      setCamposFaltantes([]);
    });

    // T053: Listen for assistant messages
    socketService.on('mensagem_assistente', (data: any) => {
      console.log('[ChatWindow] Assistant message:', data);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.content,
          timestamp: data.timestamp,
        },
      ]);
      setIsLoading(false);
    });

    // T053: Listen for campo_coletado
    socketService.on('campo_coletado', (data: any) => {
      console.log('[ChatWindow] Field collected:', data);
    });

    // T053: Listen for progresso_coleta
    socketService.on('progresso_coleta', (data: any) => {
      console.log('[ChatWindow] Progress update:', data);
      setProgress(data.progresso);
      setCamposColetados(data.camposColetados);
      setCamposFaltantes(data.camposFaltantes || []);

      if (data.progresso === 100 && onColetaCompleta) {
        onColetaCompleta();
      }
    });

    // Listen for errors
    socketService.on('erro', (data: any) => {
      console.error('[ChatWindow] Error:', data);
      setIsLoading(false);
      alert(`Erro: ${data.message}`);
    });

    // T095: Listen for generation events
    socketService.on('geracao_iniciada', (data: any) => {
      console.log('[ChatWindow] Generation started:', data);
      onGenerationStarted(data);
      // T098: Show modal when generation starts
      setShowGenerationModal(true);
    });

    socketService.on('progresso_geracao', (data: any) => {
      console.log('[ChatWindow] Generation progress:', data);
      onGenerationProgress(data);
    });

    socketService.on('secao_gerada', (data: any) => {
      console.log('[ChatWindow] Section generated:', data);
      onSectionGenerated(data);
    });

    socketService.on('geracao_completa', (data: any) => {
      console.log('[ChatWindow] Generation complete:', data);
      onGenerationComplete(data);
    });

    socketService.on('erro_geracao', (data: any) => {
      console.error('[ChatWindow] Generation error:', data);
      onGenerationError(data);
    });

    return () => {
      // Cleanup listeners
      socketService.off('connect');
      socketService.off('disconnect');
      socketService.off('sessao_carregada');
      socketService.off('mensagem_assistente');
      socketService.off('campo_coletado');
      socketService.off('progresso_coleta');
      socketService.off('erro');
      // Cleanup generation listeners
      socketService.off('geracao_iniciada');
      socketService.off('progresso_geracao');
      socketService.off('secao_gerada');
      socketService.off('geracao_completa');
      socketService.off('erro_geracao');
    };
  }, [documentoId, onColetaCompleta, onGenerationStarted, onGenerationProgress, onSectionGenerated, onGenerationComplete, onGenerationError]);

  // T054: Handle send message
  const handleSendMessage = (content: string) => {
    if (!isConnected) {
      alert('Não conectado ao servidor. Tentando reconectar...');
      socketService.connect();
      return;
    }

    // Add user message optimistically
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Emit to server
    socketService.emit('enviar_mensagem', {
      documentoId,
      mensagem: content,
    });
  };

  const handleIniciarColeta = () => {
    if (!isConnected) {
      alert('Não conectado ao servidor. Tentando reconectar...');
      socketService.connect();
      return;
    }

    socketService.emit('iniciar_coleta', { documentoId });
  };

  // T097: Handle "Gerar ETP" button click
  const handleGerarETP = () => {
    if (!isConnected) {
      alert('Não conectado ao servidor. Tentando reconectar...');
      socketService.connect();
      return;
    }

    if (progress < 100) {
      alert('Coleta de dados ainda não está completa. Por favor, complete todos os campos obrigatórios.');
      return;
    }

    // Emit gerar_documento event
    socketService.emit('gerar_documento', { documentoId });
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* T055: Connection status indicator */}
      <div className="border-b border-neutral-200 px-4 py-2 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Coleta de Dados ETP
          </h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-neutral-600">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar
        progress={progress}
        camposColetados={camposColetados}
        camposFaltantes={camposFaltantes}
      />

      {/* Messages */}
      <MessageList messages={messages} />

      {/* T056, T097: Confirmar Dados button (appears at 100%) */}
      {progress === 100 && (
        <div className="px-4 py-2 bg-green-50 border-t border-green-200">
          <button
            onClick={handleGerarETP}
            className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
          >
            ✓ Gerar ETP
          </button>
        </div>
      )}

      {/* Input area */}
      <InputArea
        onSendMessage={handleSendMessage}
        disabled={!isConnected || isLoading}
      />

      {/* Helper: Start collection button (if no messages) */}
      {messages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50/90">
          <button
            onClick={handleIniciarColeta}
            disabled={!isConnected}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-neutral-300 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Iniciar Coleta de Dados
          </button>
        </div>
      )}

      {/* T096, T098, T099, T100: Generation Modal */}
      <GenerationModal
        isOpen={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        documentoUuid={documentoId}
      />
    </div>
  );
}
