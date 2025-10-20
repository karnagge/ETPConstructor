import { Injectable } from '@nestjs/common';
import { AgenteValidadorLegalService } from './agente-validador-legal.service';
import { AgenteEspecificacoesTecnicasService } from './agente-especificacoes-tecnicas.service';
import { AgenteEstimativaCustosService } from './agente-estimativa-custos.service';
import { AgenteGestaoContratualService } from './agente-gestao-contratual.service';

/**
 * OrquestradorMultiAgenteService - Coordinates multiple AI agents
 * Executes agents in parallel with graceful error handling
 */
@Injectable()
export class OrquestradorMultiAgenteService {
  constructor(
    private readonly validadorLegal: AgenteValidadorLegalService,
    private readonly especificacoes: AgenteEspecificacoesTecnicasService,
    private readonly custos: AgenteEstimativaCustosService,
    private readonly gestaoContratual: AgenteGestaoContratualService,
  ) {}

  /**
   * Generate all ETP sections using specialized agents
   * Executes in phases with progress tracking
   * @param dadosColetados - Collected ETP data
   * @param onProgress - Callback for progress updates (phase, percentage)
   * @returns Complete document sections
   */
  async gerarSecoes(
    dadosColetados: any,
    onProgress?: (phase: string, percentage: number) => void,
  ): Promise<any> {
    const resultado: any = {
      secoes: {},
      validacao: null,
      erros: [],
      tempo_geracao: 0,
    };

    const startTime = Date.now();

    try {
      // Phase 1: Legal Validation (10% - BLOCKING)
      onProgress?.('Validação Legal', 10);
      console.log('[Orquestrador] Phase 1: Legal Validation');
      
      resultado.validacao = await this.validadorLegal.validarDados(dadosColetados);
      
      if (resultado.validacao.bloqueio_geracao) {
        throw new Error(
          `Erros críticos detectados: ${resultado.validacao.erros_criticos.join(', ')}`,
        );
      }

      // Phase 2: Generate simple sections (1, 2) - 30%
      onProgress?.('Gerando Seções Iniciais', 30);
      console.log('[Orquestrador] Phase 2: Initial Sections');
      
      resultado.secoes['1_definicao_objeto'] = this.gerarSecao1(dadosColetados);
      resultado.secoes['2_justificativa'] = this.gerarSecao2(dadosColetados);

      // Phase 3: Parallel execution of specialized agents (60%)
      onProgress?.('Gerando Especificações Técnicas e Custos', 60);
      console.log('[Orquestrador] Phase 3: Parallel Agent Execution');
      
      const [secao3, secao4, secoes5a9] = await Promise.allSettled([
        this.especificacoes.gerarSecao(dadosColetados),
        this.custos.gerarSecao(dadosColetados),
        this.gestaoContratual.gerarSecoes(dadosColetados),
      ]);

      // Handle parallel results with graceful degradation
      if (secao3.status === 'fulfilled') {
        resultado.secoes['3_especificacoes'] = secao3.value;
      } else {
        resultado.erros.push(`Seção 3: ${secao3.reason}`);
        resultado.secoes['3_especificacoes'] = this.gerarSecaoFallback(3);
      }

      if (secao4.status === 'fulfilled') {
        resultado.secoes['4_estimativa_custos'] = secao4.value;
      } else {
        resultado.erros.push(`Seção 4: ${secao4.reason}`);
        resultado.secoes['4_estimativa_custos'] = this.gerarSecaoFallback(4);
      }

      if (secoes5a9.status === 'fulfilled') {
        // Unpack sections 5-9 from gestao contratual
        const gestaoSecoes = secoes5a9.value.secoes;
        gestaoSecoes.forEach((secao: any) => {
          resultado.secoes[secao.id] = {
            titulo: secao.titulo,
            conteudo: secao.conteudo,
          };
        });
      } else {
        resultado.erros.push(`Seções 5-9: ${secoes5a9.reason}`);
        [5, 6, 7, 8, 9].forEach((n) => {
          resultado.secoes[`${n}_${this.getSecaoName(n)}`] = this.gerarSecaoFallback(n);
        });
      }

      // Phase 4: Final validation (80%)
      onProgress?.('Validação Final', 80);
      console.log('[Orquestrador] Phase 4: Final Validation');
      
      // Validate critical sections were generated
      const requiredSections = [
        '1_definicao_objeto',
        '2_justificativa',
        '3_especificacoes',
        '4_estimativa_custos',
        '5_gestao_fiscalizacao',
        '6_obrigacoes_contratante',
        '7_obrigacoes_contratada',
        '8_criterios_aceitacao',
        '9_sancoes',
      ];

      const missingSections = requiredSections.filter(
        (id) => !resultado.secoes[id],
      );

      if (missingSections.length > 0) {
        throw new Error(
          `Seções obrigatórias faltando: ${missingSections.join(', ')}`,
        );
      }

      // Phase 5: Complete (100%)
      onProgress?.('Geração Concluída', 100);
      
      resultado.tempo_geracao = Math.round((Date.now() - startTime) / 1000);
      console.log(`[Orquestrador] Generation complete in ${resultado.tempo_geracao}s`);

      return resultado;
    } catch (error) {
      console.error('[Orquestrador] Generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate Section 1: Object Definition
   */
  private gerarSecao1(dadosColetados: any): any {
    return {
      titulo: '1. DEFINIÇÃO DO OBJETO',
      conteudo: {
        descricao: dadosColetados.objeto_contratacao,
        descricao_detalhada: dadosColetados.descricao_detalhada,
        classificacao: this.classificarObjeto(dadosColetados),
        modalidade_sugerida: dadosColetados.modalidade_licitacao || 'A definir',
      },
    };
  }

  /**
   * Generate Section 2: Justification
   */
  private gerarSecao2(dadosColetados: any): any {
    return {
      titulo: '2. JUSTIFICATIVA DA CONTRATAÇÃO',
      conteudo: {
        necessidade: dadosColetados.justificativa_necessidade,
        orgao_demandante: dadosColetados.orgao_contratante,
        setor_requisitante: dadosColetados.setor_requisitante,
        beneficios_esperados: this.extrairBeneficios(dadosColetados),
        alinhamento_estrategico:
          'Contratação alinha-se aos objetivos estratégicos do órgão',
      },
    };
  }

  /**
   * Classify object type based on description
   */
  private classificarObjeto(dadosColetados: any): string {
    const objeto = dadosColetados.objeto_contratacao?.toLowerCase() || '';
    
    if (objeto.includes('software') || objeto.includes('sistema') || objeto.includes('ti')) {
      return 'Serviços de Tecnologia da Informação';
    }
    if (objeto.includes('obra') || objeto.includes('construção')) {
      return 'Obras e Serviços de Engenharia';
    }
    if (objeto.includes('equipamento') || objeto.includes('fornecimento')) {
      return 'Aquisição de Bens';
    }
    return 'Serviços Gerais';
  }

  /**
   * Extract benefits from data
   */
  private extrairBeneficios(dadosColetados: any): string[] {
    const beneficios = [
      'Atendimento à necessidade institucional identificada',
      'Modernização e eficiência dos processos',
    ];

    if (dadosColetados.criterios_sustentabilidade?.length > 0) {
      beneficios.push('Promoção de práticas sustentáveis');
    }

    return beneficios;
  }

  /**
   * Generate fallback section content when agent fails
   */
  private gerarSecaoFallback(numeroSecao: number): any {
    return {
      titulo: `${numeroSecao}. ${this.getSecaoTitulo(numeroSecao)}`,
      conteudo: {
        observacao:
          'Esta seção requer elaboração manual. A geração automatizada falhou.',
        status: 'PENDENTE_REVISAO',
      },
    };
  }

  /**
   * Get section name by number
   */
  private getSecaoName(numero: number): string {
    const names: { [key: number]: string } = {
      1: 'definicao_objeto',
      2: 'justificativa',
      3: 'especificacoes',
      4: 'estimativa_custos',
      5: 'gestao_fiscalizacao',
      6: 'obrigacoes_contratante',
      7: 'obrigacoes_contratada',
      8: 'criterios_aceitacao',
      9: 'sancoes',
    };
    return names[numero] || 'secao_desconhecida';
  }

  /**
   * Get section title by number
   */
  private getSecaoTitulo(numero: number): string {
    const titulos: { [key: number]: string } = {
      1: 'DEFINIÇÃO DO OBJETO',
      2: 'JUSTIFICATIVA DA CONTRATAÇÃO',
      3: 'ESPECIFICAÇÕES TÉCNICAS',
      4: 'ESTIMATIVA DE CUSTOS E PREÇOS',
      5: 'GESTÃO E FISCALIZAÇÃO DO CONTRATO',
      6: 'OBRIGAÇÕES DO CONTRATANTE',
      7: 'OBRIGAÇÕES DA CONTRATADA',
      8: 'CRITÉRIOS DE ACEITAÇÃO DO OBJETO',
      9: 'SANÇÕES ADMINISTRATIVAS',
    };
    return titulos[numero] || 'Seção Desconhecida';
  }
}
