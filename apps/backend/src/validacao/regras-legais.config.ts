/**
 * Legal validation rules for ETP data
 * Each rule is a pure function that validates specific legal requirement
 */

export interface RegraValidacao {
  id: string;
  nome: string;
  descricao: string;
  fundamentacao_legal: string;
  criticidade: 'critica' | 'alerta' | 'informacao';
  validar: (dados: any) => { valido: boolean; observacoes?: string };
}

/**
 * Legal validation rules based on Brazilian procurement laws
 * Lei 8.666/93, Lei 14.133/21, IN SEGES 05/2017, IN SEGES 65/2021
 */
export const REGRAS_LEGAIS: RegraValidacao[] = [
  // ============== REGRAS CRÍTICAS (Bloqueiam geração) ==============
  
  {
    id: 'VALOR_MODALIDADE',
    nome: 'Valor compatível com modalidade de licitação',
    descricao: 'Verifica se o valor estimado é compatível com a modalidade escolhida',
    fundamentacao_legal: 'Lei 14.133/21, Art. 75',
    criticidade: 'critica',
    validar: (dados) => {
      const valor = dados.valor_estimado;
      const modalidade = dados.modalidade_licitacao;

      if (!valor || !modalidade) {
        return { valido: false, observacoes: 'Valor ou modalidade não informados' };
      }

      const limites: any = {
        dispensa: 50000, // R$ 50.000 para serviços/compras
        inexigibilidade: Infinity, // Sem limite (baseado em exclusividade)
        pregao: 0, // Qualquer valor
        concorrencia: 0, // Qualquer valor
      };

      const limiteModalidade = limites[modalidade.toLowerCase()] ?? 0;

      if (modalidade.toLowerCase() === 'dispensa' && valor > limiteModalidade) {
        return {
          valido: false,
          observacoes: `Valor R$ ${valor.toLocaleString('pt-BR')} excede limite de dispensa (R$ ${limiteModalidade.toLocaleString('pt-BR')})`,
        };
      }

      return { valido: true };
    },
  },

  {
    id: 'PRAZO_MINIMO',
    nome: 'Prazo de execução mínimo',
    descricao: 'Verifica se prazo de execução é adequado ao tipo de contratação',
    fundamentacao_legal: 'Lei 14.133/21, Art. 6º, XXIII',
    criticidade: 'critica',
    validar: (dados) => {
      const prazo = dados.prazo_execucao;
      const unidade = dados.prazo_unidade;
      const objeto = dados.objeto_contratacao?.toLowerCase() || '';

      if (!prazo || !unidade) {
        return { valido: false, observacoes: 'Prazo não informado' };
      }

      // Convert to months for comparison
      let prazoMeses = prazo;
      if (unidade === 'dias') prazoMeses = prazo / 30;
      if (unidade === 'anos') prazoMeses = prazo * 12;

      const prazoMinimo = objeto.includes('obra') ? 12 : objeto.includes('complexo') ? 6 : 3;

      if (prazoMeses < prazoMinimo) {
        return {
          valido: false,
          observacoes: `Prazo de ${prazo} ${unidade} é insuficiente. Mínimo recomendado: ${prazoMinimo} meses`,
        };
      }

      return { valido: true };
    },
  },

  {
    id: 'CAMPOS_OBRIGATORIOS',
    nome: 'Todos os campos obrigatórios preenchidos',
    descricao: 'Verifica se os 11 campos obrigatórios foram coletados',
    fundamentacao_legal: 'IN SEGES nº 05/2017',
    criticidade: 'critica',
    validar: (dados) => {
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
      ];

      const camposFaltantes = camposObrigatorios.filter(
        (campo) => !dados[campo] || dados[campo] === '',
      );

      if (camposFaltantes.length > 0) {
        return {
          valido: false,
          observacoes: `Campos faltantes: ${camposFaltantes.join(', ')}`,
        };
      }

      return { valido: true };
    },
  },

  // ============== ALERTAS (Não bloqueiam geração) ==============

  {
    id: 'SUSTENTABILIDADE_OBRIGATORIA',
    nome: 'Critérios de sustentabilidade para contratos acima de R$ 200.000',
    descricao: 'Contratos superiores a R$ 200.000 devem incluir critérios socioambientais',
    fundamentacao_legal: 'Decreto 10.024/2019, Art. 4º',
    criticidade: 'alerta',
    validar: (dados) => {
      const valor = dados.valor_estimado;
      const criterios = dados.criterios_sustentabilidade || [];

      if (valor > 200000 && criterios.length < 2) {
        return {
          valido: false,
          observacoes: 'Recomenda-se incluir pelo menos 2 critérios de sustentabilidade',
        };
      }

      return { valido: true };
    },
  },

  {
    id: 'JUSTIFICATIVA_DETALHADA',
    nome: 'Justificativa detalhada e fundamentada',
    descricao: 'Justificativa deve ter no mínimo 100 caracteres',
    fundamentacao_legal: 'Lei 14.133/21, Art. 11',
    criticidade: 'alerta',
    validar: (dados) => {
      const justificativa = dados.justificativa_necessidade || '';

      if (justificativa.length < 100) {
        return {
          valido: false,
          observacoes: 'Justificativa muito curta. Recomenda-se detalhar a necessidade',
        };
      }

      return { valido: true };
    },
  },

  {
    id: 'DESCRICAO_OBJETO_CLARA',
    nome: 'Descrição do objeto clara e objetiva',
    descricao: 'Objeto deve ter entre 20 e 500 caracteres',
    fundamentacao_legal: 'Lei 14.133/21, Art. 40, I',
    criticidade: 'alerta',
    validar: (dados) => {
      const objeto = dados.objeto_contratacao || '';

      if (objeto.length < 20) {
        return {
          valido: false,
          observacoes: 'Objeto muito curto. Seja mais específico',
        };
      }

      if (objeto.length > 500) {
        return {
          valido: false,
          observacoes: 'Objeto muito longo. Seja mais conciso',
        };
      }

      return { valido: true };
    },
  },

  {
    id: 'VALOR_ESTIMADO_FUNDAMENTADO',
    nome: 'Valor estimado fundamentado',
    descricao: 'Valor estimado deve ser maior que R$ 1.000',
    fundamentacao_legal: 'IN SEGES nº 65/2021',
    criticidade: 'alerta',
    validar: (dados) => {
      const valor = dados.valor_estimado;

      if (valor < 1000) {
        return {
          valido: false,
          observacoes: 'Valor muito baixo. Verifique se a estimativa está correta',
        };
      }

      return { valido: true };
    },
  },

  {
    id: 'REQUISITOS_TECNICOS_ESPECIFICADOS',
    nome: 'Requisitos técnicos especificados',
    descricao: 'Deve haver pelo menos 3 requisitos técnicos informados',
    fundamentacao_legal: 'Lei 14.133/21, Art. 40',
    criticidade: 'alerta',
    validar: (dados) => {
      const requisitos = dados.requisitos_tecnicos || [];

      if (requisitos.length < 3) {
        return {
          valido: false,
          observacoes: 'Poucos requisitos técnicos. Detalhe as especificações necessárias',
        };
      }

      return { valido: true };
    },
  },

  // ============== INFORMAÇÕES (Apenas informativo) ==============

  {
    id: 'MODALIDADE_RECOMENDADA_PREGAO',
    nome: 'Pregão é modalidade recomendada para TI',
    descricao: 'Para serviços de TI, pregão eletrônico é geralmente mais eficiente',
    fundamentacao_legal: 'Decreto 10.024/2019',
    criticidade: 'informacao',
    validar: (dados) => {
      const objeto = dados.objeto_contratacao?.toLowerCase() || '';
      const modalidade = dados.modalidade_licitacao?.toLowerCase() || '';
      const ehTI = objeto.includes('software') || objeto.includes('sistema') || objeto.includes('ti');

      if (ehTI && modalidade !== 'pregao') {
        return {
          valido: false,
          observacoes: 'Para serviços de TI, pregão eletrônico costuma ser mais eficiente',
        };
      }

      return { valido: true };
    },
  },

  {
    id: 'PRAZO_ADEQUADO_COMPLEXIDADE',
    nome: 'Prazo adequado à complexidade',
    descricao: 'Verifica se prazo é compatível com complexidade estimada',
    fundamentacao_legal: 'Boas práticas de gestão de contratos',
    criticidade: 'informacao',
    validar: (dados) => {
      const valor = dados.valor_estimado;
      const prazo = dados.prazo_execucao;
      const unidade = dados.prazo_unidade;

      // High value + short deadline = warning
      let prazoMeses = prazo;
      if (unidade === 'dias') prazoMeses = prazo / 30;
      if (unidade === 'anos') prazoMeses = prazo * 12;

      if (valor > 500000 && prazoMeses < 12) {
        return {
          valido: false,
          observacoes: 'Contratação de alto valor com prazo curto. Verifique se é viável',
        };
      }

      return { valido: true };
    },
  },
];

/**
 * Get critical rules (block generation if fail)
 */
export function getCriticalRules(): RegraValidacao[] {
  return REGRAS_LEGAIS.filter((r) => r.criticidade === 'critica');
}

/**
 * Get warning rules (don't block generation)
 */
export function getWarningRules(): RegraValidacao[] {
  return REGRAS_LEGAIS.filter((r) => r.criticidade === 'alerta');
}

/**
 * Get info rules (informational only)
 */
export function getInfoRules(): RegraValidacao[] {
  return REGRAS_LEGAIS.filter((r) => r.criticidade === 'informacao');
}
