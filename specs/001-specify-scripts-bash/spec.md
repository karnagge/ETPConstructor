# Feature Specification: ETP Generator System

**Feature Branch**: `001-specify-scripts-bash`  
**Created**: 2025-10-18  
**Status**: Draft  
**Input**: Sistema web para geração automatizada de Estudos Técnicos Preliminares (ETP) para licitações públicas no Brasil, utilizando IA conversacional (Claude Sonnet 4.5) para coleta de dados e orquestração multi-agente para geração de documentos em conformidade com a legislação brasileira (Lei 8.666/93, Lei 14.133/21, IN SEGES).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Coleta Conversacional de Dados para ETP (Priority: P1)

Um servidor público precisa criar um Estudo Técnico Preliminar para uma nova licitação. Ele acessa o sistema, inicia uma conversa com o assistente de IA que faz perguntas naturais sobre o objeto da contratação, órgão, valores, prazos e justificativas. O sistema coleta todos os dados obrigatórios através de um diálogo natural, similar ao Claude Desktop, validando as respostas em tempo real.

**Why this priority**: Este é o coração do sistema. Sem a capacidade de coletar dados via conversa natural, o valor principal da aplicação (automatização via IA conversacional) não existe. É a diferença entre uma planilha glorificada e um assistente inteligente.

**Independent Test**: Pode ser testado criando um novo ETP vazio, interagindo com o chat até coletar todos os 11 campos obrigatórios (objeto, descrição, justificativa, órgão, setor, valor, prazo, unidade de prazo, etc), e verificando que o sistema indica 100% de progresso e habilita botão "Gerar ETP".

**Acceptance Scenarios**:

1. **Given** um usuário inicia novo ETP, **When** o sistema conecta via WebSocket, **Then** recebe mensagem de boas-vindas perguntando sobre o objeto da contratação
2. **Given** usuário responde "contratação de serviços de TI", **When** sistema processa mensagem, **Then** armazena dado em `objeto_contratacao` e faz próxima pergunta sobre descrição detalhada
3. **Given** usuário fornece informações incompletas, **When** sistema valida resposta, **Then** faz pergunta de esclarecimento sem avançar para próximo campo
4. **Given** 8 de 11 campos obrigatórios coletados, **When** usuário consulta progresso, **Then** vê barra indicando ~73% de conclusão
5. **Given** todos os campos obrigatórios coletados e validados, **When** sistema finaliza coleta, **Then** exibe card de confirmação com resumo dos dados e botão "Gerar ETP"

---

### User Story 2 - Geração Automatizada de Documento ETP Completo (Priority: P1)

Após confirmar os dados coletados, o usuário clica em "Gerar ETP" e o sistema orquestra múltiplos agentes especializados (validação legal, especificações técnicas, estimativa de custos, gestão contratual) para gerar um documento Word completo com todas as 9 seções obrigatórias, em conformidade com a legislação brasileira.

**Why this priority**: A geração do documento é o objetivo final do sistema. Sem ela, tudo é apenas coleta de dados sem saída tangível. O usuário precisa do arquivo DOCX/PDF para protocolar na licitação.

**Independent Test**: Pode ser testado com dados pré-populados (bypass da coleta), clicando "Gerar ETP" e verificando que: (1) barra de progresso avança por 5 fases, (2) documento DOCX é criado com 9 seções preenchidas, (3) arquivo pode ser baixado e aberto no Word/LibreOffice mostrando conteúdo formatado corretamente.

**Acceptance Scenarios**:

1. **Given** dados coletados confirmados, **When** usuário clica "Gerar ETP", **Then** sistema inicia geração e mostra progresso em 10% (Validação Inicial)
2. **Given** geração em andamento (fase 2), **When** agentes especializados trabalham em paralelo, **Then** progresso atualiza para 30% e usuário vê fase "Análise Especializada"
3. **Given** conteúdo especializado gerado, **When** sistema monta as 9 seções do documento, **Then** progresso avança para 60% (Montagem do Documento)
4. **Given** seções montadas, **When** validador legal analisa cada seção, **Then** progresso atualiza para 80% e alertas de conformidade aparecem na sidebar direita se houver
5. **Given** validação concluída sem erros críticos, **When** sistema gera arquivo DOCX, **Then** progresso chega a 100% e botões "Visualizar" e "Baixar" ficam habilitados

---

