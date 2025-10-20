import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { VersoesService } from './versoes.service';

@Controller('documentos/:documentoUuid/versoes')
export class VersoesController {
  constructor(private readonly versoesService: VersoesService) {}

  /**
   * GET /api/documentos/:documentoUuid/versoes
   * Lista todas as versões de um documento ordenadas por numeroVersao DESC
   */
  @Get()
  async listarVersoes(
    @Param('documentoUuid') documentoUuid: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const versoes = await this.versoesService.listarVersoes(documentoUuid, limitNum);
    
    return {
      sucesso: true,
      dados: versoes,
      total: versoes.length,
    };
  }

  /**
   * GET /api/documentos/:documentoUuid/versoes/:numeroVersao
   * Busca uma versão específica
   */
  @Get(':numeroVersao')
  async buscarVersao(
    @Param('documentoUuid') documentoUuid: string,
    @Param('numeroVersao') numeroVersao: string,
  ) {
    const versao = await this.versoesService.buscarVersao(
      documentoUuid,
      parseInt(numeroVersao, 10),
    );

    if (!versao) {
      throw new NotFoundException(
        `Versão ${numeroVersao} não encontrada para documento ${documentoUuid}`,
      );
    }

    return {
      sucesso: true,
      dados: versao,
    };
  }

  /**
   * POST /api/documentos/:documentoUuid/versoes/:numeroVersao/restaurar
   * Restaura uma versão antiga criando uma nova versão com o conteúdo antigo
   */
  @Post(':numeroVersao/restaurar')
  @HttpCode(HttpStatus.CREATED)
  async restaurarVersao(
    @Param('documentoUuid') documentoUuid: string,
    @Param('numeroVersao') numeroVersao: string,
  ) {
    const novaVersao = await this.versoesService.restaurarVersao(
      documentoUuid,
      parseInt(numeroVersao, 10),
    );

    return {
      sucesso: true,
      mensagem: `Versão ${numeroVersao} restaurada com sucesso`,
      dados: novaVersao,
    };
  }
}
