import { Injectable } from '@nestjs/common';
import { BaseAgente } from './base-agente';

/**
 * AgenteValidadorLegal - Specialized agent for legal compliance validation
 * Validates ETP data against Brazilian procurement laws
 */
@Injectable()
export class AgenteValidadorLegalService extends BaseAgente {
  get nome(): string {
    return 'Validador Legal';
  }

  get especialidade(): string {
    return 'Validação de conformidade com legislação brasileira de licitações';
  }

  get allowedTools(): string[] {
    return [];
  }

  get systemPrompt(): string {
    return `Você é um especialista em legislação de licitações públicas no Brasil, com profundo conhecimento de:

**Legislação Principal:**
- Lei 8.666/93 (Lei de Licitações antiga)
- Lei 14.133/21 (Nova Lei de Licitações, vigente desde 2023)
- IN SEGES nº 05/2017 (Estrutura de ETP)
- IN SEGES nº 65/2021 (Estimativa de custos)

**Sua Missão:**
Validar dados coletados para ETP e identificar inconformidades legais críticas ou alertas.

**Regras de Validação Principais:**

1. **Modalidade vs Valor Estimado (Lei 14.133/21, Art. 75):**
   - Dispensa de licitação: até R$ 100.000 (obras) ou R$ 50.000 (outros)
   - Inexigibilidade: valor não importa (necessidade de exclusividade)
   - Pregão: qualquer valor (presencial ou eletrônico)
   - Concorrência: acima dos limites de dispensa

2. **Prazo de Execução Mínimo:**
   - Serviços complexos: mínimo 6 meses
   - Obras: mínimo 12 meses
   - Serviços simples: mínimo 3 meses

3. **Justificativa Obrigatória (Lei 14.133/21, Art. 11):**
   - Descrição da necessidade
   - Alinhamento com planejamento estratégico
   - Estimativa de custos fundamentada

4. **Especificações Técnicas (Lei 14.133/21, Art. 40):**
   - Não podem conter marcas ou modelos específicos
   - Devem permitir competitividade
   - Requisitos devem ser objetivos e mensuráveis

5. **Critérios de Sustentabilidade (Decreto 10.024/2019):**
   - Obrigatório para contratos acima de R$ 200.000
   - Pelo menos 2 critérios socioambientais

**Formato de Resposta:**
Retorne JSON com estrutura:
{
  "validacoes": [
    {
      "secaoId": "dados_coletados",
      "regra": "Valor compatível com modalidade",
      "valido": true|false,
      "observacoes": "Descrição detalhada",
      "fundamentacao_legal": "Lei 14.133/21, Art. 75, §1º",
      "criticidade": "critica"|"alerta"|"informacao"
    }
  ],
  "percentual_conformidade": 85.5,
  "erros_criticos": ["Descrição do erro 1", "Descrição do erro 2"],
  "alertas": ["Descrição do alerta 1"],
  "bloqueio_geracao": true|false
}

**Criticidade:**
- "critica": Viola lei, bloqueia geração
- "alerta": Recomendação, não bloqueia
- "informacao": Apenas informativo

Seja rigoroso mas justo. Priorize conformidade legal sobre preferências.`;
  }

  /**
   * Validate collected data against legal rules
   * @param dadosColetados - Collected ETP data
   * @returns Validation result with compliance percentage
   */
  async validarDados(dadosColetados: any): Promise<any> {
    const mensagem = `Valide os seguintes dados coletados para um ETP:

${JSON.stringify(dadosColetados, null, 2)}

Analise cada campo de acordo com a legislação brasileira e retorne o resultado em JSON.`;

    const response = await this.executar(mensagem);
    return this.extrairJSON(response);
  }

  /**
   * Validate specific section content
   * @param secaoId - Section identifier
   * @param conteudo - Section content
   * @returns Validation result for section
   */
  async validarSecao(secaoId: string, conteudo: any): Promise<any> {
    const mensagem = `Valide o conteúdo da seção "${secaoId}" de um ETP:

${JSON.stringify(conteudo, null, 2)}

Verifique conformidade legal específica para esta seção e retorne JSON.`;

    const response = await this.executar(mensagem);
    return this.extrairJSON(response);
  }

  protected validarResposta(resposta: any): boolean {
    return (
      resposta &&
      Array.isArray(resposta.validacoes) &&
      typeof resposta.percentual_conformidade === 'number' &&
      Array.isArray(resposta.erros_criticos) &&
      Array.isArray(resposta.alertas) &&
      typeof resposta.bloqueio_geracao === 'boolean'
    );
  }
}
