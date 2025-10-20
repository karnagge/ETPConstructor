import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

/**
 * ChatService
 * Manages WebSocket session state and data collection progress
 * Uses Redis for persistent session storage
 */
@Injectable()
export class ChatService {
  constructor(private readonly redis: RedisService) {}

  /**
   * Initialize new chat session for document
   * @param documentoId - Document UUID
   * @param clientId - Socket client ID
   */
  async inicializarSessao(documentoId: string, clientId: string): Promise<void> {
    const sessionKey = `chat:session:${documentoId}`;
    
    await this.redis.set(
      sessionKey,
      JSON.stringify({
        documentoId,
        clientId,
        iniciado_em: new Date().toISOString(),
        mensagens: [],
      }),
      3600, // Expire after 1 hour of inactivity
    );
  }

  /**
   * Load session data from Redis
   */
  async carregarSessao(documentoId: string): Promise<any> {
    const sessionKey = `chat:session:${documentoId}`;
    const data = await this.redis.get(sessionKey);
    
    if (!data) {
      return null;
    }
    
    return JSON.parse(data);
  }

  /**
   * Add message to session history
   */
  async adicionarMensagem(
    documentoId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<void> {
    const session = await this.carregarSessao(documentoId);
    
    if (!session) {
      throw new Error(`Session not found for document ${documentoId}`);
    }
    
    session.mensagens.push({
      role,
      content,
      timestamp: new Date().toISOString(),
    });
    
    const sessionKey = `chat:session:${documentoId}`;
    await this.redis.set(
      sessionKey,
      JSON.stringify(session),
      3600,
    );
  }

  /**
   * Calculate collection progress (0-100%)
   */
  calcularProgresso(dadosColetados: any): number {
    const camposObrigatorios = [
      'objeto_contratacao',
      'descricao_detalhada',
      'justificativa_necessidade',
      'orgao_contratante',
      'setor_requisitante',
      'modalidade_licitacao',
      'valor_estimado',
      'prazo_execucao',
      'prazo_unidade',
      'requisitos_tecnicos',
      'criterios_sustentabilidade',
    ];

    const camposColetados = camposObrigatorios.filter(
      (campo) => dadosColetados[campo] !== undefined && dadosColetados[campo] !== null,
    ).length;

    return Math.round((camposColetados / 11) * 100);
  }

  /**
   * Get list of missing fields
   */
  getCamposFaltantes(dadosColetados: any): string[] {
    const camposObrigatorios = [
      'objeto_contratacao',
      'descricao_detalhada',
      'justificativa_necessidade',
      'orgao_contratante',
      'setor_requisitante',
      'modalidade_licitacao',
      'valor_estimado',
      'prazo_execucao',
      'prazo_unidade',
      'requisitos_tecnicos',
      'criterios_sustentabilidade',
    ];

    return camposObrigatorios.filter(
      (campo) => !dadosColetados[campo],
    );
  }

  /**
   * Check if data collection is complete (all mandatory fields filled)
   */
  isColetaCompleta(dadosColetados: any): boolean {
    const camposFaltantes = this.getCamposFaltantes(dadosColetados);
    return camposFaltantes.length === 0;
  }

  /**
   * Clear session (logout or document closed)
   */
  async limparSessao(documentoId: string): Promise<void> {
    const sessionKey = `chat:session:${documentoId}`;
    await this.redis.del(sessionKey);
  }
}
