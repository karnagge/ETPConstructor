import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrquestradorMultiAgenteService } from '../agentes/orquestrador-multi-agente.service';
import { DocxBuilderService } from './docx-builder.service';
import { ValidacaoLegalService } from '../validacao/validacao-legal.service';

/**
 * GeracaoService - Coordinates full document generation flow
 * Validates data, orchestrates agents, generates DOCX, persists files
 */
@Injectable()
export class GeracaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orquestrador: OrquestradorMultiAgenteService,
    private readonly docxBuilder: DocxBuilderService,
    private readonly validacaoLegal: ValidacaoLegalService,
  ) {}

  /**
   * Generate complete ETP document
   * @param documentoId - Document UUID
   * @param onProgress - Callback for progress updates
   * @returns Generation result with file paths
   */
  async gerarDocumento(
    documentoId: string,
    onProgress?: (phase: string, percentage: number) => void,
  ): Promise<any> {
    const startTime = Date.now();

    try {
      // 1. Load document from database
      const documento = await this.prisma.documento.findUnique({
        where: { id: documentoId },
      });

      if (!documento) {
        throw new Error('Documento não encontrado');
      }

      // 2. Validate pre-requisites (Phase 0 - 5%)
      onProgress?.('Validando Pré-requisitos', 5);
      
      const dadosColetados = documento.dadosColetados as any;
      
      // Check if all fields are collected
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
      ];

      const camposFaltantes = camposObrigatorios.filter(
        (campo) => !dadosColetados[campo],
      );

      if (camposFaltantes.length > 0) {
        throw new Error(
          `Campos obrigatórios faltando: ${camposFaltantes.join(', ')}`,
        );
      }

      // Check for critical legal errors
      const hasCriticalErrors = await this.validacaoLegal.hasCriticalErrors(
        documentoId,
      );

      if (hasCriticalErrors) {
        throw new Error(
          'Documento possui erros críticos de validação legal. Corrija-os antes de gerar.',
        );
      }

      // 3. Update status to EM_GERACAO
      await this.prisma.documento.update({
        where: { id: documentoId },
        data: { status: 'EM_GERACAO' },
      });

      // 4. Orchestrate multi-agent generation (5-90%)
      const resultado = await this.orquestrador.gerarSecoes(
        dadosColetados,
        (phase, percentage) => {
          // Scale from 5-90%
          const scaledPercentage = 5 + (percentage * 0.85);
          onProgress?.(phase, Math.round(scaledPercentage));
        },
      );

      // 5. Generate DOCX file (90-95%)
      onProgress?.('Gerando Arquivo DOCX', 90);
      
      const buffer = await this.docxBuilder.gerarDocumento(
        documento.titulo,
        resultado.secoes,
      );

      const caminhoDocx = await this.docxBuilder.salvarDocumento(
        buffer,
        documento.uuid,
      );

      // 6. Update document with results (95-100%)
      onProgress?.('Salvando Documento', 95);
      
      await this.prisma.documento.update({
        where: { id: documentoId },
        data: {
          conteudoSecoes: resultado.secoes,
          caminhoDocx,
          status: 'CONCLUIDO',
          concluidoEm: new Date(),
        },
      });

      // 7. Create initial version
      await this.prisma.versaoDocumento.create({
        data: {
          documentoId,
          numeroVersao: 1,
          conteudoSecoes: resultado.secoes,
          alteracoes: 'Versão inicial gerada automaticamente',
        },
      });

      const tempoGeracao = Math.round((Date.now() - startTime) / 1000);

      onProgress?.('Geração Concluída', 100);

      return {
        sucesso: true,
        caminhoDocx,
        tempoGeracao,
        secoesGeradas: Object.keys(resultado.secoes).length,
        erros: resultado.erros,
      };
    } catch (error) {
      // Rollback status on error
      await this.prisma.documento.update({
        where: { id: documentoId },
        data: { status: 'RASCUNHO' },
      });

      console.error('[GeracaoService] Error generating document:', error);
      throw error;
    }
  }

  /**
   * Get document file for download
   * @param documentoId - Document UUID
   * @param formato - File format (docx or pdf)
   * @returns File buffer and metadata
   */
  async getDocumentoFile(
    documentoId: string,
    formato: 'docx' | 'pdf' = 'docx',
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const documento = await this.prisma.documento.findUnique({
      where: { id: documentoId },
    });

    if (!documento) {
      throw new Error('Documento não encontrado');
    }

    const caminho = formato === 'docx' ? documento.caminhoDocx : documento.caminhoPdf;

    if (!caminho) {
      throw new Error(`Arquivo ${formato.toUpperCase()} não disponível`);
    }

    const fs = require('fs');
    const path = require('path');
    
    const uploadsDir = process.env.UPLOADS_DIR || './uploads';
    const fullPath = path.join(uploadsDir, caminho);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Arquivo não encontrado: ${fullPath}`);
    }

    const buffer = fs.readFileSync(fullPath);
    const filename = `${documento.titulo.replace(/[^a-zA-Z0-9]/g, '_')}.${formato}`;
    const mimetype =
      formato === 'docx'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/pdf';

    return { buffer, filename, mimetype };
  }
}
