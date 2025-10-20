import { Injectable } from '@nestjs/common';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';

/**
 * DocxBuilderService - Generates DOCX files from ETP sections
 * Uses docx library for programmatic document creation
 */
@Injectable()
export class DocxBuilderService {
  /**
   * Generate complete DOCX document from sections
   * @param titulo - Document title
   * @param conteudoSecoes - All 9 sections content
   * @returns Buffer with DOCX file
   */
  async gerarDocumento(titulo: string, conteudoSecoes: any): Promise<Buffer> {
    const sections: any[] = [];

    // Title page
    sections.push(...this.criarPaginaTitulo(titulo));

    // Generate all 9 sections
    if (conteudoSecoes['1_definicao_objeto']) {
      sections.push(...this.criarSecao1(conteudoSecoes['1_definicao_objeto']));
    }
    if (conteudoSecoes['2_justificativa']) {
      sections.push(...this.criarSecao2(conteudoSecoes['2_justificativa']));
    }
    if (conteudoSecoes['3_especificacoes']) {
      sections.push(...this.criarSecao3(conteudoSecoes['3_especificacoes']));
    }
    if (conteudoSecoes['4_estimativa_custos']) {
      sections.push(...this.criarSecao4(conteudoSecoes['4_estimativa_custos']));
    }
    if (conteudoSecoes['5_gestao_fiscalizacao']) {
      sections.push(...this.criarSecao5(conteudoSecoes['5_gestao_fiscalizacao']));
    }
    if (conteudoSecoes['6_obrigacoes_contratante']) {
      sections.push(...this.criarSecao6(conteudoSecoes['6_obrigacoes_contratante']));
    }
    if (conteudoSecoes['7_obrigacoes_contratada']) {
      sections.push(...this.criarSecao7(conteudoSecoes['7_obrigacoes_contratada']));
    }
    if (conteudoSecoes['8_criterios_aceitacao']) {
      sections.push(...this.criarSecao8(conteudoSecoes['8_criterios_aceitacao']));
    }
    if (conteudoSecoes['9_sancoes']) {
      sections.push(...this.criarSecao9(conteudoSecoes['9_sancoes']));
    }

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
              },
            },
          },
          children: sections,
        },
      ],
    });

    // Convert to buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }

  /**
   * Save document to filesystem
   * @param buffer - DOCX buffer
   * @param uuid - Document UUID
   * @returns File path
   */
  async salvarDocumento(buffer: Buffer, uuid: string): Promise<string> {
    const uploadsDir = process.env.UPLOADS_DIR || './uploads';
    const documentsDir = path.join(uploadsDir, 'documents');

    // Ensure directory exists
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }

    const filename = `${uuid}.docx`;
    const filepath = path.join(documentsDir, filename);

    fs.writeFileSync(filepath, buffer);

    return `documents/${filename}`;
  }

  // ==================== SECTION GENERATORS ====================

  private criarPaginaTitulo(titulo: string): Paragraph[] {
    return [
      new Paragraph({
        text: titulo.toUpperCase(),
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 400 },
      }),
      new Paragraph({
        text: 'ESTUDO TÉCNICO PRELIMINAR (ETP)',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({ text: '' }), // Page break
    ];
  }

  private criarSecao1(secao: any): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        text: secao.titulo || '1. DEFINIÇÃO DO OBJETO',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      }),
    );

    if (secao.conteudo.descricao) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Objeto: ', bold: true }),
            new TextRun({ text: secao.conteudo.descricao }),
          ],
          spacing: { after: 120 },
        }),
      );
    }

    if (secao.conteudo.descricao_detalhada) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Descrição Detalhada: ', bold: true }),
            new TextRun({ text: secao.conteudo.descricao_detalhada }),
          ],
          spacing: { after: 120 },
        }),
      );
    }

    if (secao.conteudo.classificacao) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Classificação: ', bold: true }),
            new TextRun({ text: secao.conteudo.classificacao }),
          ],
          spacing: { after: 120 },
        }),
      );
    }

    return paragraphs;
  }

  private criarSecao2(secao: any): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        text: secao.titulo || '2. JUSTIFICATIVA DA CONTRATAÇÃO',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      }),
    );

    if (secao.conteudo.necessidade) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Necessidade: ', bold: true }),
            new TextRun({ text: secao.conteudo.necessidade }),
          ],
          spacing: { after: 120 },
        }),
      );
    }

    if (secao.conteudo.orgao_demandante) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Órgão Demandante: ', bold: true }),
            new TextRun({ text: secao.conteudo.orgao_demandante }),
          ],
          spacing: { after: 120 },
        }),
      );
    }

    if (secao.conteudo.beneficios_esperados) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'Benefícios Esperados:', bold: true })],
          spacing: { before: 120, after: 60 },
        }),
      );
      secao.conteudo.beneficios_esperados.forEach((beneficio: string) => {
        paragraphs.push(
          new Paragraph({
            text: `• ${beneficio}`,
            spacing: { after: 60 },
          }),
        );
      });
    }

    return paragraphs;
  }

  private criarSecao3(secao: any): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        text: secao.titulo || '3. ESPECIFICAÇÕES TÉCNICAS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      }),
    );

    if (secao.conteudo.requisitos_obrigatorios) {
      paragraphs.push(
        new Paragraph({
          text: 'Requisitos Obrigatórios:',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 60 },
        }),
      );
      secao.conteudo.requisitos_obrigatorios.forEach((req: any) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${req.id}: `, bold: true }),
              new TextRun({ text: req.descricao }),
            ],
            spacing: { after: 60 },
          }),
        );
      });
    }

    if (secao.conteudo.normas_tecnicas) {
      paragraphs.push(
        new Paragraph({
          text: 'Normas Técnicas Aplicáveis:',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 60 },
        }),
      );
      secao.conteudo.normas_tecnicas.forEach((norma: any) => {
        paragraphs.push(
          new Paragraph({
            text: `• ${norma.norma} - ${norma.aplicacao}`,
            spacing: { after: 60 },
          }),
        );
      });
    }

    return paragraphs;
  }

  private criarSecao4(secao: any): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        text: secao.titulo || '4. ESTIMATIVA DE CUSTOS E PREÇOS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      }),
    );

    if (secao.conteudo.metodologia) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Metodologia: ', bold: true }),
            new TextRun({ text: secao.conteudo.metodologia }),
          ],
          spacing: { after: 120 },
        }),
      );
    }

    if (secao.conteudo.valor_total_estimado) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Valor Total Estimado: ', bold: true }),
            new TextRun({
              text: `R$ ${secao.conteudo.valor_total_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            }),
          ],
          spacing: { after: 120 },
        }),
      );
    }

    if (secao.conteudo.composicao_custos) {
      paragraphs.push(
        new Paragraph({
          text: 'Composição de Custos:',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 60 },
        }),
      );
      secao.conteudo.composicao_custos.forEach((item: any) => {
        paragraphs.push(
          new Paragraph({
            text: `${item.item}: ${item.quantidade} ${item.unidade} × R$ ${item.valor_unitario.toLocaleString('pt-BR')} = R$ ${item.valor_total.toLocaleString('pt-BR')}`,
            spacing: { after: 60 },
          }),
        );
      });
    }

    return paragraphs;
  }

  private criarSecao5(secao: any): Paragraph[] {
    return this.criarSecaoSimples(
      secao.titulo || '5. GESTÃO E FISCALIZAÇÃO DO CONTRATO',
      secao.conteudo,
    );
  }

  private criarSecao6(secao: any): Paragraph[] {
    return this.criarSecaoSimples(
      secao.titulo || '6. OBRIGAÇÕES DO CONTRATANTE',
      secao.conteudo,
    );
  }

  private criarSecao7(secao: any): Paragraph[] {
    return this.criarSecaoSimples(
      secao.titulo || '7. OBRIGAÇÕES DA CONTRATADA',
      secao.conteudo,
    );
  }

  private criarSecao8(secao: any): Paragraph[] {
    return this.criarSecaoSimples(
      secao.titulo || '8. CRITÉRIOS DE ACEITAÇÃO DO OBJETO',
      secao.conteudo,
    );
  }

  private criarSecao9(secao: any): Paragraph[] {
    return this.criarSecaoSimples(
      secao.titulo || '9. SANÇÕES ADMINISTRATIVAS',
      secao.conteudo,
    );
  }

  /**
   * Generic section generator for simple sections
   */
  private criarSecaoSimples(titulo: string, conteudo: any): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        text: titulo,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      }),
    );

    // Recursively add content
    this.adicionarConteudoRecursivo(paragraphs, conteudo);

    return paragraphs;
  }

  /**
   * Recursively add content to paragraphs
   */
  private adicionarConteudoRecursivo(
    paragraphs: Paragraph[],
    obj: any,
    depth: number = 0,
  ): void {
    if (typeof obj === 'string') {
      paragraphs.push(
        new Paragraph({
          text: obj,
          spacing: { after: 60 },
        }),
      );
    } else if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (typeof item === 'string') {
          paragraphs.push(
            new Paragraph({
              text: `• ${item}`,
              spacing: { after: 60 },
            }),
          );
        } else {
          this.adicionarConteudoRecursivo(paragraphs, item, depth);
        }
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        const label = key.replace(/_/g, ' ').toUpperCase();
        if (typeof value === 'string' || typeof value === 'number') {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${label}: `, bold: true }),
                new TextRun({ text: String(value) }),
              ],
              spacing: { after: 60 },
            }),
          );
        } else {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: `${label}:`, bold: true })],
              spacing: { before: 60, after: 30 },
            }),
          );
          this.adicionarConteudoRecursivo(paragraphs, value, depth + 1);
        }
      });
    }
  }
}
