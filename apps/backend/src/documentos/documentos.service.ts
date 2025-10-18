import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentoDto, UpdateDocumentoDto } from './dto/create-documento.dto';

/**
 * T041: DocumentosService
 * Business logic for documento CRUD operations
 */
@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create new documento
   */
  async create(dto: CreateDocumentoDto) {
    return await this.prisma.documento.create({
      data: {
        titulo: dto.titulo,
        tipo: dto.tipo,
        usuarioId: dto.usuarioId,
        projetoId: dto.projetoId,
        status: 'RASCUNHO',
        dadosColetados: {},
        conteudoSecoes: {},
      },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        projeto: { select: { id: true, uuid: true, nome: true, cor: true } },
      },
    });
  }

  /**
   * Find documento by UUID
   */
  async findByUuid(uuid: string) {
    return await this.prisma.documento.findUnique({
      where: { uuid },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        projeto: { select: { id: true, uuid: true, nome: true, cor: true } },
        versoes: {
          select: {
            id: true,
            numeroVersao: true,
            alteracoes: true,
            criadoEm: true,
          },
          orderBy: { numeroVersao: 'desc' },
          take: 5, // Last 5 versions
        },
        validacoes: {
          select: {
            id: true,
            secaoId: true,
            regra: true,
            valido: true,
            observacoes: true,
            criadoEm: true,
          },
          orderBy: { criadoEm: 'desc' },
          take: 20, // Last 20 validations
        },
      },
    });
  }

  /**
   * Find all documentos with filters
   */
  async findAll(filters: {
    usuarioId?: string;
    projetoId?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters.usuarioId) {
      where.usuarioId = filters.usuarioId;
    }

    if (filters.projetoId) {
      where.projetoId = filters.projetoId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return await this.prisma.documento.findMany({
      where,
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        projeto: { select: { id: true, uuid: true, nome: true, cor: true } },
      },
      orderBy: { atualizadoEm: 'desc' },
    });
  }

  /**
   * Update documento
   */
  async update(uuid: string, dto: UpdateDocumentoDto) {
    return await this.prisma.documento.update({
      where: { uuid },
      data: dto,
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        projeto: { select: { id: true, uuid: true, nome: true, cor: true } },
      },
    });
  }

  /**
   * Delete documento (soft delete by archiving)
   */
  async delete(uuid: string) {
    return await this.prisma.documento.update({
      where: { uuid },
      data: { status: 'ARQUIVADO' },
    });
  }

  /**
   * Check if all mandatory fields are collected
   */
  isColetaCompleta(dadosColetados: any): boolean {
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

    return camposObrigatorios.every(
      (campo) =>
        dadosColetados[campo] !== undefined &&
        dadosColetados[campo] !== null &&
        dadosColetados[campo] !== '',
    );
  }
}
