/**
 * Types for agent activity logging
 * Provides real-time visibility into agent internal operations
 */

/**
 * Types of log events emitted by agents
 */
export type LogEventType =
  | 'agent_start'           // Agent started execution
  | 'agent_end'             // Agent finished execution
  | 'tool_call_start'       // Tool is being called
  | 'tool_call_end'         // Tool execution completed
  | 'tool_call_error'       // Tool execution failed
  | 'thinking'              // Agent is processing/thinking
  | 'response_generated'    // Agent generated response text
  | 'error';                // Generic error

/**
 * Tool call details
 */
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

/**
 * Agent log event
 * Emitted in real-time to provide visibility into agent operations
 */
export interface AgenteLogEvent {
  id: string;                   // Unique log event ID
  timestamp: string;            // ISO 8601 timestamp
  event_type: LogEventType;
  agent_name: string;           // Which agent emitted this log
  message: string;              // Human-readable log message
  
  // Optional context data
  data?: {
    tool_call?: ToolCallLog;
    response_text?: string;
    error?: string;
    metadata?: Record<string, any>;
  };
}

/**
 * Log session for a conversation
 */
export interface LogSession {
  documento_id: string;
  started_at: string;
  logs: AgenteLogEvent[];
}
