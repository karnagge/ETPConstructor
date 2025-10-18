import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { ChatModule } from './chat/chat.module';
import { DocumentosModule } from './documentos/documentos.module';

@Module({
  imports: [ChatModule, DocumentosModule],
  controllers: [],
  providers: [PrismaService, RedisService],
  exports: [PrismaService, RedisService],
})
export class AppModule {}
