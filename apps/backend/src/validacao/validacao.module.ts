import { Module } from '@nestjs/common';
import { ValidacaoLegalService } from './validacao-legal.service';
import { ValidacoesController } from './validacoes.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ValidacoesController],
  providers: [ValidacaoLegalService, PrismaService],
  exports: [ValidacaoLegalService],
})
export class ValidacaoModule {}
