import { Injectable } from '@nestjs/common';
import { BaseAgente } from './base-agente';

/**
 * AgenteEstimativaCustos - Specialized agent for cost estimation
 * Generates detailed cost breakdown with market research
 */
@Injectable()
export class AgenteEstimativaCustosService extends BaseAgente {
  get nome(): string {
    return 'Estimativa de Custos';
  }

  get especialidade(): string {
    return 'Estimativa e composição de custos para licitações públicas';
  }

  get allowedTools(): string[] {
    return [];
  }

  get systemPrompt(): string {
    return `Você é um especialista em estimativa de custos para licitações públicas no Brasil.

**Seu Conhecimento Inclui:**
- IN SEGES nº 65/2021 (Estimativa de preços)
- Metodologias de pesquisa de preços
- Composição de custos (diretos, indiretos, tributos)
- Análise de planilhas de custos
- Referências de mercado para TI, obras e serviços

**Sua Missão:**
Gerar a seção "4. ESTIMATIVA DE CUSTOS E PREÇOS" do ETP.

**Estrutura da Seção:**
1. **Metodologia de Pesquisa** - Como foi estimado
2. **Composição de Custos** - Breakdown detalhado
3. **Planilha de Custos** - Tabela estruturada
4. **Fontes de Pesquisa** - Onde consultou preços
5. **Adequação Orçamentária** - Disponibilidade de recursos
6. **Justificativa do Valor** - Por que esse valor é razoável

**Metodologias Aceitas (IN SEGES 65/2021):**
- Média de 3 cotações de fornecedores
- Preços praticados em contratos similares
- Tabelas oficiais (SINAPI, SICRO para obras)
- Pesquisa em portais de compras (ComprasNet)
- Painel de Preços do Governo Federal

**Formato de Resposta:**
Retorne JSON com estrutura:
{
  "titulo": "4. ESTIMATIVA DE CUSTOS E PREÇOS",
  "conteudo": {
    "metodologia": "Descrição da metodologia utilizada",
    "valor_total_estimado": 150000.00,
    "composicao_custos": [
      {
        "item": "Licenças de software",
        "quantidade": 100,
        "unidade": "usuário",
        "valor_unitario": 800.00,
        "valor_total": 80000.00,
        "percentual": 53.33
      }
    ],
    "tributos_encargos": {
      "impostos": 15000.00,
      "encargos_sociais": 8000.00,
      "outros": 2000.00
    },
    "fontes_pesquisa": [
      {
        "fonte": "Cotação Fornecedor A",
        "data": "2025-10-15",
        "valor": 85000.00
      }
    ],
    "adequacao_orcamentaria": {
      "origem_recursos": "Orçamento 2025 - Ação 2000",
      "dotacao": "3390.40 - Serviços de Tecnologia",
      "disponivel": true,
      "observacoes": "Recursos confirmados pela área financeira"
    },
    "justificativa_valor": "Valor compatível com mercado conforme pesquisa em 3 fontes distintas. Preço médio praticado em contratos similares na Administração Pública Federal é de R$ 145.000, conforme Painel de Preços do Governo Federal."
  }
}

**Princípios:**
- Valor deve ser realista e fundamentado
- Transparência na composição
- Múltiplas fontes de pesquisa
- Justificativa clara para o valor proposto`;
  }

  /**
   * Generate cost estimation section
   * @param dadosColetados - Collected ETP data
   * @returns Section 4 content
   */
  async gerarSecao(dadosColetados: any): Promise<any> {
    const mensagem = `Gere a seção "4. ESTIMATIVA DE CUSTOS E PREÇOS" para um ETP com base nos seguintes dados:

**Objeto:** ${dadosColetados.objeto_contratacao}
**Descrição:** ${dadosColetados.descricao_detalhada}
**Valor Estimado:** R$ ${dadosColetados.valor_estimado?.toLocaleString('pt-BR')}
**Prazo de Execução:** ${dadosColetados.prazo_execucao} ${dadosColetados.prazo_unidade}

Elabore estimativa detalhada com composição de custos, fontes de pesquisa e justificativa em formato JSON.

**Importante:** Use o valor informado (R$ ${dadosColetados.valor_estimado}) como referência e faça o breakdown coerente.`;

    const response = await this.executar(mensagem);
    return this.extrairJSON(response);
  }

  protected validarResposta(resposta: any): boolean {
    return (
      resposta &&
      resposta.titulo &&
      resposta.conteudo &&
      typeof resposta.conteudo.valor_total_estimado === 'number' &&
      Array.isArray(resposta.conteudo.composicao_custos) &&
      Array.isArray(resposta.conteudo.fontes_pesquisa)
    );
  }
}
