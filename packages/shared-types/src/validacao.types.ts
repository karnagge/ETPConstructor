// Shared TypeScript types for ValidacaoLegal entity

export interface ValidacaoLegal {
  id: string;
  secaoId: string;
  regra: string;
  valido: boolean;
  observacoes?: string | null;
  criadoEm: Date;
  documentoId: string;
}

export interface ResumoValidacao {
  totalRegras: number;
  regrasValidas: number;
  percentualConformidade: number;
  errosCriticos: ValidacaoLegal[];
  alertas: ValidacaoLegal[];
}

export interface RegraLegal {
  id: string;
  descricao: string;
  fundamentacao: string; // Ex: "Lei 14.133/21, Art. 75, §1º"
  critica: boolean; // Se true, bloqueia geração
  validar: (dados: any) => { valido: boolean; observacoes?: string };
}
