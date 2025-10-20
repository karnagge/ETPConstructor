import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjetosService } from './projetos.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UuidValidationPipe } from '../common/pipes/uuid-validation.pipe';
import {
  createProjetoSchema,
  updateProjetoSchema,
  CreateProjetoDto,
  UpdateProjetoDto,
} from './dto/create-projeto.dto';

@Controller('projetos')
export class ProjetosController {
  constructor(private readonly projetosService: ProjetosService) {}

  /**
   * POST /api/projetos
   * Create a new project
   */
  @Post()
  @UsePipes(new ZodValidationPipe(createProjetoSchema))
  async create(@Body() createProjetoDto: CreateProjetoDto) {
    return this.projetosService.create(createProjetoDto);
  }

  /**
   * GET /api/projetos
   * Get all projects, optionally filtered by usuarioId
   */
  @Get()
  async findAll(@Query('usuarioId') usuarioId?: string) {
    return this.projetosService.findAll(usuarioId);
  }

  /**
   * GET /api/projetos/:uuid
   * Get a single project with its documents
   */
  @Get(':uuid')
  async findOne(@Param('uuid', UuidValidationPipe) uuid: string) {
    return this.projetosService.findOne(uuid);
  }

  /**
   * PATCH /api/projetos/:uuid
   * Update a project's details
   */
  @Patch(':uuid')
  @UsePipes(new ZodValidationPipe(updateProjetoSchema))
  async update(
    @Param('uuid', UuidValidationPipe) uuid: string,
    @Body() updateProjetoDto: UpdateProjetoDto,
  ) {
    return this.projetosService.update(uuid, updateProjetoDto);
  }

  /**
   * DELETE /api/projetos/:uuid
   * Delete a project (documents will have projetoId set to NULL)
   */
  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('uuid', UuidValidationPipe) uuid: string) {
    await this.projetosService.remove(uuid);
  }
}
