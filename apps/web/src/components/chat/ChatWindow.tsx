import { useEffect, useState } from 'react';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { ProgressBar } from './ProgressBar';
import { GenerationModal } from '../generation/GenerationModal';
import { socketService } from '../../services/socket.service';
import { useDocumentsStore } from '../../stores/documents.store';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

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
  
  // T167: Validation state for blocking generation
  const [hasCriticalErrors, setHasCriticalErrors] = useState(false);
  const [validationSummary, setValidationSummary] = useState<any>(null);
  
  // T097, T098: Generation modal state
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  
  // T095: Connect to documents store for generation events
  const {
    onGenerationStarted,
    onGenerationProgress,
    onSectionGenerated,
    onGenerationComplete,
    onGenerationError,
    fetchValidacoes,
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

    // T165: Listen for validation complete
    socketService.on('validacao_completa', (data: any) => {
      console.log('[ChatWindow] Validation complete:', data);
      setValidationSummary(data.resumo);
      
      // T167: Check for critical errors that block generation
      const hasCritical = data.resumo?.erros_criticos?.length > 0;
      setHasCriticalErrors(hasCritical);
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

  // T097, T168: Handle "Gerar ETP" button click with warning for non-critical alerts
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  
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

    // T167: Block generation if critical errors exist
    if (hasCriticalErrors) {
      const errors = validationSummary?.erros_criticos || [];
      alert(
        `Não é possível gerar o ETP devido a erros críticos:\n\n${errors.join('\n')}\n\nPor favor, corrija estes problemas antes de gerar o documento.`
      );
      return;
    }

    // T168: Show warning if there are non-critical alerts
    const hasAlerts = validationSummary?.alertas && validationSummary.alertas.length > 0;
    if (hasAlerts && !showWarningDialog) {
      setShowWarningDialog(true);
      return;
    }

    // Proceed with generation
    proceedWithGeneration();
  };

  const proceedWithGeneration = () => {
    setShowWarningDialog(false);
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

      {/* T056, T097, T167: Confirmar Dados button (appears at 100%, disabled if critical errors) */}
      {progress === 100 && (
        <div className={`px-4 py-2 border-t ${hasCriticalErrors ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          {hasCriticalErrors && validationSummary?.erros_criticos && (
            <div className="mb-2 text-xs text-red-700">
              <p className="font-semibold">⚠️ Erros Críticos Detectados:</p>
              <ul className="list-disc list-inside mt-1">
                {validationSummary.erros_criticos.slice(0, 2).map((erro: string, idx: number) => (
                  <li key={idx}>{erro}</li>
                ))}
                {validationSummary.erros_criticos.length > 2 && (
                  <li>...e mais {validationSummary.erros_criticos.length - 2} erro(s)</li>
                )}
              </ul>
              <p className="mt-1">Verifique o painel de validação à direita.</p>
            </div>
          )}
          <button
            onClick={handleGerarETP}
            disabled={hasCriticalErrors}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              hasCriticalErrors
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {hasCriticalErrors ? '✗ Corrija os erros para gerar' : '✓ Gerar ETP'}
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

      {/* T168: Warning dialog for non-critical alerts */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              ⚠️ Alertas de Validação Detectados
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>
                O documento possui alguns alertas de validação que não impedem a geração,
                mas podem indicar possíveis problemas de conformidade legal:
              </p>
              {validationSummary?.alertas && validationSummary.alertas.length > 0 && (
                <ul className="list-disc list-inside text-sm space-y-1 text-neutral-700">
                  {validationSummary.alertas.slice(0, 3).map((alerta: string, idx: number) => (
                    <li key={idx}>{alerta}</li>
                  ))}
                  {validationSummary.alertas.length > 3 && (
                    <li className="font-medium">
                      ...e mais {validationSummary.alertas.length - 3} alerta(s)
                    </li>
                  )}
                </ul>
              )}
              <p className="text-sm font-medium">
                Deseja prosseguir com a geração mesmo assim?
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarningDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={proceedWithGeneration}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Sim, Gerar Mesmo Assim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
