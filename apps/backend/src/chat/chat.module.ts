import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AgenteColetorConversacionalService } from '../agentes/agente-coletor-conversacional.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Module({
  providers: [
    ChatGateway,
    ChatService,
    AgenteColetorConversacionalService,
    PrismaService,
    RedisService,
  ],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
