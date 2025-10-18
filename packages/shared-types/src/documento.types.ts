// Shared TypeScript types for Documento entity and related structures

export interface DadosColetados {
  objeto_contratacao: string;
  descricao_detalhada: string;
  justificativa_necessidade: string;
  orgao_contratante: string;
  setor_requisitante: string;
  modalidade_licitacao?: 'dispensa' | 'inexigibilidade' | 'pregao' | 'concorrencia';
  valor_estimado: number;
  prazo_execucao: number;
  prazo_unidade: 'dias' | 'meses' | 'anos';
  requisitos_tecnicos?: string[];
  criterios_sustentabilidade?: string[];
}

export interface ConteudoSecao {
  titulo: string;
  conteudo: any; // Specific structure varies per section
}

export interface ConteudoSecoes {
  '1_definicao_objeto'?: ConteudoSecao;
  '2_justificativa'?: ConteudoSecao;
  '3_especificacoes'?: ConteudoSecao;
  '4_estimativa_custos'?: ConteudoSecao;
  '5_gestao_fiscalizacao'?: ConteudoSecao;
  '6_obrigacoes_contratante'?: ConteudoSecao;
  '7_obrigacoes_contratada'?: ConteudoSecao;
  '8_criterios_aceitacao'?: ConteudoSecao;
  '9_sancoes'?: ConteudoSecao;
}

// Re-export Prisma types for client use
export type { Documento, StatusDocumento, VersaoDocumento } from '@prisma/client';
