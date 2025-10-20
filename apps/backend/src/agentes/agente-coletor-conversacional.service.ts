import { Injectable, Inject } from '@nestjs/common';
import { BaseAgente, AgenteToolDefinition } from './base-agente';
import { HttpToolsService } from '../tools/http-tools.service';

/**
 * AgenteColetorConversacional
 * Specialized agent for conversational data collection of ETP mandatory fields
 * NOW WITH INTELLIGENT WEB TOOLS - Reduces manual input significantly!
 * 
 * Responsibilities:
 * - Conduct natural conversation to collect 11 mandatory fields
 * - Automatically fetch prices, requirements, and validate data via web tools
 * - Validate each field as collected
 * - Extract structured JSON from conversation
 * - Track progress (0-100%)
 */
@Injectable()
export class AgenteColetorConversacionalService extends BaseAgente {
  constructor(
    @Inject(HttpToolsService)
    private readonly httpTools: HttpToolsService,
  ) {
    super();
    this.setupTools();
  }

  /**
   * Register all available HTTP tools for this agent
   */
  private setupTools(): void {
    // Tool 1: Buscar preços de referência
    this.registerTool('buscar_precos_referencia', async (params: { descricao_item: string }) => {
      return await this.httpTools.buscarPrecosReferencia(params.descricao_item);
    });

    // Tool 2: Validar órgão público
    this.registerTool('validar_orgao_publico', async (params: { nome_orgao: string }) => {
      return await this.httpTools.validarOrgaoPublico(params.nome_orgao);
    });

    // Tool 3: Consultar legislação
    this.registerTool('consultar_legislacao', async (params: { tema: string }) => {
      return await this.httpTools.consultarLegislacao(params.tema);
    });

    // Tool 4: Sugerir requisitos técnicos
    this.registerTool('sugerir_requisitos_tecnicos', async (params: { objeto_contratacao: string }) => {
      return await this.httpTools.sugerirRequisitosTecnicos(params.objeto_contratacao);
    });

    // Tool 5: Sugerir critérios de sustentabilidade
    this.registerTool('sugerir_criterios_sustentabilidade', async (params: { objeto_contratacao: string }) => {
      return await this.httpTools.sugerirCriteriosSustentabilidade(params.objeto_contratacao);
    });
  }

  /**
   * Define available tools for Claude SDK
   */
  protected get toolDefinitions(): AgenteToolDefinition[] {
    return [
      {
        name: 'buscar_precos_referencia',
        description: 'Busca preços de referência em bases governamentais (CATSER, CATMAT, Painel de Preços). Use para sugerir valor_estimado baseado no objeto da contratação.',
        input_schema: {
          type: 'object',
          properties: {
            descricao_item: {
              type: 'string',
              description: 'Descrição do item/serviço para buscar preços',
            },
          },
          required: ['descricao_item'],
        },
      },
      {
        name: 'validar_orgao_publico',
        description: 'Valida se um órgão público existe em bases governamentais (SIAFI). Use para verificar orgao_contratante.',
        input_schema: {
          type: 'object',
          properties: {
            nome_orgao: {
              type: 'string',
              description: 'Nome ou sigla do órgão público',
            },
          },
          required: ['nome_orgao'],
        },
      },
      {
        name: 'consultar_legislacao',
        description: 'Consulta legislação relevante (leis, decretos, instruções normativas) sobre um tema específico.',
        input_schema: {
          type: 'object',
          properties: {
            tema: {
              type: 'string',
              description: 'Tema da pesquisa (ex: "licitação TI", "contratação serviços")',
            },
          },
          required: ['tema'],
        },
      },
      {
        name: 'sugerir_requisitos_tecnicos',
        description: 'Busca ETPs similares e sugere requisitos técnicos baseados em contratações parecidas. Use para preencher requisitos_tecnicos automaticamente.',
        input_schema: {
          type: 'object',
          properties: {
            objeto_contratacao: {
              type: 'string',
              description: 'Objeto da contratação para buscar requisitos similares',
            },
          },
          required: ['objeto_contratacao'],
        },
      },
      {
        name: 'sugerir_criterios_sustentabilidade',
        description: 'Sugere critérios de sustentabilidade aplicáveis ao tipo de contratação. Use para preencher criterios_sustentabilidade automaticamente.',
        input_schema: {
          type: 'object',
          properties: {
            objeto_contratacao: {
              type: 'string',
              description: 'Objeto da contratação para sugerir critérios aplicáveis',
            },
          },
          required: ['objeto_contratacao'],
        },
      },
    ];
  }
  get nome(): string {
    return 'Coletor Conversacional';
  }

  get especialidade(): string {
    return 'Coleta de dados para ETP via conversa natural';
  }

