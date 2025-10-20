import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { REGRAS_LEGAIS, getCriticalRules } from './regras-legais.config';

/**
 * ValidacaoLegalService - Executes legal validation rules
 * Persists validation results to database
 */
@Injectable()
export class ValidacaoLegalService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate collected data against all legal rules
   * @param documentoId - Document UUID
   * @param dadosColetados - Collected ETP data
   * @returns Validation summary with compliance percentage
   */
  async validarDados(documentoId: string, dadosColetados: any): Promise<any> {
    const validacoes: any[] = [];
    let regrasValidas = 0;

    // Execute all validation rules
    for (const regra of REGRAS_LEGAIS) {
      const resultado = regra.validar(dadosColetados);

      // Persist to database
      await this.prisma.validacaoLegal.create({
        data: {
          documentoId,
          secaoId: 'dados_coletados',
          regra: regra.nome,
          valido: resultado.valido,
          observacoes: resultado.observacoes || null,
        },
      });

      validacoes.push({
        secaoId: 'dados_coletados',
        regra: regra.nome,
        valido: resultado.valido,
        observacoes: resultado.observacoes,
        fundamentacao_legal: regra.fundamentacao_legal,
        criticidade: regra.criticidade,
      });

      if (resultado.valido) {
        regrasValidas++;
      }
    }

    // Calculate compliance percentage
    const percentualConformidade = (regrasValidas / REGRAS_LEGAIS.length) * 100;

    // Extract critical errors and warnings
    const errosCriticos = validacoes
      .filter((v) => !v.valido && v.criticidade === 'critica')
      .map((v) => `${v.regra}: ${v.observacoes}`);

    const alertas = validacoes
      .filter((v) => !v.valido && v.criticidade === 'alerta')
      .map((v) => `${v.regra}: ${v.observacoes}`);

    // Block generation if critical errors exist
    const bloqueioGeracao = errosCriticos.length > 0;

    return {
      validacoes,
      percentual_conformidade: Math.round(percentualConformidade * 10) / 10,
      erros_criticos: errosCriticos,
      alertas,
      bloqueio_geracao: bloqueioGeracao,
      total_regras: REGRAS_LEGAIS.length,
      regras_validas: regrasValidas,
    };
  }

  /**
   * Validate specific section content
   * @param documentoId - Document UUID
   * @param secaoId - Section identifier
   * @param conteudo - Section content
   * @returns Validation result for section
   */
  async validarSecao(
    documentoId: string,
    secaoId: string,
    conteudo: any,
  ): Promise<any> {
    // For now, section validation is simpler
    // Can be extended with section-specific rules in the future
    const valido = conteudo && Object.keys(conteudo).length > 0;

    await this.prisma.validacaoLegal.create({
      data: {
        documentoId,
        secaoId,
        regra: 'Seção gerada',
        valido,
        observacoes: valido ? 'Seção gerada com sucesso' : 'Seção vazia',
      },
    });

    return { valido, secaoId };
  }

  /**
   * Calculate compliance percentage for a document
   * @param documentoId - Document UUID
   * @returns Compliance percentage
   */
  async calculateCompliance(documentoId: string): Promise<number> {
    const validacoes = await this.prisma.validacaoLegal.findMany({
      where: { documentoId },
      orderBy: { criadoEm: 'desc' },
    });

    if (validacoes.length === 0) return 0;

    // Get latest validation for each rule (deduplicate)
    const latestValidations = new Map<string, any>();
    for (const v of validacoes) {
      const key = `${v.secaoId}_${v.regra}`;
      if (!latestValidations.has(key)) {
        latestValidations.set(key, v);
      }
    }

    const latest = Array.from(latestValidations.values());
    const validas = latest.filter((v) => v.valido).length;

    return Math.round((validas / latest.length) * 100 * 10) / 10;
  }

  /**
   * Check if document has critical errors that block generation
   * @param documentoId - Document UUID
   * @returns True if critical errors exist
   */
  async hasCriticalErrors(documentoId: string): Promise<boolean> {
    const criticalRules = getCriticalRules();
    const criticalRuleNames = criticalRules.map((r) => r.nome);

    const failedCritical = await this.prisma.validacaoLegal.findMany({
      where: {
        documentoId,
        regra: { in: criticalRuleNames },
        valido: false,
      },
      orderBy: { criadoEm: 'desc' },
      take: criticalRuleNames.length,
    });

    return failedCritical.length > 0;
  }

  /**
   * Get validation summary for document
   * @param documentoId - Document UUID
   * @returns Resumo with errors, warnings, compliance
   */
  async getResumo(documentoId: string): Promise<any> {
    const validacoes = await this.prisma.validacaoLegal.findMany({
      where: { documentoId },
      orderBy: { criadoEm: 'desc' },
    });

    // Deduplicate to get latest per rule
    const latestValidations = new Map<string, any>();
    for (const v of validacoes) {
      const key = `${v.secaoId}_${v.regra}`;
      if (!latestValidations.has(key)) {
        latestValidations.set(key, v);
      }
    }

    const latest = Array.from(latestValidations.values());
    const falhas = latest.filter((v) => !v.valido);

    // Categorize by criticality (approximate from rule names)
    const errosCriticos = falhas.filter((v) =>
      this.isCriticalRule(v.regra),
    );
    const alertas = falhas.filter((v) => !this.isCriticalRule(v.regra));

    const percentualConformidade = await this.calculateCompliance(documentoId);

    return {
      total_regras: latest.length,
      regras_validas: latest.filter((v) => v.valido).length,
      percentual_conformidade: percentualConformidade,
      erros_criticos: errosCriticos.map((v) => ({
        regra: v.regra,
        observacoes: v.observacoes,
      })),
      alertas: alertas.map((v) => ({
        regra: v.regra,
        observacoes: v.observacoes,
      })),
    };
  }

  /**
   * Helper to check if rule is critical based on name
   */
  private isCriticalRule(regraNome: string): boolean {
    const criticalRules = getCriticalRules();
    return criticalRules.some((r) => r.nome === regraNome);
  }
}
