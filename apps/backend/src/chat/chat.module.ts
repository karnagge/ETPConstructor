import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AgenteColetorConversacionalService } from '../agentes/agente-coletor-conversacional.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { GeracaoService } from '../geracao/geracao.service';
import { DocxBuilderService } from '../geracao/docx-builder.service';
import { OrquestradorMultiAgenteService } from '../agentes/orquestrador-multi-agente.service';
import { AgenteValidadorLegalService } from '../agentes/agente-validador-legal.service';
import { AgenteEspecificacoesTecnicasService } from '../agentes/agente-especificacoes-tecnicas.service';
import { AgenteEstimativaCustosService } from '../agentes/agente-estimativa-custos.service';
import { AgenteGestaoContratualService } from '../agentes/agente-gestao-contratual.service';
import { ValidacaoLegalService } from '../validacao/validacao-legal.service';

@Module({
  providers: [
    ChatGateway,
    ChatService,
    AgenteColetorConversacionalService,
    PrismaService,
    RedisService,
    GeracaoService,
    DocxBuilderService,
    OrquestradorMultiAgenteService,
    AgenteValidadorLegalService,
    AgenteEspecificacoesTecnicasService,
    AgenteEstimativaCustosService,
    AgenteGestaoContratualService,
    ValidacaoLegalService,
  ],
})
export class ChatModule {}
