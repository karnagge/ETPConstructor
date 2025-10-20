import Anthropic from '@anthropic-ai/sdk';

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
 */
export abstract class BaseAgente {
  protected model = 'claude-sonnet-4-20250514';
  protected apiKey: string;
  protected anthropic: Anthropic;
  protected toolHandlers: Map<string, (params: any) => Promise<any>> = new Map();

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
      }

      let response = await this.anthropic.messages.create(requestParams);

      // Handle tool use (function calling) loop
      while (response.stop_reason === 'tool_use') {
        console.log(`[${this.nome}] Tool use detected, processing...`);
        
        // Extract tool use blocks
        const toolUses = response.content.filter((block) => block.type === 'tool_use');
        
        // Execute all requested tools
        const toolResults: Anthropic.MessageParam[] = [];
        
        for (const toolUse of toolUses) {
          if (toolUse.type === 'tool_use') {
            const toolName = toolUse.name;
            const toolInput = toolUse.input;
            
            console.log(`[${this.nome}] Executing tool: ${toolName}`, toolInput);
            
            // Execute tool handler
            const handler = this.toolHandlers.get(toolName);
            if (!handler) {
              throw new Error(`Tool handler not found: ${toolName}`);
            }
            
            try {
              const result = await handler(toolInput);
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
        
        // Continue conversation with tool results
        response = await this.anthropic.messages.create({
          ...requestParams,
          messages,
        });
      }

      // Extract final text content from response
      const textContent = response.content.find((block) => block.type === 'text');
      if (textContent && textContent.type === 'text') {
        return textContent.text;
      }

      throw new Error('No text content in final response');
    } catch (error) {
      console.error(`[${this.nome}] Execution error:`, error);
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
