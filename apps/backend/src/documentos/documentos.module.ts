import { Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeracaoService } from '../geracao/geracao.service';
import { DocxBuilderService } from '../geracao/docx-builder.service';
import { OrquestradorMultiAgenteService } from '../agentes/orquestrador-multi-agente.service';
import { AgenteValidadorLegalService } from '../agentes/agente-validador-legal.service';
import { AgenteEspecificacoesTecnicasService } from '../agentes/agente-especificacoes-tecnicas.service';
import { AgenteEstimativaCustosService } from '../agentes/agente-estimativa-custos.service';
import { AgenteGestaoContratualService } from '../agentes/agente-gestao-contratual.service';
import { ValidacaoLegalService } from '../validacao/validacao-legal.service';

@Module({
  controllers: [DocumentosController],
  providers: [
    DocumentosService,
    PrismaService,
    GeracaoService,
    DocxBuilderService,
    OrquestradorMultiAgenteService,
    AgenteValidadorLegalService,
    AgenteEspecificacoesTecnicasService,
    AgenteEstimativaCustosService,
    AgenteGestaoContratualService,
    ValidacaoLegalService,
  ],
  exports: [DocumentosService, GeracaoService, ValidacaoLegalService],
})
export class DocumentosModule {}
