import { Injectable } from '@nestjs/common';
import { BaseAgente } from './base-agente';

/**
 * AgenteColetorConversacional
 * Specialized agent for conversational data collection of ETP mandatory fields
 * 
 * Responsibilities:
 * - Conduct natural conversation to collect 11 mandatory fields
 * - Validate each field as collected
 * - Extract structured JSON from conversation
 * - Track progress (0-100%)
 */
@Injectable()
export class AgenteColetorConversacionalService extends BaseAgente {
  get nome(): string {
    return 'Coletor Conversacional';
  }

  get especialidade(): string {
    return 'Coleta de dados para ETP via conversa natural';
  }

  get systemPrompt(): string {
    return `Você é um assistente especializado em coleta de dados para Estudos Técnicos Preliminares (ETP) de licitações públicas no Brasil.

Sua missão é coletar, através de conversa natural, os seguintes 11 campos obrigatórios:

1. **objeto_contratacao**: Descrição breve do que será contratado (ex: "Contratação de serviços de TI")
2. **descricao_detalhada**: Descrição completa e detalhada do objeto
3. **justificativa_necessidade**: Por que a contratação é necessária
4. **orgao_contratante**: Nome do órgão público que está contratando
5. **setor_requisitante**: Setor ou departamento que solicitou
6. **modalidade_licitacao**: Uma das opções: "dispensa", "inexigibilidade", "pregao", "concorrencia"
7. **valor_estimado**: Valor em R$ (número decimal)
8. **prazo_execucao**: Prazo em número inteiro
9. **prazo_unidade**: Unidade de prazo: "dias", "meses" ou "anos"
10. **requisitos_tecnicos**: Lista de requisitos técnicos (array de strings)
11. **criterios_sustentabilidade**: Critérios de sustentabilidade ambiental (array de strings)

**REGRAS DE CONDUTA**:

1. **Uma pergunta por vez**: Faça perguntas curtas e diretas, nunca múltiplas perguntas de uma vez
2. **Linguagem simples**: Use português claro, sem jargões técnicos desnecessários
3. **Contexto legal**: Quando relevante, mencione brevemente a legislação (Lei 8.666/93, Lei 14.133/21)
4. **Validação imediata**: Se a resposta for inválida ou incompleta, peça esclarecimento imediatamente
5. **Progresso transparente**: Informe ao usuário quantos campos faltam coletar
6. **Confirmação final**: Após coletar todos os campos, resuma os dados e peça confirmação

**FORMATO DE RESPOSTA**:

Você deve SEMPRE responder em JSON com a seguinte estrutura:

\`\`\`json
{
  "mensagem": "Sua mensagem amigável para o usuário aqui",
  "campo_coletado": "nome_do_campo_ou_null",
  "valor_coletado": "valor_extraído_ou_null",
  "progresso_estimado": 45,
  "proxima_acao": "continuar_coleta|revisar_campo|confirmar_dados"
}
\`\`\`

**EXEMPLO DE CONVERSA**:

Usuário: "Preciso contratar serviços de desenvolvimento de software"

Você responde:
\`\`\`json
{
  "mensagem": "Entendi! Você quer contratar serviços de desenvolvimento de software. Agora, pode descrever com mais detalhes o que esse sistema deverá fazer?",
  "campo_coletado": "objeto_contratacao",
  "valor_coletado": "Contratação de serviços de desenvolvimento de software",
  "progresso_estimado": 9,
  "proxima_acao": "continuar_coleta"
}
\`\`\`

**IMPORTANTE**: 
- Você NUNCA deve sair do formato JSON
- Se não entender algo, peça esclarecimento dentro do JSON
- Seja sempre cordial e profissional
- Ajude o usuário a fornecer dados completos e precisos`;
  }

  get allowedTools(): string[] {
    return []; // No external tools for MVP
  }

  /**
   * Process user message and extract collected data
   * @param mensagemUsuario - User's message
   * @param dadosAtuais - Currently collected data
   * @returns Agent response with extracted field
   */
  async processarMensagem(
    mensagemUsuario: string,
    dadosAtuais: any,
  ): Promise<{
    mensagem: string;
    campo_coletado: string | null;
    valor_coletado: any;
    progresso_estimado: number;
    proxima_acao: 'continuar_coleta' | 'revisar_campo' | 'confirmar_dados';
  }> {
    const contexto = {
      dados_coletados: dadosAtuais,
      campos_faltantes: this.calcularCamposFaltantes(dadosAtuais),
      total_campos: 11,
    };

    const prompt = `Dados já coletados: ${JSON.stringify(contexto.dados_coletados, null, 2)}

Campos ainda faltantes: ${contexto.campos_faltantes.join(', ')}

Mensagem do usuário: "${mensagemUsuario}"

Com base na mensagem do usuário, extraia dados relevantes e responda no formato JSON especificado.`;

    try {
      const respostaRaw = await this.executar(prompt, contexto);
      const resposta = this.extrairJSON(respostaRaw);

      // Validate response structure
      if (!this.validarResposta(resposta)) {
        throw new Error('Invalid response structure from agent');
      }

      return resposta;
    } catch (error) {
      console.error('[AgenteColetorConversacional] Error:', error);
      
      // Fallback response
      return {
        mensagem: 'Desculpe, tive um problema ao processar sua mensagem. Pode reformular?',
        campo_coletado: null,
        valor_coletado: null,
        progresso_estimado: this.calcularProgresso(dadosAtuais),
        proxima_acao: 'continuar_coleta',
      };
    }
  }

  /**
   * Generate welcome message to start conversation
   */
  gerarMensagemBemVindo(): string {
    return `Olá! 👋 Sou seu assistente para criar um Estudo Técnico Preliminar (ETP).

Vou guiá-lo através de uma conversa simples para coletar todas as informações necessárias. São 11 campos obrigatórios que precisamos preencher juntos.

Para começar, qual é o **objeto da contratação**? (uma breve descrição do que você precisa contratar)

Exemplo: "Contratação de serviços de limpeza e conservação"`;
  }

  /**
   * Calculate missing fields
   */
  private calcularCamposFaltantes(dadosColetados: any): string[] {
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

    return camposObrigatorios.filter((campo) => !dadosColetados[campo]);
  }

  /**
   * Calculate collection progress (0-100%)
   */
  private calcularProgresso(dadosColetados: any): number {
    const camposFaltantes = this.calcularCamposFaltantes(dadosColetados);
    const camposColetados = 11 - camposFaltantes.length;
    return Math.round((camposColetados / 11) * 100);
  }

  /**
   * Validate agent response structure
   */
  protected validarResposta(resposta: any): boolean {
    return (
      resposta &&
      typeof resposta.mensagem === 'string' &&
      typeof resposta.progresso_estimado === 'number' &&
      ['continuar_coleta', 'revisar_campo', 'confirmar_dados'].includes(
        resposta.proxima_acao,
      )
    );
  }
}
