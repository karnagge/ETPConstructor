import Anthropic from '@anthropic-ai/sdk';

/**
 * BaseAgente - Abstract base class for all AI agents
 * Wraps Anthropic Claude SDK with common functionality
 */
export abstract class BaseAgente {
  protected model = 'claude-sonnet-4-20250514';
  protected apiKey: string;
  protected anthropic: Anthropic;

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
   * Allowed tools for this agent (empty array for MVP)
   * Can be extended in future for external tool access
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
   * @param mensagem - User message or prompt
   * @param contexto - Additional context data (unused in base implementation, available for subclasses)
   * @returns Agent response content
   */
  protected async executar(mensagem: string, _contexto?: any): Promise<string> {
    console.log(`[${this.nome}] Executing with message:`, mensagem.substring(0, 100) + '...');
    
    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: this.systemPrompt,
        messages: [
          {
            role: 'user',
            content: mensagem,
          },
        ],
        temperature: 0.7,
      });

      // Extract text content from response
      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      throw new Error(`Unexpected response type: ${content.type}`);
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
