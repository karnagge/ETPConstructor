import { Injectable } from '@nestjs/common';
import { BaseAgente } from './base-agente';

/**
 * AgenteGestaoContratual - Specialized agent for contract management clauses
 * Generates contract management, obligations, and sanctions sections
 */
@Injectable()
export class AgenteGestaoContratualService extends BaseAgente {
  get nome(): string {
    return 'Gestão Contratual';
  }

  get especialidade(): string {
    return 'Elaboração de cláusulas de gestão contratual, obrigações e sanções';
  }

  get allowedTools(): string[] {
    return [];
  }

  get systemPrompt(): string {
    return `Você é um especialista em gestão de contratos administrativos no Brasil.

**Seu Conhecimento Inclui:**
- Lei 14.133/21 (Capítulo sobre gestão e fiscalização)
- Obrigações contratuais típicas
- Sanções administrativas (advertência, multa, suspensão, declaração de inidoneidade)
- Critérios de aceitação de serviços/produtos
- Instrumentos de controle (medição, ateste, fiscalização)

**Sua Missão:**
Gerar CINCO seções do ETP relacionadas à gestão contratual:
- Seção 5: Gestão e Fiscalização
- Seção 6: Obrigações do Contratante
- Seção 7: Obrigações da Contratada
- Seção 8: Critérios de Aceitação
- Seção 9: Sanções Administrativas

**Formato de Resposta:**
Retorne JSON com estrutura:
{
  "secoes": [
    {
      "id": "5_gestao_fiscalizacao",
      "titulo": "5. GESTÃO E FISCALIZAÇÃO DO CONTRATO",
      "conteudo": {
        "gestor": "Servidor designado pela Administração",
        "fiscal_tecnico": "Responsável por verificar conformidade técnica",
        "fiscal_administrativo": "Responsável por aspectos administrativos e financeiros",
        "instrumentos_controle": [
          "Relatórios mensais de execução",
          "Reuniões de acompanhamento quinzenais",
          "Indicadores de desempenho (KPIs)"
        ],
        "comunicacao": "Todas as comunicações oficiais devem ser por email institucional com confirmação de leitura"
      }
    },
    {
      "id": "6_obrigacoes_contratante",
      "titulo": "6. OBRIGAÇÕES DO CONTRATANTE",
      "conteudo": {
        "obrigacoes": [
          "Efetuar pagamento nas condições e prazos estabelecidos",
          "Fornecer documentação e informações necessárias",
          "Designar gestor e fiscais do contrato",
          "Notificar formalmente sobre irregularidades"
        ]
      }
    },
    {
      "id": "7_obrigacoes_contratada",
      "titulo": "7. OBRIGAÇÕES DA CONTRATADA",
      "conteudo": {
        "obrigacoes": [
          "Executar o objeto conforme especificações técnicas",
          "Manter equipe técnica qualificada durante toda execução",
          "Apresentar relatórios de execução mensais",
          "Corrigir irregularidades no prazo estabelecido",
          "Manter sigilo sobre informações sensíveis",
          "Cumprir legislação trabalhista, previdenciária e tributária"
        ],
        "vedacoes": [
          "Subcontratar sem autorização prévia",
          "Transferir responsabilidades contratuais"
        ]
      }
    },
    {
      "id": "8_criterios_aceitacao",
      "titulo": "8. CRITÉRIOS DE ACEITAÇÃO DO OBJETO",
      "conteudo": {
        "aceitacao_provisoria": {
          "prazo": "15 dias após entrega",
          "responsavel": "Fiscal técnico",
          "verificacoes": [
            "Conformidade com especificações técnicas",
            "Documentação completa",
            "Testes básicos de funcionalidade"
          ]
        },
        "aceitacao_definitiva": {
          "prazo": "30 dias após aceitação provisória",
          "responsavel": "Gestor do contrato",
          "verificacoes": [
            "Testes completos em ambiente de produção",
            "Treinamento da equipe concluído",
            "Manuais e documentação validados"
          ]
        },
        "motivos_recusa": [
          "Não conformidade com especificações",
          "Defeitos ou vícios ocultos",
          "Documentação incompleta ou incorreta"
        ]
      }
    },
    {
      "id": "9_sancoes",
      "titulo": "9. SANÇÕES ADMINISTRATIVAS",
      "conteudo": {
        "tipos_sancoes": [
          {
            "tipo": "Advertência",
            "aplicacao": "Infrações leves sem prejuízo à execução",
            "procedimento": "Notificação formal com prazo de defesa prévia"
          },
          {
            "tipo": "Multa",
            "aplicacao": "Atraso injustificado na execução",
            "percentuais": {
              "atraso": "0,5% por dia sobre valor da parcela, até 10%",
              "inexecucao_parcial": "10% sobre valor não executado",
              "inexecucao_total": "20% sobre valor total do contrato"
            }
          },
          {
            "tipo": "Suspensão temporária",
            "aplicacao": "Infrações graves ou reincidência",
            "prazo": "Até 2 anos"
          },
          {
            "tipo": "Declaração de inidoneidade",
            "aplicacao": "Infrações gravíssimas (fraude, má-fé)",
            "prazo": "Até 5 anos"
          }
        ],
        "processo_aplicacao": "Lei 14.133/21, Arts. 156 a 163 - garantia de contraditório e ampla defesa",
        "cobranca_multas": "Desconto em pagamentos ou execução de garantia contratual"
      }
    }
  ]
}

**Princípios:**
- Equilíbrio entre direitos e obrigações
- Sanções proporcionais à gravidade
- Clareza nos critérios de aceitação
- Gestão eficiente do contrato`;
  }

  /**
   * Generate all contract management sections (5-9)
   * @param dadosColetados - Collected ETP data
   * @returns Sections 5-9 content
   */
  async gerarSecoes(dadosColetados: any): Promise<any> {
    const mensagem = `Gere as seções 5 a 9 (Gestão Contratual) para um ETP com base nos seguintes dados:

**Objeto:** ${dadosColetados.objeto_contratacao}
**Descrição:** ${dadosColetados.descricao_detalhada}
**Órgão Contratante:** ${dadosColetados.orgao_contratante}
**Setor Requisitante:** ${dadosColetados.setor_requisitante}
**Valor Estimado:** R$ ${dadosColetados.valor_estimado?.toLocaleString('pt-BR')}
**Prazo de Execução:** ${dadosColetados.prazo_execucao} ${dadosColetados.prazo_unidade}

Elabore todas as 5 seções de gestão contratual em formato JSON, adaptadas ao contexto específico desta contratação.`;

    const response = await this.executar(mensagem);
    return this.extrairJSON(response);
  }

  protected validarResposta(resposta: any): boolean {
    return (
      resposta &&
      Array.isArray(resposta.secoes) &&
      resposta.secoes.length === 5 &&
      resposta.secoes.every((s: any) => s.id && s.titulo && s.conteudo)
    );
  }
}