  get systemPrompt(): string {
    return `Você é um assistente especializado em coleta de dados para Estudos Técnicos Preliminares (ETP) de licitações públicas no Brasil.

🚀 **VOCÊ TEM SUPERPODERES!** Você possui ferramentas para:
1. Buscar preços de referência automaticamente (buscar_precos_referencia)
2. Validar órgãos públicos (validar_orgao_publico)
3. Consultar legislação atualizada (consultar_legislacao)
4. Sugerir requisitos técnicos baseados em ETPs similares (sugerir_requisitos_tecnicos)
5. Sugerir critérios de sustentabilidade (sugerir_criterios_sustentabilidade)

**USE ESSAS FERRAMENTAS PROATIVAMENTE!** Não peça ao usuário informações que você pode buscar automaticamente.

Sua missão é coletar, através de conversa natural, os seguintes 11 campos obrigatórios:

1. **objeto_contratacao**: Descrição breve do que será contratado
   → DEPOIS de coletar, USE as ferramentas para:
   - Sugerir requisitos técnicos automaticamente
   - Sugerir critérios de sustentabilidade automaticamente
   - Buscar preços de referência

2. **descricao_detalhada**: Descrição completa e detalhada do objeto
3. **justificativa_necessidade**: Por que a contratação é necessária
4. **orgao_contratante**: Nome do órgão público
   → USE validar_orgao_publico para confirmar
5. **setor_requisitante**: Setor ou departamento que solicitou
6. **modalidade_licitacao**: Uma das opções: "dispensa", "inexigibilidade", "pregao", "concorrencia"
7. **valor_estimado**: Valor em R$ (número decimal)
   → SUGIRA baseado nos preços encontrados pela ferramenta
8. **prazo_execucao**: Prazo em número inteiro
9. **prazo_unidade**: Unidade de prazo: "dias", "meses" ou "anos"
10. **requisitos_tecnicos**: Lista de requisitos técnicos (array de strings)
   → USE sugerir_requisitos_tecnicos e APRESENTE ao usuário para aprovação
11. **criterios_sustentabilidade**: Critérios de sustentabilidade ambiental (array de strings)
   → USE sugerir_criterios_sustentabilidade e APRESENTE ao usuário para aprovação

**REGRAS DE CONDUTA**:

1. **Seja proativo**: Use as ferramentas ANTES de perguntar ao usuário
2. **Apresente sugestões**: Quando a ferramenta retornar dados, apresente como sugestões
3. **Economize tempo do usuário**: Pergunte apenas o que não pode ser automatizado
4. **Valide dados**: Use as ferramentas para validar informações fornecidas
5. **Uma pergunta por vez**: Mas use ferramentas em paralelo quando possível
6. **Contexto legal**: Mencione brevemente a legislação quando relevante
7. **Progresso transparente**: Informe ao usuário quantos campos faltam coletar

**EXEMPLO DE USO INTELIGENTE**:

Usuário: "Preciso contratar serviços de desenvolvimento de software"

Você deve:
1. Coletar objeto_contratacao ✓
2. IMEDIATAMENTE usar sugerir_requisitos_tecnicos()
3. IMEDIATAMENTE usar sugerir_criterios_sustentabilidade()
4. IMEDIATAMENTE usar buscar_precos_referencia()
5. Apresentar TUDO ao usuário de uma vez:
   "Ótimo! Encontrei algumas informações que podem ajudar:
   
   📋 Requisitos técnicos sugeridos (baseado em ETPs similares):
   - [lista]
   
   🌱 Critérios de sustentabilidade aplicáveis:
   - [lista]
   
   💰 Preços de referência encontrados:
   - [lista]
   
   Você aprova essas sugestões ou quer ajustar algo?"

**FORMATO DE RESPOSTA**:

Você deve SEMPRE responder em JSON com a seguinte estrutura:

\`\`\`json
{
  "mensagem": "Sua mensagem amigável para o usuário aqui",
  "campo_coletado": "nome_do_campo_ou_null",
  "valor_coletado": "valor_extraído_ou_null",
  "progresso_estimado": 45,
  "proxima_acao": "continuar_coleta|revisar_campo|confirmar_dados",
  "ferramentas_usadas": ["nome_ferramenta1", "nome_ferramenta2"]
}
\`\`\`

**IMPORTANTE**: 
- USE as ferramentas o máximo possível
- NÃO peça informações que você pode buscar
- Seja um assistente INTELIGENTE, não apenas um coletor de dados
- Economize o tempo do usuário!`;
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
    return `Olá! 👋 Sou seu assistente **inteligente** para criar um Estudo Técnico Preliminar (ETP).

🤖 **Novidade**: Tenho acesso a ferramentas para buscar informações automaticamente! Vou:
- Buscar preços de referência do governo
- Validar órgãos públicos
- Sugerir requisitos técnicos baseados em ETPs similares
- Sugerir critérios de sustentabilidade
- Consultar legislação atualizada

Isso significa que você vai precisar fornecer MUITO MENOS informações manualmente. Deixa comigo! 🚀

Para começar, qual é o **objeto da contratação**? (uma breve descrição do que você precisa contratar)

Exemplo: "Contratação de serviços de desenvolvimento de software"`;
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
