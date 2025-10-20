import { Module } from '@nestjs/common';
import { ProjetosController } from './projetos.controller';
import { ProjetosService } from './projetos.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProjetosController],
  providers: [ProjetosService, PrismaService],
  exports: [ProjetosService],
})
export class ProjetosModule {}
