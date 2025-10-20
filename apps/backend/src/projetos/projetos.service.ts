import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjetoDto, UpdateProjetoDto } from './dto/create-projeto.dto';

@Injectable()
export class ProjetosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new project
   */
  async create(createProjetoDto: CreateProjetoDto) {
    return this.prisma.projeto.create({
      data: {
        nome: createProjetoDto.nome,
        descricao: createProjetoDto.descricao,
        cor: createProjetoDto.cor || '#3b82f6',
        usuarioId: createProjetoDto.usuarioId,
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nome: true,
          },
        },
      },
    });
  }

  /**
   * Find all projects for a specific user
   */
  async findAll(usuarioId?: string) {
    return this.prisma.projeto.findMany({
      where: usuarioId ? { usuarioId } : undefined,
      include: {
        documentos: {
          select: {
            id: true,
            uuid: true,
            titulo: true,
            status: true,
            criadoEm: true,
            atualizadoEm: true,
          },
          orderBy: {
            atualizadoEm: 'desc',
          },
        },
        usuario: {
          select: {
            id: true,
            email: true,
            nome: true,
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });
  }

  /**
   * Find a single project by UUID with its documents
   */
  async findOne(uuid: string) {
    const projeto = await this.prisma.projeto.findUnique({
      where: { uuid },
      include: {
        documentos: {
          select: {
            id: true,
            uuid: true,
            titulo: true,
            tipo: true,
            status: true,
            criadoEm: true,
            atualizadoEm: true,
            concluidoEm: true,
          },
          orderBy: {
            atualizadoEm: 'desc',
          },
        },
        usuario: {
          select: {
            id: true,
            email: true,
            nome: true,
          },
        },
      },
    });

    if (!projeto) {
      throw new NotFoundException(`Projeto com UUID ${uuid} não encontrado`);
    }

    return projeto;
  }

  /**
   * Update a project
   */
  async update(uuid: string, updateProjetoDto: UpdateProjetoDto) {
    // Verify project exists
    await this.findOne(uuid);

    return this.prisma.projeto.update({
      where: { uuid },
      data: {
        nome: updateProjetoDto.nome,
        descricao: updateProjetoDto.descricao,
        cor: updateProjetoDto.cor,
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nome: true,
          },
        },
      },
    });
  }

  /**
   * Delete a project (hard delete, documents will have projetoId set to NULL)
   */
  async remove(uuid: string) {
    // Verify project exists
    await this.findOne(uuid);

    return this.prisma.projeto.delete({
      where: { uuid },
    });
  }
}
