import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ValidacaoLegalService } from './validacao-legal.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ValidacoesController - REST API for legal validations
 * Nested under /api/documentos/:uuid/validacoes
 */
@Controller('documentos/:documentoUuid/validacoes')
export class ValidacoesController {
  constructor(
    private readonly validacaoService: ValidacaoLegalService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /api/documentos/:uuid/validacoes
   * List all validations for a document with filters
   * @query secaoId - Filter by section
   * @query valido - Filter by validity (true/false)
   * @query latest - Return only latest validation per rule (true/false)
   */
  @Get()
  async getValidacoes(
    @Param('documentoUuid') documentoUuid: string,
    @Query('secaoId') secaoId?: string,
    @Query('valido') valido?: string,
    @Query('latest') latest?: string,
  ) {
    // Get document by UUID
    const documento = await this.prisma.documento.findUnique({
      where: { uuid: documentoUuid },
    });

    if (!documento) {
      return { error: 'Documento não encontrado', validacoes: [] };
    }

    // Build filter
    const where: any = { documentoId: documento.id };
    if (secaoId) where.secaoId = secaoId;
    if (valido !== undefined) where.valido = valido === 'true';

    // Fetch validations
    let validacoes = await this.prisma.validacaoLegal.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
    });

    // Filter to latest per rule if requested
    if (latest === 'true') {
      const latestMap = new Map<string, any>();
      for (const v of validacoes) {
        const key = `${v.secaoId}_${v.regra}`;
        if (!latestMap.has(key)) {
          latestMap.set(key, v);
        }
      }
      validacoes = Array.from(latestMap.values());
    }

    // Get resumo
    const resumo = await this.validacaoService.getResumo(documento.id);

    return {
      validacoes,
      resumo,
    };
  }

  /**
   * GET /api/documentos/:uuid/validacoes/resumo
   * Get validation summary (compliance percentage, errors, warnings)
   */
  @Get('resumo')
  async getResumo(@Param('documentoUuid') documentoUuid: string) {
    const documento = await this.prisma.documento.findUnique({
      where: { uuid: documentoUuid },
    });

    if (!documento) {
      return { error: 'Documento não encontrado' };
    }

    const resumo = await this.validacaoService.getResumo(documento.id);

    return resumo;
  }

  /**
   * POST /api/documentos/:uuid/validacoes
   * Trigger manual re-validation of document data
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async revalidar(
    @Param('documentoUuid') documentoUuid: string,
    @Body() body: { secaoId?: string },
  ) {
    const documento = await this.prisma.documento.findUnique({
      where: { uuid: documentoUuid },
    });

    if (!documento) {
      return { error: 'Documento não encontrado' };
    }

    // Validate dados coletados
    if (!body.secaoId || body.secaoId === 'dados_coletados') {
      const resultado = await this.validacaoService.validarDados(
        documento.id,
        documento.dadosColetados,
      );
      return {
        message: 'Validação executada com sucesso',
        ...resultado,
      };
    }

    // Validate specific section
    const conteudoSecoes = documento.conteudoSecoes as any;
    const conteudo = conteudoSecoes[body.secaoId];

    if (!conteudo) {
      return { error: 'Seção não encontrada' };
    }

    const resultado = await this.validacaoService.validarSecao(
      documento.id,
      body.secaoId,
      conteudo,
    );

    return {
      message: 'Seção validada',
      ...resultado,
    };
  }
}
