import { z } from 'zod';

// Zod schema for creating a project
export const createProjetoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um código hexadecimal válido (#RRGGBB)').default('#3b82f6'),
  usuarioId: z.string().uuid('ID do usuário deve ser um UUID válido'),
});

export type CreateProjetoDto = z.infer<typeof createProjetoSchema>;

// Zod schema for updating a project
export const updateProjetoSchema = z.object({
  nome: z.string().min(3).max(100).optional(),
  descricao: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type UpdateProjetoDto = z.infer<typeof updateProjetoSchema>;