### User Story 3 - Organização por Projetos (Priority: P2)

Um coordenador de licitações gerencia múltiplas contratações simultaneamente. Ele cria projetos (ex: "Licitações TI 2025", "Infraestrutura Q1") e associa ETPs a cada projeto. A sidebar esquerda mostra hierarquia expansível de projetos com ETPs dentro, permitindo navegação rápida e organização visual com cores personalizadas por projeto.

**Why this priority**: Para usuários que criam múltiplos ETPs, a falta de organização torna o sistema caótico. Porém, um usuário casual que cria 1-2 ETPs pode sobreviver sem isso inicialmente. É essencial para adoção em larga escala, mas não bloqueia o valor básico.

**Independent Test**: Pode ser testado criando 2 projetos ("Projeto A" e "Projeto B"), criando 2 ETPs em cada projeto, e verificando que: (1) sidebar esquerda mostra os 2 projetos, (2) ao expandir cada projeto, vê os 2 ETPs correspondentes, (3) ao clicar em um ETP, carrega na área central, (4) cores dos projetos aparecem como badges nos ETPs.

**Acceptance Scenarios**:

1. **Given** usuário clica "+" no header "Projetos", **When** preenche nome e cor, **Then** novo projeto aparece na sidebar com ícone de pasta e cor selecionada
2. **Given** projeto criado, **When** usuário cria novo ETP, **Then** modal permite selecionar projeto para associação
3. **Given** 3 ETPs associados a um projeto, **When** usuário expande projeto na sidebar, **Then** vê lista dos 3 ETPs com status visual (rascunho/em geração/concluído)
4. **Given** múltiplos projetos na sidebar, **When** usuário clica em ETP de projeto colapsado, **Then** projeto se expande automaticamente e ETP fica destacado

---

### User Story 4 - Edição e Versionamento de Documento (Priority: P2)

Após receber o documento gerado, um revisor jurídico precisa ajustar algumas seções (ex: adicionar cláusula específica na gestão contratual). Ele abre o ETP concluído no editor WYSIWYG, edita a seção desejada, e o sistema salva automaticamente criando uma nova versão. Ele pode ver histórico de versões e restaurar versões anteriores se necessário.

**Why this priority**: Documentos raramente ficam perfeitos na primeira geração. A capacidade de edição é crucial para adoção, mas pode ser adicionada após o MVP funcionar (usuários podem baixar DOCX e editar localmente inicialmente).

**Independent Test**: Pode ser testado abrindo um ETP concluído, clicando na seção "Gestão Contratual", editando texto no editor TipTap, esperando 2 segundos (debounce), e verificando que: (1) badge "Salvo" aparece, (2) GET /api/documentos/:id/versoes retorna versão 2, (3) histórico mostra diff entre versões.

**Acceptance Scenarios**:

1. **Given** ETP concluído aberto, **When** usuário clica em seção "Especificações Técnicas", **Then** editor TipTap carrega com conteúdo da seção e toolbar de formatação
2. **Given** editor aberto, **When** usuário adiciona novo parágrafo e aguarda 2 segundos, **Then** sistema salva automaticamente e mostra badge "Salvo às 14:35"
3. **Given** edição salva, **When** sistema persiste alteração, **Then** cria nova entrada em VersaoDocumento com numeroVersao incrementado
4. **Given** documento com 3 versões, **When** usuário clica "Ver versões" na sidebar, **Then** modal lista as 3 versões com timestamp e descrição de alterações
5. **Given** visualizando histórico, **When** usuário seleciona versão 1 e clica "Restaurar", **Then** conteúdo volta para estado da versão 1 e cria versão 4 (rollback)

---

### User Story 5 - Validação Legal Contínua (Priority: P3)

Durante todo o processo, o sistema valida continuamente a conformidade com legislação brasileira (Lei 8.666/93, Lei 14.133/21, IN SEGES). Na sidebar direita, um painel "Conformidade Legal" mostra percentual de aderência, lista alertas (ex: "valor estimado requer 3 cotações para essa modalidade") e erros críticos que bloqueiam geração.

**Why this priority**: A validação legal adiciona enorme valor, mas o sistema ainda é útil sem ela (geraria documentos que precisariam revisão manual legal). É um diferencial competitivo, não um bloqueador para MVP.

