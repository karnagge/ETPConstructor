import { Injectable } from '@nestjs/common';
import axios from 'axios';

/**
 * HttpToolsService
 * Provides HTTP-based tools for AI agents to fetch real-world data
 * 
 * Tools:
 * - Buscar preços de referência (CATSER, CATMAT, Banco de Preços)
 * - Validar órgãos públicos (SIAFI, Portal da Transparência)
 * - Consultar legislação atualizada
 * - Buscar especificações técnicas similares
 * - Sugerir requisitos baseados em ETPs públicos
 */
@Injectable()
export class HttpToolsService {
  private readonly timeout = 10000; // 10 seconds timeout

  constructor() {
    // Initialize axios client for future production use
    axios.create({
      timeout: this.timeout,
      headers: {
        'User-Agent': 'ETPConstructor/1.0 (AI Agent Tool)',
      },
    });
  }

  /**
   * TOOL 1: Buscar preços de referência do governo
   * Consulta bases públicas como CATSER, CATMAT e Banco de Preços
   * 
   * @param descricaoItem - Descrição do item/serviço a ser pesquisado
   * @returns Array de preços de referência encontrados
   */
  async buscarPrecosReferencia(descricaoItem: string): Promise<{
    sucesso: boolean;
    fonte: string;
    precos: Array<{
      descricao: string;
      valor_unitario: number;
      unidade: string;
      data_referencia: string;
      fonte_url?: string;
    }>;
    erro?: string;
  }> {
    try {
      // Simulação para MVP - Em produção, integrar com APIs reais
      // APIs disponíveis:
      // - Portal da Transparência: https://api.portaldatransparencia.gov.br/
      // - ComprasNet: https://www.comprasnet.gov.br/
      // - Painel de Preços: https://paineldeprecos.planejamento.gov.br/

      console.log('[HttpToolsService] Buscando preços para:', descricaoItem);

      // MOCK DATA para demonstração
      const precosMock = this.gerarPrecosMock(descricaoItem);

      return {
        sucesso: true,
        fonte: 'Painel de Preços - Governo Federal (Mock)',
        precos: precosMock,
      };
    } catch (error) {
      console.error('[HttpToolsService] Erro ao buscar preços:', error);
      return {
        sucesso: false,
        fonte: 'erro',
        precos: [],
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * TOOL 2: Validar órgão público
   * Verifica se órgão existe em bases governamentais (SIAFI)
   * 
   * @param nomeOrgao - Nome ou sigla do órgão
   * @returns Dados do órgão se encontrado
   */
  async validarOrgaoPublico(nomeOrgao: string): Promise<{
    sucesso: boolean;
    orgao_encontrado: boolean;
    dados?: {
      nome_oficial: string;
      sigla: string;
      cnpj?: string;
      esfera: 'federal' | 'estadual' | 'municipal';
      poder: 'executivo' | 'legislativo' | 'judiciario';
    };
    erro?: string;
  }> {
    try {
      console.log('[HttpToolsService] Validando órgão:', nomeOrgao);

      // Em produção, integrar com:
      // - API SIAFI: https://www.siafiweb.fazenda.gov.br/
      // - Portal da Transparência
      // - Receita Federal (CNPJ)

      // MOCK DATA
      const orgaoMock = this.gerarOrgaoMock(nomeOrgao);

      return {
        sucesso: true,
        orgao_encontrado: orgaoMock !== null,
        dados: orgaoMock,
      };
    } catch (error) {
      console.error('[HttpToolsService] Erro ao validar órgão:', error);
      return {
        sucesso: false,
        orgao_encontrado: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * TOOL 3: Consultar legislação atualizada
   * Busca leis, decretos e normas em bases oficiais
   * 
   * @param tema - Tema da pesquisa (ex: "licitação", "contratação TI")
   * @returns Legislação relevante encontrada
   */
  async consultarLegislacao(tema: string): Promise<{
    sucesso: boolean;
    normas: Array<{
      tipo: string;
      numero: string;
      ano: number;
      ementa: string;
      url_oficial?: string;
      relevancia: 'alta' | 'media' | 'baixa';
    }>;
    erro?: string;
  }> {
    try {
      console.log('[HttpToolsService] Consultando legislação sobre:', tema);

      // Em produção, integrar com:
      // - LegisWeb: https://www.legisweb.com.br/
      // - Planalto: http://www4.planalto.gov.br/legislacao/
      // - JusBrasil API

      // MOCK DATA
      const normasMock = this.gerarLegislacaoMock(tema);

      return {
        sucesso: true,
        normas: normasMock,
      };
    } catch (error) {
      console.error('[HttpToolsService] Erro ao consultar legislação:', error);
      return {
        sucesso: false,
        normas: [],
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * TOOL 4: Sugerir requisitos técnicos
   * Busca ETPs similares e extrai requisitos comuns
   * 
   * @param objetoContratacao - Objeto da contratação
   * @returns Sugestões de requisitos técnicos
   */
  async sugerirRequisitosTecnicos(objetoContratacao: string): Promise<{
    sucesso: boolean;
    requisitos_sugeridos: string[];
    fontes: string[];
    erro?: string;
  }> {
    try {
      console.log('[HttpToolsService] Sugerindo requisitos para:', objetoContratacao);

      // Em produção, buscar em:
      // - Portal de Compras Públicas
      // - ETPs públicos em portais de transparência
      // - Base de conhecimento interna

      // MOCK DATA
      const requisitosMock = this.gerarRequisitosMock(objetoContratacao);

      return {
        sucesso: true,
        requisitos_sugeridos: requisitosMock,
        fontes: ['ETPs similares - Portal da Transparência', 'IN 01/2019 SGD/ME'],
      };
    } catch (error) {
      console.error('[HttpToolsService] Erro ao sugerir requisitos:', error);
      return {
        sucesso: false,
        requisitos_sugeridos: [],
        fontes: [],
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * TOOL 5: Sugerir critérios de sustentabilidade
   * Busca critérios aplicáveis ao tipo de contratação
   * 
   * @param objetoContratacao - Objeto da contratação
   * @returns Critérios de sustentabilidade aplicáveis
   */
  async sugerirCriteriosSustentabilidade(objetoContratacao: string): Promise<{
    sucesso: boolean;
    criterios_sugeridos: string[];
    base_legal: string[];
    erro?: string;
  }> {
    try {
      console.log('[HttpToolsService] Sugerindo critérios sustentabilidade para:', objetoContratacao);

      // Em produção, consultar:
      // - Guia de Contratações Sustentáveis (AGU)
      // - Cartilha de Licitações Sustentáveis do TCU

      // MOCK DATA
      const criteriosMock = this.gerarCriteriosSustentabilidadeMock(objetoContratacao);

      return {
        sucesso: true,
        criterios_sugeridos: criteriosMock,
        base_legal: ['IN 01/2010 SLTI/MPOG', 'Lei 12.305/2010 (Política Nacional de Resíduos Sólidos)'],
      };
    } catch (error) {
      console.error('[HttpToolsService] Erro ao sugerir critérios:', error);
      return {
        sucesso: false,
        criterios_sugeridos: [],
        base_legal: [],
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // ==================== MOCK DATA GENERATORS ====================
  // Remover em produção e integrar com APIs reais

  private gerarPrecosMock(descricao: string): Array<any> {
    const descricaoLower = descricao.toLowerCase();
    
    if (descricaoLower.includes('software') || descricaoLower.includes('ti')) {
      return [
        {
          descricao: 'Desenvolvimento de software customizado',
          valor_unitario: 15000.00,
          unidade: 'hora',
          data_referencia: '2025-09-01',
          fonte_url: 'https://paineldeprecos.planejamento.gov.br/',
        },
        {
          descricao: 'Serviços de TI - desenvolvimento',
          valor_unitario: 12500.00,
          unidade: 'hora',
          data_referencia: '2025-08-15',
        },
      ];
    }

    return [
      {
        descricao: 'Item similar encontrado',
        valor_unitario: 1000.00,
        unidade: 'unidade',
        data_referencia: '2025-09-01',
      },
    ];
  }

  private gerarOrgaoMock(nomeOrgao: string): any {
    const orgaoLower = nomeOrgao.toLowerCase();

    if (orgaoLower.includes('minist') || orgaoLower.includes('federal')) {
      return {
        nome_oficial: 'Ministério da Economia',
        sigla: 'ME',
        cnpj: '00.394.460/0001-41',
        esfera: 'federal' as const,
        poder: 'executivo' as const,
      };
    }

    return {
      nome_oficial: nomeOrgao,
      sigla: nomeOrgao.split(' ').map(p => p[0]).join('').toUpperCase(),
      esfera: 'municipal' as const,
      poder: 'executivo' as const,
    };
  }

  private gerarLegislacaoMock(_tema: string): Array<any> {
    return [
      {
        tipo: 'Lei',
        numero: '14.133',
        ano: 2021,
        ementa: 'Lei de Licitações e Contratos Administrativos',
        url_oficial: 'http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/L14133.htm',
        relevancia: 'alta' as const,
      },
      {
        tipo: 'Instrução Normativa',
        numero: '01',
        ano: 2019,
        ementa: 'Processo de Contratação de Soluções de TI',
        url_oficial: 'https://www.gov.br/economia/pt-br/acesso-a-informacao/legislacao/instrucoes-normativas/2019/in-sgd-me-no-01-de-04-04-2019.pdf',
        relevancia: 'alta' as const,
      },
    ];
  }

  private gerarRequisitosMock(objetoContratacao: string): string[] {
    const descricaoLower = objetoContratacao.toLowerCase();

    if (descricaoLower.includes('software') || descricaoLower.includes('ti')) {
      return [
        'Compatibilidade com sistemas operacionais Linux e Windows',
        'Suporte a banco de dados PostgreSQL ou MySQL',
        'Interface responsiva para dispositivos móveis',
        'Protocolo HTTPS com certificado SSL/TLS',
        'Documentação técnica completa em português',
        'Código-fonte documentado seguindo padrões de mercado',
        'Garantia mínima de 12 meses',
        'Treinamento para equipe técnica (mínimo 16 horas)',
      ];
    }

    return [
      'Certificação de qualidade ISO 9001',
      'Equipe técnica qualificada',
      'Prazo de entrega compatível com cronograma',
      'Garantia contratual de no mínimo 12 meses',
    ];
  }

  private gerarCriteriosSustentabilidadeMock(objetoContratacao: string): string[] {
    const descricaoLower = objetoContratacao.toLowerCase();

    if (descricaoLower.includes('software') || descricaoLower.includes('ti')) {
      return [
        'Utilização de servidores com certificação de eficiência energética',
        'Preferência por soluções em nuvem com data centers sustentáveis',
        'Minimizar consumo de recursos computacionais (código otimizado)',
        'Descarte adequado de equipamentos eletrônicos (e-waste)',
      ];
    }

    return [
      'Produtos com certificação ambiental reconhecida',
      'Embalagens recicláveis ou biodegradáveis',
      'Programa de logística reversa',
      'Selo Procel ou similar para equipamentos elétricos',
    ];
  }
}
