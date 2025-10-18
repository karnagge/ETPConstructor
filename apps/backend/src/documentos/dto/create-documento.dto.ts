import { z } from 'zod';

/**
 * T045: Zod validation schema for creating documento
 */
export const CreateDocumentoSchema = z.object({
  titulo: z.string().min(5, 'Título deve ter no mínimo 5 caracteres').max(200, 'Título deve ter no máximo 200 caracteres'),
  tipo: z.string().default('ETP'),
  usuarioId: z.string().uuid('usuarioId deve ser um UUID válido'),
  projetoId: z.string().uuid('projetoId deve ser um UUID válido').optional(),
});

export type CreateDocumentoDto = z.infer<typeof CreateDocumentoSchema>;

/**
 * Zod validation schema for updating documento
 */
export const UpdateDocumentoSchema = z.object({
  titulo: z.string().min(5).max(200).optional(),
  dadosColetados: z.record(z.any()).optional(),
  conteudoSecoes: z.record(z.any()).optional(),
  status: z.enum(['RASCUNHO', 'EM_GERACAO', 'CONCLUIDO', 'ARQUIVADO']).optional(),
  projetoId: z.string().uuid().nullable().optional(),
});

export type UpdateDocumentoDto = z.infer<typeof UpdateDocumentoSchema>;
