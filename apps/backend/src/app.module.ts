import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { ChatModule } from './chat/chat.module';
import { DocumentosModule } from './documentos/documentos.module';
import { ProjetosModule } from './projetos/projetos.module';
import { ValidacaoModule } from './validacao/validacao.module';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { LoggerService } from './common/logger/logger.service';

@Module({
  imports: [ChatModule, DocumentosModule, ProjetosModule, ValidacaoModule],
  controllers: [],
  providers: [PrismaService, RedisService, LoggerService],
  exports: [PrismaService, RedisService, LoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // T175: Apply HTTP logger to all routes
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
