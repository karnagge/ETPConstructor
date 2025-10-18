/**
 * BaseAgente - Abstract base class for all AI agents
 * Wraps Claude Agent SDK with common functionality
 */
export abstract class BaseAgente {
  protected model = 'claude-sonnet-4-20250514';
  protected apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY environment variable is required for AI agents',
      );
    }
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
   * @param contexto - Additional context data
   * @returns Agent response content
   */
  protected async executar(mensagem: string, contexto?: any): Promise<string> {
    // TODO: Implement Claude Agent SDK integration
    // For now, return placeholder
    console.log(`[${this.nome}] Executing with message:`, mensagem);
    console.log(`[${this.nome}] Context:`, contexto);
    
    throw new Error(
      'Claude Agent SDK integration not yet implemented. This will be completed in Phase 3.',
    );
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