**Independent Test**: Pode ser testado fornecendo dados com inconsistência legal (ex: valor de R$ 500.000 com modalidade "convite" que tem teto de R$ 330.000), e verificando que: (1) sidebar direita mostra alerta "Modalidade incompatível com valor estimado", (2) conformidade cai para <80%, (3) fundamentação legal (Art. X da Lei Y) aparece no alerta.

**Acceptance Scenarios**:

1. **Given** usuário informa valor estimado de R$ 600.000, **When** informa modalidade "convite", **Then** validador legal detecta inconsistência e emite alerta referenciando Lei 14.133/21 Art. 75
2. **Given** dados completos fornecidos, **When** sistema valida antes da geração, **Then** sidebar direita mostra percentual de conformidade (ex: 95%) com barra de progresso verde
3. **Given** 2 alertas e 0 erros, **When** usuário expande painel "Conformidade Legal", **Then** vê lista detalhada dos alertas com badge "Atenção" e fundamentação legal
4. **Given** 1 erro crítico (ex: prazo de execução inválido), **When** usuário tenta gerar documento, **Then** botão "Gerar ETP" fica desabilitado e erro aparece destacado em vermelho

---

### Edge Cases

- **Desconexão WebSocket durante coleta**: Sistema deve detectar desconexão, mostrar indicador visual, tentar reconectar automaticamente por 30s, e se falhar, permitir que usuário salve dados coletados localmente (localStorage) e retome sessão após reconexão.
- **Claude API timeout/erro durante geração**: Se agente especializado falhar (ex: erro 500 da API), sistema deve pausar geração, notificar usuário com mensagem clara, e permitir retry sem perder dados já processados. Se falhar 3x consecutivas, permitir gerar documento com seções parciais + marcador "[ERRO: seção não concluída]".
- **Dados ambíguos/contraditórios**: Se usuário informar "prazo de 6 meses" em texto livre mas depois disser "na verdade são 180 dias", validador deve detectar inconsistência (6 meses ≠ 180 dias exatos) e pedir clarificação explícita.
- **Edição concorrente**: Se mesmo documento for editado simultaneamente por 2 usuários (cenário multi-usuário futuro), sistema deve implementar lock otimista e notificar segundo usuário que versão mudou, oferecendo opção de merge manual ou sobrescrever.
- **Upload de documento muito grande (PDF referência)**: Se usuário tentar anexar arquivo de referência >10MB (ex: edital anterior), sistema deve rejeitar com mensagem clara sobre limite, sugerindo compressão ou link externo.
- **Legislação desatualizada**: Sistema deve ter mecanismo para marcar regras legais com data de vigência e alertar usuário se base de validação está >6 meses desatualizada, sugerindo revisão manual legal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE iniciar conexão WebSocket automaticamente ao criar novo ETP e enviar mensagem de boas-vindas em até 2 segundos
- **FR-002**: Sistema DEVE coletar obrigatoriamente os seguintes campos: objeto_contratacao, descricao_detalhada, justificativa_necessidade, orgao_contratante, setor_requisitante, valor_estimado, prazo_execucao, prazo_unidade (11 campos totais conforme spec técnica)
- **FR-003**: Sistema DEVE validar cada resposta do usuário antes de considerar campo como "coletado" (ex: valor_estimado deve ser número positivo, prazo_unidade deve ser "dias", "meses" ou "anos")
- **FR-004**: Sistema DEVE exibir progresso de coleta como percentual (0-100%) baseado em campos obrigatórios preenchidos e validados
- **FR-005**: Sistema DEVE gerar documento somente após todos os campos obrigatórios estarem coletados e validados (progresso = 100%)
- **FR-006**: Sistema DEVE orquestrar 4 agentes especializados durante geração: Validador Legal, Especificações Técnicas, Estimativa de Custos, Gestão Contratual
- **FR-007**: Sistema DEVE executar agentes de Especificações, Custos e Gestão em paralelo (Promise.all) para otimizar tempo de geração
- **FR-008**: Sistema DEVE estruturar documento gerado em exatamente 9 seções: (1) Definição do Objeto, (2) Justificativa, (3) Especificações Técnicas, (4) Estimativa de Custos, (5) Gestão e Fiscalização, (6) Obrigações Contratante, (7) Obrigações Contratada, (8) Critérios de Aceitação, (9) Sanções Administrativas
- **FR-009**: Sistema DEVE gerar arquivo DOCX com formatação padronizada: Arial, cabeçalho centralizado, margens 2.5cm, numeração de páginas, sumário
- **FR-010**: Sistema DEVE permitir download de documento em formatos DOCX e PDF
- **FR-011**: Sistema DEVE persistir dados coletados, conteúdo das seções e metadata (timestamps, status) em banco PostgreSQL via Prisma ORM
- **FR-012**: Sistema DEVE criar nova versão do documento (VersaoDocumento) a cada edição de seção, incrementando numeroVersao sequencialmente
- **FR-013**: Sistema DEVE implementar auto-save com debounce de 2 segundos após última modificação no editor
- **FR-014**: Usuários DEVEM poder criar projetos com nome obrigatório, descrição opcional e cor opcional (padrão #3b82f6)
- **FR-015**: Usuários DEVEM poder associar ETP a projeto durante criação ou posteriormente via drag-and-drop (fase futura) ou menu de contexto
- **FR-016**: Sistema DEVE exibir estrutura hierárquica de projetos na sidebar esquerda com indicadores visuais de status por ETP (rascunho=Circle cinza, em_geracao=Clock azul pulsando, concluido=CheckCircle2 verde)
- **FR-017**: Sistema DEVE validar conformidade legal de dados coletados antes de iniciar geração, bloqueando se houver erros críticos
- **FR-018**: Sistema DEVE calcular e exibir percentual de conformidade legal (0-100%) baseado em regras validadas vs. total de regras aplicáveis
- **FR-019**: Sistema DEVE listar alertas e erros legais na sidebar direita com fundamentação (referência a artigos de lei específicos)
- **FR-020**: Sistema DEVE permitir visualização de histórico completo de versões com diff resumido das alterações entre versões consecutivas

### Key Entities

- **Usuario**: Representa servidor público ou coordenador que usa o sistema. Atributos: email (único), nome, data de criação. Relacionamentos: possui múltiplos Projetos e Documentos.

- **Projeto**: Agrupa ETPs relacionados para organização. Atributos: uuid (identificador público), nome, descrição (opcional), cor (hex, padrão azul), timestamps. Relacionamentos: pertence a Usuario, contém múltiplos Documentos.

- **Documento**: Representa um ETP em qualquer estágio. Atributos: uuid, titulo, tipo (padrão "ETP"), status (enum: rascunho/em_geracao/concluido/arquivado), dadosColetados (JSON com 11+ campos), conteudoSecoes (JSON com 9 seções), caminhos de arquivos DOCX/PDF, timestamps (criado/atualizado/concluído). Relacionamentos: pertence a Usuario, pode pertencer a Projeto, possui múltiplas VersaoDocumento e ValidacaoLegal.

- **VersaoDocumento**: Snapshot de documento em momento específico. Atributos: numeroVersao (inteiro sequencial por documento), conteudoSecoes (JSON completo), alteracoes (texto descritivo do diff), timestamp. Relacionamentos: pertence a Documento (cascade delete).

- **ValidacaoLegal**: Registro de validação de regra legal em seção específica. Atributos: secaoId (string identificando seção validada), regra (descrição da regra legal), valido (boolean), observacoes (texto opcional), timestamp. Relacionamentos: pertence a Documento (cascade delete).

- **DadosColetados** (embedded no Documento): Estrutura JSON contendo campos: objeto_contratacao (string), descricao_detalhada (string), justificativa_necessidade (string), orgao_contratante (string), setor_requisitante (string), modalidade_licitacao (string, opcional), valor_estimado (number), prazo_execucao (number), prazo_unidade (enum: dias/meses/anos), requisitos_tecnicos (array de strings, opcional), criterios_sustentabilidade (array de strings, opcional).

- **ConteudoSecoes** (embedded no Documento): Estrutura JSON mapeando secaoId (string) para objeto contendo: titulo (string), conteudo (objeto ou array dependendo da seção). Exemplo: '3_especificacoes' → { titulo: "3. ESPECIFICAÇÕES TÉCNICAS", conteudo: { requisitosObrigatorios: [...], normasTecnicas: [...] } }.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários conseguem criar um ETP completo desde início da conversa até download do documento DOCX em menos de 2 horas (redução de ~20h manuais para ~2h automatizadas)
- **SC-002**: Sistema coleta todos os 11 campos obrigatórios através de no máximo 15 interações de chat (média), sem necessidade de formulários ou telas múltiplas
- **SC-003**: 95% dos documentos gerados passam na validação legal inicial sem erros críticos (alertas são aceitáveis)
- **SC-004**: Documentos DOCX gerados abrem corretamente em Microsoft Word e LibreOffice Writer sem problemas de formatação em 100% dos casos testados
- **SC-005**: Sistema suporta pelo menos 10 usuários simultâneos gerando documentos (10 conexões WebSocket concorrentes) sem degradação de performance (tempo de resposta do chat <3s)
- **SC-006**: Usuários conseguem organizar 20+ ETPs em projetos e localizar um ETP específico em menos de 10 segundos usando sidebar ou busca
- **SC-007**: Edições em documento são persistidas com sucesso (sem perda de dados) em 99.9% das tentativas de save
- **SC-008**: Tempo de geração completa de documento (fase 1 a fase 5) não excede 3 minutos para conjunto típico de dados (baseline: serviços de TI com valor ~R$ 100.000)
- **SC-009**: Sistema mantém conformidade com legislação brasileira vigente, sendo capaz de detectar e alertar sobre pelo menos 15 regras legais críticas (modalidade vs valor, prazos, obrigatoriedade de especificações técnicas, etc)
- **SC-010**: Taxa de conclusão de tarefas (criar ETP do zero até download) atinge 85% entre usuários testadores (15% de abandono aceitável por complexidade inerente do domínio)

## Assumptions

- **A-001**: Usuários têm conhecimento básico sobre licitações públicas e legislação brasileira (não é ferramenta para leigos absolutos)
- **A-002**: Conexão de internet estável é necessária para operação (aplicação web que depende de WebSocket e API externa Claude)
- **A-003**: Anthropic Claude API está disponível e acessível no Brasil (sem bloqueios geográficos)
- **A-004**: Custo de API da Anthropic é viável para volume esperado (assumindo ~50-100 requisições por ETP gerado)
- **A-005**: Formato DOCX do Microsoft Word é padrão aceitável para protocolos de licitação (alternativa PDF também disponível)
- **A-006**: Legislação brasileira de licitações não sofrerá mudanças drásticas no curto prazo (sistema precisa de atualização manual para novas leis)
- **A-007**: Ambiente de produção terá Node.js 20+, PostgreSQL 15, Redis 7 disponíveis (stack mínima)
- **A-008**: Autenticação de usuários será implementada em fase futura (MVP pode iniciar com usuário mockado ou autenticação básica)
- **A-009**: Armazenamento de arquivos será no filesystem local inicialmente (migração para S3/objeto storage em fase de escala)
- **A-010**: Interface será em português brasileiro exclusivamente (sem internacionalização no MVP)

## Dependencies

- **D-001**: Acesso à API da Anthropic (Claude Sonnet 4.5) com chave válida e quota suficiente
- **D-002**: Infraestrutura Docker Compose funcional para desenvolvimento (PostgreSQL, Redis containers)
- **D-003**: Conhecimento especializado em legislação de licitações para validação das regras legais implementadas nos agentes
- **D-004**: Base de dados legal atualizada contendo artigos específicos da Lei 8.666/93, Lei 14.133/21 e IN SEGES para fundamentação
- **D-005**: Templates de documento ETP em conformidade com padrões oficiais (TCU, CGU) para estruturação das seções

## Out of Scope

- **OS-001**: Autenticação multi-fator e gestão avançada de usuários (apenas autenticação básica ou mock no MVP)
- **OS-002**: Colaboração em tempo real entre múltiplos usuários no mesmo documento (edição concorrente)
- **OS-003**: Integração com sistemas governamentais externos (ComprasNet, PNCP, SIASG)
- **OS-004**: Geração de outros tipos de documentos além de ETP (ex: Termo de Referência completo, Edital)
- **OS-005**: Importação automática de dados de fontes externas (APIs de órgãos, bancos de preços)
- **OS-006**: Internacionalização (suporte a outros idiomas além de português brasileiro)
- **OS-007**: Aplicativo mobile nativo (apenas web responsivo)
- **OS-008**: Workflow de aprovação multi-níveis (submissão para revisor, aprovador, etc)
- **OS-009**: Assinatura digital de documentos integrada (DOCX gerado pode ser assinado externamente)
- **OS-010**: Analytics avançado e dashboards de métricas agregadas (foco em funcionalidade core)

