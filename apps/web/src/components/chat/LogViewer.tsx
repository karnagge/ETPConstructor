import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Terminal, Zap, CheckCircle2, XCircle, Clock, Brain } from 'lucide-react';

/**
 * Agent Log Event Types (mirrored from backend)
 */
export type LogEventType =
  | 'agent_start'
  | 'agent_end'
  | 'tool_call_start'
  | 'tool_call_end'
  | 'tool_call_error'
  | 'thinking'
  | 'response_generated'
  | 'error';

export interface ToolCallLog {
  tool_name: string;
  input_parameters: Record<string, any>;
  started_at: string;
  ended_at?: string;
  duration_ms?: number;
  result?: any;
  error?: string;
  success: boolean;
}

export interface AgenteLogEvent {
  id: string;
  timestamp: string;
  event_type: LogEventType;
  agent_name: string;
  message: string;
  data?: {
    tool_call?: ToolCallLog;
    response_text?: string;
    error?: string;
    metadata?: Record<string, any>;
  };
}

interface LogViewerProps {
  logs: AgenteLogEvent[];
  isVisible: boolean;
}

/**
 * LogViewer Component
 * Displays real-time agent activity logs with syntax highlighting
 */
export function LogViewer({ logs, isVisible }: LogViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current && isVisible) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isVisible]);

  const toggleLogExpanded = (logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getEventIcon = (eventType: LogEventType) => {
    switch (eventType) {
      case 'agent_start':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'agent_end':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'tool_call_start':
        return <Terminal className="h-4 w-4 text-purple-500" />;
      case 'tool_call_end':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'tool_call_error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'thinking':
        return <Brain className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'response_generated':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Terminal className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventBadgeVariant = (eventType: LogEventType): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (eventType) {
      case 'agent_start':
      case 'tool_call_start':
        return 'default';
      case 'agent_end':
      case 'tool_call_end':
      case 'response_generated':
        return 'secondary';
      case 'tool_call_error':
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  if (!isVisible) return null;

  return (
    <div className="h-full border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <Terminal className="h-5 w-5" />
          Logs dos Agentes
          {logs.length > 0 && (
            <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {logs.length}
            </span>
          )}
        </h3>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-12rem)]" ref={scrollRef}>
        <div className="p-4 space-y-2">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Terminal className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Aguardando atividade dos agentes...</p>
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedLogs.has(log.id);
              const hasDetails =
                log.data?.tool_call || log.data?.response_text || log.data?.metadata;

              return (
                <div
                  key={log.id}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <button
                    onClick={() => toggleLogExpanded(log.id)}
                    className="w-full"
                    disabled={!hasDetails}
                  >
                    <div className="flex items-start gap-3 text-left">
                      <div className="mt-0.5">{getEventIcon(log.event_type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              getEventBadgeVariant(log.event_type) === 'destructive'
                                ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                                : getEventBadgeVariant(log.event_type) === 'secondary'
                                ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            }`}
                          >
                            {log.event_type}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            {formatTimestamp(log.timestamp)}
                          </span>
                          <span className="text-xs text-gray-500">{log.agent_name}</span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                      </div>
                      {hasDetails && (
                        <div className="mt-0.5">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </button>

                  {hasDetails && isExpanded && (
                    <div className="mt-3 space-y-2">
                      {/* Tool Call Details */}
                      {log.data?.tool_call && (
                        <div className="border-l-2 border-purple-500 pl-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Terminal className="h-3 w-3 text-purple-500" />
                            <span className="text-xs font-semibold">
                              {log.data.tool_call.tool_name}
                            </span>
                            {log.data.tool_call.duration_ms && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {log.data.tool_call.duration_ms}ms
                              </span>
                            )}
                          </div>

                          {/* Input Parameters */}
                          <div>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                              Parâmetros:
                            </p>
                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                              {formatJSON(log.data.tool_call.input_parameters)}
                            </pre>
                          </div>

                          {/* Result or Error */}
                          {log.data.tool_call.result && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                Resultado:
                              </p>
                              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto max-h-40">
                                {formatJSON(log.data.tool_call.result)}
                              </pre>
                            </div>
                          )}

                          {log.data.tool_call.error && (
                            <div>
                              <p className="text-xs font-semibold text-red-500 mb-1">Erro:</p>
                              <pre className="text-xs bg-red-50 dark:bg-red-950 p-2 rounded overflow-x-auto">
                                {log.data.tool_call.error}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Response Text */}
                      {log.data?.response_text && (
                        <div className="border-l-2 border-emerald-500 pl-3">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Resposta:
                          </p>
                          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto max-h-40 whitespace-pre-wrap">
                            {log.data.response_text}
                          </pre>
                        </div>
                      )}

                      {/* Metadata */}
                      {log.data?.metadata && (
                        <div className="border-l-2 border-gray-500 pl-3">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Metadados:
                          </p>
                          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                            {formatJSON(log.data.metadata)}
                            </pre>
                        </div>
                      )}

                      {/* Error */}
                      {log.data?.error && (
                        <div className="border-l-2 border-red-500 pl-3">
                          <p className="text-xs font-semibold text-red-500 mb-1">Erro:</p>
                          <pre className="text-xs bg-red-50 dark:bg-red-950 p-2 rounded overflow-x-auto">
                            {log.data.error}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
