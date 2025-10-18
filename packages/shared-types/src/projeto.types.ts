// Shared TypeScript types for Projeto entity

export interface Projeto {
  id: string;
  uuid: string;
  nome: string;
  descricao?: string | null;
  cor: string;
  criadoEm: Date;
  usuarioId: string;
}

export interface CreateProjetoDTO {
  nome: string;
  descricao?: string;
  cor?: string;
  usuarioId: string;
}

export interface UpdateProjetoDTO {
  nome?: string;
  descricao?: string;
  cor?: string;
}
