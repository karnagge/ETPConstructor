import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VersaoDocumento } from '@prisma/client';

@Injectable()
export class VersoesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista todas as versões de um documento ordenadas por numeroVersao DESC
   */
  async listarVersoes(documentoUuid: string, limit?: number): Promise<VersaoDocumento[]> {
    // Buscar documento pelo UUID
    const documento = await this.prisma.documento.findUnique({
      where: { uuid: documentoUuid },
    });

    if (!documento) {
      throw new NotFoundException(`Documento ${documentoUuid} não encontrado`);
    }

    // Buscar versões
    return this.prisma.versaoDocumento.findMany({
      where: { documentoId: documento.id },
      orderBy: { numeroVersao: 'desc' },
      take: limit,
    });
  }

  /**
   * Busca uma versão específica pelo número
   */
  async buscarVersao(
    documentoUuid: string,
    numeroVersao: number,
  ): Promise<VersaoDocumento | null> {
    const documento = await this.prisma.documento.findUnique({
      where: { uuid: documentoUuid },
    });

    if (!documento) {
      throw new NotFoundException(`Documento ${documentoUuid} não encontrado`);
    }

    return this.prisma.versaoDocumento.findFirst({
      where: {
        documentoId: documento.id,
        numeroVersao,
      },
    });
  }

  /**
   * Cria uma nova versão do documento
   * Auto-incrementa numeroVersao (MAX + 1)
   */
  async createVersion(
    documentoId: string,
    conteudoSecoes: any,
    alteracoes?: string,
  ): Promise<VersaoDocumento> {
    // Buscar última versão para auto-incrementar
    const ultimaVersao = await this.prisma.versaoDocumento.findFirst({
      where: { documentoId },
      orderBy: { numeroVersao: 'desc' },
      select: { numeroVersao: true },
    });

    const proximoNumero = ultimaVersao ? ultimaVersao.numeroVersao + 1 : 1;

    // Criar nova versão
    return this.prisma.versaoDocumento.create({
      data: {
        documentoId,
        numeroVersao: proximoNumero,
        conteudoSecoes,
        alteracoes,
      },
    });
  }

  /**
   * Restaura uma versão antiga criando nova versão com conteúdo antigo
   * Não sobrescreve, apenas cria uma cópia
   */
  async restaurarVersao(
    documentoUuid: string,
    numeroVersaoOriginal: number,
  ): Promise<VersaoDocumento> {
    // Buscar documento
    const documento = await this.prisma.documento.findUnique({
      where: { uuid: documentoUuid },
    });

    if (!documento) {
      throw new NotFoundException(`Documento ${documentoUuid} não encontrado`);
    }

    // Buscar versão a restaurar
    const versaoAntiga = await this.prisma.versaoDocumento.findFirst({
      where: {
        documentoId: documento.id,
        numeroVersao: numeroVersaoOriginal,
      },
    });

    if (!versaoAntiga) {
      throw new NotFoundException(
        `Versão ${numeroVersaoOriginal} não encontrada para documento ${documentoUuid}`,
      );
    }

    // Criar nova versão com conteúdo antigo
    const novaVersao = await this.createVersion(
      documento.id,
      versaoAntiga.conteudoSecoes,
      `Restauração da versão ${numeroVersaoOriginal}`,
    );

    // Atualizar conteúdo atual do documento
    await this.prisma.documento.update({
      where: { id: documento.id },
      data: {
        conteudoSecoes: versaoAntiga.conteudoSecoes,
        atualizadoEm: new Date(),
      },
    });

    return novaVersao;
  }

  /**
   * Gera diff entre duas versões (simplified)
   * Retorna texto descrevendo alterações
   */
  generateDiff(versaoNova: VersaoDocumento, versaoAntiga: VersaoDocumento): string {
    const secoesNovas = versaoNova.conteudoSecoes as any;
    const secoesAntigas = versaoAntiga.conteudoSecoes as any;

    const alteracoes: string[] = [];

    // Comparar cada seção
    const secoes = new Set([
      ...Object.keys(secoesNovas || {}),
      ...Object.keys(secoesAntigas || {}),
    ]);

    secoes.forEach((secaoId) => {
      const novaSecao = secoesNovas?.[secaoId];
      const antigaSecao = secoesAntigas?.[secaoId];

      if (!antigaSecao && novaSecao) {
        alteracoes.push(`Seção "${secaoId}" adicionada`);
      } else if (antigaSecao && !novaSecao) {
        alteracoes.push(`Seção "${secaoId}" removida`);
      } else if (JSON.stringify(novaSecao) !== JSON.stringify(antigaSecao)) {
        alteracoes.push(`Seção "${secaoId}" modificada`);
      }
    });

    return alteracoes.length > 0
      ? alteracoes.join('; ')
      : 'Nenhuma alteração detectada';
  }
}
