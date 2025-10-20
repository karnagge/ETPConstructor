import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';

/**
 * Types for agent activity logging
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

/**
 * Tool definition for Claude SDK
 */
export interface AgenteToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

/**
 * BaseAgente - Abstract base class for all AI agents
 * Wraps Anthropic Claude SDK with common functionality
 * Now supports custom HTTP tools for fetching real-world data
 * AND real-time activity logging for UI visibility
 */
export abstract class BaseAgente {
  protected model = 'claude-sonnet-4-20250514';
  protected apiKey: string;
  protected anthropic: Anthropic;
  protected toolHandlers: Map<string, (params: any) => Promise<any>> = new Map();
  
  // Log callback for real-time UI updates
  private logCallback?: (log: AgenteLogEvent) => void;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY environment variable is required for AI agents',
      );
    }
    
    this.anthropic = new Anthropic({
      apiKey: this.apiKey,
    });
  }

  /**
   * Set callback for real-time log events
   * @param callback - Function to receive log events
   */
  setLogCallback(callback: (log: AgenteLogEvent) => void): void {
    this.logCallback = callback;
  }

  /**
   * Emit a log event
   */
  protected emitLog(
    event_type: LogEventType,
    message: string,
    data?: AgenteLogEvent['data'],
  ): void {
    if (!this.logCallback) return;

    const log: AgenteLogEvent = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      event_type,
      agent_name: this.nome,
      message,
      data,
    };

    this.logCallback(log);
  }

  /**
   * System prompt that defines agent's role and behavior
   * Must be implemented by each specialized agent
   */
  abstract get systemPrompt(): string;

  /**
   * Tool definitions for this agent
   * Override in subclasses to provide custom tools
   */
  protected get toolDefinitions(): AgenteToolDefinition[] {
    return [];
  }

  /**
   * Register a tool handler function
   * @param toolName - Name of the tool
   * @param handler - Async function that executes the tool
   */
  protected registerTool(toolName: string, handler: (params: any) => Promise<any>): void {
    this.toolHandlers.set(toolName, handler);
  }

  /**
   * Allowed tools for this agent (kept for backwards compatibility)
   * @deprecated Use toolDefinitions instead
   */
  abstract get allowedTools(): string[];

  /**
   * Agent name for logging and identification
   */
  abstract get nome(): string;

  /**
   * Agent specialization area
   */
  abstract get especialidade(): string;

  /**
   * Execute agent with given message and context
   * Now supports tool use (function calling) via Claude SDK
   * @param mensagem - User message or prompt
   * @param _contexto - Additional context data (unused in base implementation, available for subclasses)
   * @returns Agent response content
   */
  protected async executar(mensagem: string, _contexto?: any): Promise<string> {
    console.log(`[${this.nome}] Executing with message:`, mensagem.substring(0, 100) + '...');
    
    // Log: Agent started
    this.emitLog('agent_start', `${this.nome} iniciou processamento`, {
      metadata: { message_preview: mensagem.substring(0, 200) },
    });
    
    try {
      const messages: Anthropic.MessageParam[] = [
        {
          role: 'user',
          content: mensagem,
        },
      ];

      // Prepare request params
      const requestParams: Anthropic.MessageCreateParams = {
        model: this.model,
        max_tokens: 4096,
        system: this.systemPrompt,
        messages,
        temperature: 0.7,
      };

      // Add tools if defined
      const tools = this.toolDefinitions;
      if (tools.length > 0) {
        requestParams.tools = tools as any;
        this.emitLog('thinking', `${this.nome} tem ${tools.length} ferramentas disponíveis`, {
          metadata: { tools: tools.map(t => t.name) },
        });
      }

      let response = await this.anthropic.messages.create(requestParams);

      // Handle tool use (function calling) loop
      while (response.stop_reason === 'tool_use') {
        console.log(`[${this.nome}] Tool use detected, processing...`);
        
        this.emitLog('thinking', `${this.nome} decidiu usar ferramentas`);
        
        // Extract tool use blocks
        const toolUses = response.content.filter((block) => block.type === 'tool_use');
        
        // Execute all requested tools
        const toolResults: Anthropic.MessageParam[] = [];
        
        for (const toolUse of toolUses) {
          if (toolUse.type === 'tool_use') {
            const toolName = toolUse.name;
            const toolInput = toolUse.input;
            
            console.log(`[${this.nome}] Executing tool: ${toolName}`, toolInput);
            
            const toolCallStartTime = Date.now();
            
            // Log: Tool call started
            this.emitLog('tool_call_start', `Chamando ferramenta: ${toolName}`, {
              tool_call: {
                tool_name: toolName,
                input_parameters: toolInput as Record<string, any>,
                started_at: new Date().toISOString(),
                success: false,
              },
            });
            
            // Execute tool handler
            const handler = this.toolHandlers.get(toolName);
            if (!handler) {
              const errorMsg = `Tool handler not found: ${toolName}`;
              this.emitLog('tool_call_error', errorMsg);
              throw new Error(errorMsg);
            }
            
            try {
              const result = await handler(toolInput);
              const duration = Date.now() - toolCallStartTime;
              
              // Log: Tool call succeeded
              this.emitLog('tool_call_end', `Ferramenta ${toolName} concluída com sucesso (${duration}ms)`, {
                tool_call: {
                  tool_name: toolName,
                  input_parameters: toolInput as Record<string, any>,
                  started_at: new Date(toolCallStartTime).toISOString(),
                  ended_at: new Date().toISOString(),
                  duration_ms: duration,
                  result,
                  success: true,
                },
              });
              
              toolResults.push({
                role: 'user',
                content: [
                  {
                    type: 'tool_result',
                    tool_use_id: toolUse.id,
                    content: JSON.stringify(result),
                  },
                ],
              });
            } catch (error) {
              console.error(`[${this.nome}] Tool execution error:`, error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              const duration = Date.now() - toolCallStartTime;
              
              // Log: Tool call failed
              this.emitLog('tool_call_error', `Ferramenta ${toolName} falhou: ${errorMessage}`, {
                tool_call: {
                  tool_name: toolName,
                  input_parameters: toolInput as Record<string, any>,
                  started_at: new Date(toolCallStartTime).toISOString(),
                  ended_at: new Date().toISOString(),
                  duration_ms: duration,
                  error: errorMessage,
                  success: false,
                },
              });
              
              toolResults.push({
                role: 'user',
                content: [
                  {
                    type: 'tool_result',
                    tool_use_id: toolUse.id,
                    content: JSON.stringify({ error: errorMessage }),
                    is_error: true,
                  },
                ],
              });
            }
          }
        }
        
        // Add assistant's tool use message
        messages.push({
          role: 'assistant',
          content: response.content,
        });
        
        // Add tool results
        messages.push(...toolResults);
        
        this.emitLog('thinking', `${this.nome} processando resultados das ferramentas`);
        
        // Continue conversation with tool results
        response = await this.anthropic.messages.create({
          ...requestParams,
          messages,
        });
      }

      // Extract final text content from response
      const textContent = response.content.find((block) => block.type === 'text');
      if (textContent && textContent.type === 'text') {
        const responseText = textContent.text;
        
        // Log: Response generated
        this.emitLog('response_generated', `${this.nome} gerou resposta`, {
          response_text: responseText.substring(0, 500),
        });
        
        // Log: Agent finished
        this.emitLog('agent_end', `${this.nome} finalizou processamento com sucesso`);
        
        return responseText;
      }

      throw new Error('No text content in final response');
    } catch (error) {
      console.error(`[${this.nome}] Execution error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log: Error
      this.emitLog('error', `${this.nome} encontrou erro: ${errorMessage}`, {
        error: errorMessage,
      });
      
      throw error;
    }
  }

  /**
   * Parse JSON response from agent, handling markdown code blocks
   * @param response - Raw agent response
   * @returns Parsed JSON object
   */
  protected extrairJSON(response: string): any {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response;

    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error(`[${this.nome}] Failed to parse JSON:`, response);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Invalid JSON response from ${this.nome}: ${message}`);
    }
  }

  /**
   * Stream chunk callback for real-time updates
   * Override in subclasses to emit WebSocket events
   */
  protected onStreamChunk(_chunk: any): void {
    // Default: no-op, override in subclasses
  }

  /**
   * Validate agent response structure
   * Override in subclasses for specific validation rules
   */
  protected validarResposta(resposta: any): boolean {
    return resposta !== null && resposta !== undefined;
  }
}
