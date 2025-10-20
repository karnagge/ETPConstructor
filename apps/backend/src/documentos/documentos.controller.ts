import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UsePipes,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { DocumentosService } from './documentos.service';
import {
  CreateDocumentoSchema,
  UpdateDocumentoSchema,
  CreateDocumentoDto,
  UpdateDocumentoDto,
} from './dto/create-documento.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { GeracaoService } from '../geracao/geracao.service';

/**
 * T040: DocumentosController
 * REST API endpoints for documento management
 */
@Controller('documentos')
export class DocumentosController {
  constructor(
    private readonly documentosService: DocumentosService,
    private readonly geracaoService: GeracaoService,
  ) {}

  /**
   * T042: POST /api/documentos - Create new documento
   */
  @Post()
  @UsePipes(new ZodValidationPipe(CreateDocumentoSchema))
  async create(@Body() dto: CreateDocumentoDto) {
    return await this.documentosService.create(dto);
  }

  /**
   * T044: GET /api/documentos - List all documentos with filters
   */
  @Get()
  async findAll(
    @Query('usuarioId') usuarioId?: string,
    @Query('projetoId') projetoId?: string,
    @Query('status') status?: string,
  ) {
    return await this.documentosService.findAll({
      usuarioId,
      projetoId,
      status,
    });
  }

  /**
   * T043: GET /api/documentos/:uuid - Get single documento
   */
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    const documento = await this.documentosService.findByUuid(uuid);

    if (!documento) {
      throw new NotFoundException(`Documento ${uuid} não encontrado`);
    }

    return documento;
  }

  /**
   * T046: PATCH /api/documentos/:uuid - Update documento
   */
  @Patch(':uuid')
  @UsePipes(new ZodValidationPipe(UpdateDocumentoSchema))
  async update(@Param('uuid') uuid: string, @Body() dto: UpdateDocumentoDto) {
    const documento = await this.documentosService.findByUuid(uuid);

    if (!documento) {
      throw new NotFoundException(`Documento ${uuid} não encontrado`);
    }

    return await this.documentosService.update(uuid, dto);
  }

  /**
   * DELETE /api/documentos/:uuid - Delete (archive) documento
   */
  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('uuid') uuid: string) {
    const documento = await this.documentosService.findByUuid(uuid);

    if (!documento) {
      throw new NotFoundException(`Documento ${uuid} não encontrado`);
    }

    await this.documentosService.delete(uuid);
  }

  /**
   * GET /api/documentos/:uuid/progresso - Get collection progress
   */
  @Get(':uuid/progresso')
  async getProgresso(@Param('uuid') uuid: string) {
    const documento = await this.documentosService.findByUuid(uuid);

    if (!documento) {
      throw new NotFoundException(`Documento ${uuid} não encontrado`);
    }

    const isCompleto = this.documentosService.isColetaCompleta(
      documento.dadosColetados,
    );

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

    const camposColetados = camposObrigatorios.filter(
      (campo) => (documento.dadosColetados as any)?.[campo],
    );

    const camposFaltantes = camposObrigatorios.filter(
      (campo) => !(documento.dadosColetados as any)?.[campo],
    );

    const progresso = Math.round((camposColetados.length / 11) * 100);

    return {
      progresso,
      isCompleto,
      camposColetados: camposColetados.length,
      camposFaltantes,
      dadosColetados: documento.dadosColetados,
    };
  }

  /**
   * T084: POST /api/documentos/:uuid/gerar - Generate ETP document
   */
  @Post(':uuid/gerar')
  async gerar(@Param('uuid') uuid: string) {
    const documento = await this.documentosService.findByUuid(uuid);

    if (!documento) {
      throw new NotFoundException(`Documento ${uuid} não encontrado`);
    }

    // T085: Validate prerequisites
    const isCompleto = this.documentosService.isColetaCompleta(
      documento.dadosColetados,
    );

    if (!isCompleto) {
      throw new BadRequestException(
        'Coleta de dados incompleta. Complete todos os campos obrigatórios antes de gerar.',
      );
    }

    // Check for critical legal errors (will throw if errors exist)
    // This will be handled by GeracaoService

    // T086: Update status to EM_GERACAO will be done by GeracaoService
    // T088: 'geracao_iniciada' event will be emitted by ChatGateway

    // Note: Actual generation happens via WebSocket (see ChatGateway)
    // This endpoint just validates and returns initial status
    return {
      mensagem: 'Geração iniciada. Acompanhe o progresso via WebSocket.',
      documentoUuid: uuid,
    };
  }

  /**
   * T090: GET /api/documentos/:uuid/download/docx - Download DOCX file
   */
  @Get(':uuid/download/docx')
  async downloadDocx(@Param('uuid') uuid: string, @Res() res: Response) {
    const documento = await this.documentosService.findByUuid(uuid);

    if (!documento) {
      throw new NotFoundException(`Documento ${uuid} não encontrado`);
    }

    if (!documento.caminhoDocx) {
      throw new NotFoundException(
        'Arquivo DOCX não disponível. Gere o documento primeiro.',
      );
    }

    const { buffer, filename, mimetype } =
      await this.geracaoService.getDocumentoFile(documento.id, 'docx');

    res.set({
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  /**
   * T091: GET /api/documentos/:uuid/download/pdf - Download PDF file (optional)
   */
  @Get(':uuid/download/pdf')
  async downloadPdf(@Param('uuid') uuid: string, @Res() res: Response) {
    const documento = await this.documentosService.findByUuid(uuid);

    if (!documento) {
      throw new NotFoundException(`Documento ${uuid} não encontrado`);
    }

    if (!documento.caminhoPdf) {
      throw new NotFoundException(
        'Arquivo PDF não disponível. Funcionalidade em desenvolvimento.',
      );
    }

    const { buffer, filename, mimetype } =
      await this.geracaoService.getDocumentoFile(documento.id, 'pdf');

    res.set({
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
