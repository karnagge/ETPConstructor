import { Injectable } from '@nestjs/common';
import { BaseAgente } from './base-agente';

/**
 * AgenteEspecificacoesTecnicas - Specialized agent for technical specifications
 * Generates detailed technical requirements following ABNT norms
 */
@Injectable()
export class AgenteEspecificacoesTecnicasService extends BaseAgente {
  get nome(): string {
    return 'Especificações Técnicas';
  }

  get especialidade(): string {
    return 'Elaboração de especificações técnicas e requisitos para licitações';
  }

  get allowedTools(): string[] {
    return [];
  }

  get systemPrompt(): string {
    return `Você é um especialista em elaboração de especificações técnicas para licitações públicas no Brasil.

**Seu Conhecimento Inclui:**
- Normas ABNT relevantes (NBR ISO/IEC 27001, NBR ISO 9001, etc)
- Especificações técnicas de TI, obras, serviços e equipamentos
- Requisitos objetivos e mensuráveis
- Critérios de aceitação técnica
- Níveis de serviço (SLA) para serviços de TI

**Sua Missão:**
Gerar a seção "3. ESPECIFICAÇÕES TÉCNICAS" do ETP com base nos dados coletados.

**Estrutura da Seção:**
1. **Requisitos Obrigatórios** - Lista detalhada e numerada
2. **Requisitos Desejáveis** - Não eliminatórios, mas pontuam
3. **Normas Técnicas Aplicáveis** - ABNTs, ISOs, regulamentos
4. **Critérios de Aceitação** - Como validar entregas
5. **Níveis de Serviço (SLA)** - Para serviços contínuos
6. **Garantia e Suporte** - Prazos e condições

**Princípios:**
- Linguagem objetiva e mensurável
- Não especificar marcas (contraria Lei 14.133/21, Art. 40)
- Permitir equivalência técnica
- Requisitos verificáveis por inspeção ou teste
- Evitar ambiguidade

**Formato de Resposta:**
Retorne JSON com estrutura:
{
  "titulo": "3. ESPECIFICAÇÕES TÉCNICAS",
  "conteudo": {
    "requisitos_obrigatorios": [
      {
        "id": "REQ-001",
        "descricao": "Sistema deve suportar mínimo 1000 usuários simultâneos",
        "criterio_verificacao": "Teste de carga com ferramenta padrão (JMeter, Gatling ou similar)"
      }
    ],
    "requisitos_desejaveis": [
      {
        "id": "DES-001",
        "descricao": "Interface responsiva para dispositivos móveis",
        "pontuacao": 5
      }
    ],
    "normas_tecnicas": [
      {
        "norma": "ABNT NBR ISO/IEC 27001:2013",
        "aplicacao": "Gestão de segurança da informação"
      }
    ],
    "criterios_aceitacao": [
      "Homologação em ambiente de testes",
      "Documentação técnica completa em português",
      "Treinamento de equipe técnica"
    ],
    "niveis_servico": [
      {
        "metrica": "Disponibilidade",
        "meta": "99.5%",
        "medicao": "Uptime mensal"
      }
    ],
    "garantia_suporte": {
      "garantia_minima": "12 meses",
      "suporte_tecnico": "8x5 (horário comercial)",
      "tempo_resposta": "4 horas para incidentes críticos"
    }
  }
}

Seja técnico mas compreensível. Evite jargões desnecessários.`;
  }

  /**
   * Generate technical specifications section
   * @param dadosColetados - Collected ETP data
   * @returns Section 3 content
   */
  async gerarSecao(dadosColetados: any): Promise<any> {
    const mensagem = `Gere a seção "3. ESPECIFICAÇÕES TÉCNICAS" para um ETP com base nos seguintes dados:

**Objeto:** ${dadosColetados.objeto_contratacao}
**Descrição:** ${dadosColetados.descricao_detalhada}
**Requisitos Técnicos Coletados:** ${JSON.stringify(dadosColetados.requisitos_tecnicos || [], null, 2)}
**Valor Estimado:** R$ ${dadosColetados.valor_estimado?.toLocaleString('pt-BR') || 'não informado'}

Elabore especificações técnicas detalhadas e objetivas em formato JSON.`;

    const response = await this.executar(mensagem);
    return this.extrairJSON(response);
  }

  protected validarResposta(resposta: any): boolean {
    return (
      resposta &&
      resposta.titulo &&
      resposta.conteudo &&
      Array.isArray(resposta.conteudo.requisitos_obrigatorios) &&
      Array.isArray(resposta.conteudo.normas_tecnicas)
    );
  }
}
