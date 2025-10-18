# Tasks: ETP Generator System

**Input**: Design documents from `/specs/001-specify-scripts-bash/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: OPTIONAL - Not included in this implementation plan as tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Monorepo structure**: `apps/backend/src/`, `apps/web/src/`, `packages/shared-types/src/`
- Paths shown below follow Turborepo monorepo structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic monorepo structure

- [X] T001 Create monorepo structure with Turborepo, pnpm workspace, and base package.json files
- [X] T002 Initialize backend NestJS application in apps/backend with dependencies (NestJS 10, Prisma, Socket.IO, @anthropic-ai/claude-agent-sdk, docx)
- [X] T003 Initialize frontend Vite application in apps/web with dependencies (React 18, Tailwind CSS, shadcn/ui, Zustand, TipTap, socket.io-client)
- [X] T004 [P] Create shared-types package in packages/shared-types with TypeScript configuration
- [X] T005 [P] Create config package in packages/config with ESLint, Prettier, and tsconfig shared configs
- [X] T006 [P] Setup docker-compose.yml with PostgreSQL 15 and Redis 7 containers
- [X] T007 [P] Create .claude/CLAUDE.md with project context for Claude Agent SDK
- [X] T008 [P] Create .claude/settings.json with SDK configuration (hooks, MCP servers)
- [X] T009 Configure Turborepo pipeline in turbo.json for dev, build, test, and lint tasks
- [X] T010 [P] Create .github/copilot-instructions.md with development guidelines (already exists, update if needed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Define Prisma schema in apps/backend/src/prisma/schema.prisma with 5 entities (Usuario, Projeto, Documento, VersaoDocumento, ValidacaoLegal)
- [X] T012 Generate initial Prisma migration and apply to PostgreSQL database
- [X] T013 Create seed script in apps/backend/src/prisma/seed.ts with test user and project
- [X] T014 [P] Define shared TypeScript types in packages/shared-types/src/documento.types.ts (DadosColetados, ConteudoSecoes interfaces)
- [X] T015 [P] Define shared TypeScript types in packages/shared-types/src/projeto.types.ts (Projeto interface)
- [X] T016 [P] Define shared TypeScript types in packages/shared-types/src/validacao.types.ts (ValidacaoLegal interface)
- [X] T017 [P] Export all shared types from packages/shared-types/src/index.ts
- [X] T018 Create BaseAgente abstract class in apps/backend/src/agentes/base-agente.ts wrapping Claude Agent SDK
- [X] T019 Setup NestJS main.ts in apps/backend/src/main.ts with CORS, Socket.IO adapter, and global pipes
- [X] T020 [P] Configure Redis connection service in apps/backend/src/redis/redis.service.ts for session management
- [X] T021 [P] Setup environment variable validation in apps/backend/src/config/env.validation.ts (DATABASE_URL, ANTHROPIC_API_KEY, etc.)
- [X] T022 Create global error handler filter in apps/backend/src/common/filters/http-exception.filter.ts with standardized error format
- [X] T023 [P] Setup Tailwind CSS configuration in apps/web/tailwind.config.js with custom color palette (Claude Desktop-inspired)
- [X] T024 [P] Install and configure shadcn/ui components (Button, Dialog, DropdownMenu, etc.) in apps/web/src/components/ui/ (will be added on-demand during Phase 3)
- [X] T025 Create socket.io client service in apps/web/src/services/socket.service.ts with reconnection handling
- [X] T026 [P] Create REST API client service in apps/web/src/services/api.service.ts with fetch wrapper
- [X] T027 Create main App layout component in apps/web/src/App.tsx with three-column structure (left sidebar, main content, right sidebar)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Coleta Conversacional de Dados para ETP (Priority: P1) 🎯 MVP

**Goal**: Enable users to create an ETP through natural conversation with AI assistant, collecting all 11 mandatory fields with real-time validation and progress tracking.

**Independent Test**: Create a new blank ETP, interact with chat until all 11 mandatory fields are collected (objeto, descrição, justificativa, órgão, setor, valor, prazo, unidade de prazo, etc), verify system shows 100% progress and enables "Gerar ETP" button.

### Implementation for User Story 1

#### Backend: AI Agents

- [ ] T028 [P] [US1] Implement AgenteColetorConversacional in apps/backend/src/agentes/agente-coletor-conversacional.service.ts extending BaseAgente
- [ ] T029 [P] [US1] Write system prompt for AgenteColetorConversacional with 11 field collection instructions
- [ ] T030 [P] [US1] Implement response parsing logic with extrairJSON() method in AgenteColetorConversacional
- [ ] T031 [P] [US1] Implement field validation logic for each of the 11 mandatory fields in AgenteColetorConversacional

#### Backend: Chat Service & Gateway

- [ ] T032 [US1] Create ChatGateway in apps/backend/src/chat/chat.gateway.ts with Socket.IO decorators
- [ ] T033 [US1] Implement ChatService in apps/backend/src/chat/chat.service.ts for session state management with Redis
- [ ] T034 [US1] Implement 'entrar_documento' WebSocket event handler in ChatGateway (joins room, loads session)
- [ ] T035 [US1] Implement 'iniciar_coleta' WebSocket event handler in ChatGateway (starts conversation, sends welcome message)
- [ ] T036 [US1] Implement 'enviar_mensagem' WebSocket event handler in ChatGateway (processes user message, updates dadosColetados)
- [ ] T037 [US1] Implement progress calculation logic (camposColetados / 11 * 100) in ChatService
- [ ] T038 [US1] Implement 'campo_coletado' event emission after successful field validation in ChatService
- [ ] T039 [US1] Implement 'progresso_coleta' event emission with campos faltantes tracking in ChatService

#### Backend: Documents API

- [ ] T040 [P] [US1] Create DocumentosController in apps/backend/src/documentos/documentos.controller.ts with REST endpoints
- [ ] T041 [P] [US1] Create DocumentosService in apps/backend/src/documentos/documentos.service.ts with business logic
- [ ] T042 [P] [US1] Implement POST /api/documentos endpoint (create new ETP) in DocumentosController
- [ ] T043 [P] [US1] Implement GET /api/documentos/:uuid endpoint (fetch single document) in DocumentosController
- [ ] T044 [P] [US1] Implement GET /api/documentos endpoint with query filters (usuarioId, projetoId, status) in DocumentosController
- [ ] T045 [P] [US1] Create Zod validation schemas for documento DTOs in apps/backend/src/documentos/dto/create-documento.dto.ts
- [ ] T046 [P] [US1] Implement PATCH /api/documentos/:uuid endpoint (update dadosColetados) in DocumentosController

#### Frontend: Chat Interface

- [ ] T047 [P] [US1] Create ChatWindow component in apps/web/src/components/chat/ChatWindow.tsx with message list and input area
- [ ] T048 [P] [US1] Create MessageList component in apps/web/src/components/chat/MessageList.tsx with auto-scroll
- [ ] T049 [P] [US1] Create MessageBubble component in apps/web/src/components/chat/MessageBubble.tsx with user/assistant styling
- [ ] T050 [P] [US1] Create InputArea component in apps/web/src/components/chat/InputArea.tsx with send button and shortcuts
- [ ] T051 [P] [US1] Create ProgressBar component in apps/web/src/components/chat/ProgressBar.tsx showing collection progress (0-100%)
- [ ] T052 [US1] Create chat Zustand store in apps/web/src/stores/chat.store.ts managing messages, progress, and session state
- [ ] T053 [US1] Implement socket event listeners for 'mensagem_assistente', 'campo_coletado', 'progresso_coleta' in chat store
- [ ] T054 [US1] Connect ChatWindow to socket service, emit 'enviar_mensagem' on user input
- [ ] T055 [US1] Implement connection status indicator (connected/reconnecting/disconnected) in ChatWindow header
- [ ] T056 [US1] Add "Confirmar Dados" button that appears when progress reaches 100% in ChatWindow

#### Frontend: Document Management

- [ ] T057 [P] [US1] Create documents Zustand store in apps/web/src/stores/documents.store.ts managing documento list and active document
- [ ] T058 [P] [US1] Implement fetchDocumentos(), createDocumento(), updateDocumento() actions in documents store using api.service
- [ ] T059 [US1] Create Home page component in apps/web/src/pages/Home.tsx with chat interface for active document
- [ ] T060 [US1] Implement "Novo ETP" button in Home page that creates document and starts collection

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create ETP and collect data via conversation

---

## Phase 4: User Story 2 - Geração Automatizada de Documento ETP Completo (Priority: P1)

**Goal**: After data collection, orchestrate 5 specialized AI agents to generate complete ETP document (9 sections) in DOCX/PDF format with real-time progress tracking.

**Independent Test**: Use pre-populated dadosColetados (bypass collection), click "Gerar ETP", verify: (1) progress bar advances through 5 phases, (2) DOCX file created with 9 sections, (3) file downloads and opens correctly in Word/LibreOffice.

### Implementation for User Story 2

#### Backend: Specialized AI Agents

- [ ] T061 [P] [US2] Implement AgenteValidadorLegal in apps/backend/src/agentes/agente-validador-legal.service.ts extending BaseAgente
- [ ] T062 [P] [US2] Implement AgenteEspecificacoesTecnicas in apps/backend/src/agentes/agente-especificacoes-tecnicas.service.ts extending BaseAgente
- [ ] T063 [P] [US2] Implement AgenteEstimativaCustos in apps/backend/src/agentes/agente-estimativa-custos.service.ts extending BaseAgente
- [ ] T064 [P] [US2] Implement AgenteGestaoContratual in apps/backend/src/agentes/agente-gestao-contratual.service.ts extending BaseAgente
- [ ] T065 [P] [US2] Write specialized system prompts for each of the 4 agents with JSON output format instructions

#### Backend: Multi-Agent Orchestration

- [ ] T066 [US2] Create OrquestradorMultiAgenteService in apps/backend/src/agentes/orquestrador-multi-agente.service.ts
- [ ] T067 [US2] Implement gerarSecoes() method with Promise.allSettled for parallel agent execution (Especificacoes, Custos, Gestao)
- [ ] T068 [US2] Implement graceful error handling for individual agent failures in OrquestradorMultiAgenteService
- [ ] T069 [US2] Implement progress emission at each phase (10%, 30%, 60%, 80%, 90%, 100%) via ChatGateway
- [ ] T070 [US2] Implement 'secao_gerada' event emission for each completed section

#### Backend: Legal Validation

- [ ] T071 [P] [US2] Create ValidacaoLegalService in apps/backend/src/validacao/validacao-legal.service.ts
- [ ] T072 [P] [US2] Define legal validation rules in apps/backend/src/validacao/regras-legais.config.ts (15+ rules as pure functions)
- [ ] T073 [US2] Implement validarDados() method executing all rules and persisting ValidacaoLegal entries
- [ ] T074 [US2] Implement calculateCompliance() method computing percentual de conformidade
- [ ] T075 [US2] Implement critical error detection blocking generation if erros críticos exist
- [ ] T076 [US2] Implement 'validacao_completa' event emission with resumo (percentual, alertas, erros) in ChatGateway

#### Backend: Document Generation

- [ ] T077 [P] [US2] Create GeracaoService in apps/backend/src/geracao/geracao.service.ts coordinating full generation flow
- [ ] T078 [P] [US2] Create DocxBuilderService in apps/backend/src/geracao/docx-builder.service.ts using docx library
- [ ] T079 [US2] Implement gerarDocumento() method assembling 9 sections with proper Word formatting (headers, margins, numbering)
- [ ] T080 [US2] Implement criarSecao1() through criarSecao9() methods in DocxBuilderService for each ETP section
- [ ] T081 [US2] Implement DOCX to PDF conversion (optional, or serve only DOCX for MVP)
- [ ] T082 [US2] Implement file persistence to apps/backend/uploads/documents/ directory with UUID-based naming
- [ ] T083 [US2] Update Documento entity with caminhoDocx, caminhoPdf, concluidoEm after successful generation

#### Backend: Generation API & WebSocket

- [ ] T084 [US2] Implement POST /api/documentos/:uuid/gerar endpoint in DocumentosController
- [ ] T085 [US2] Validate pre-requisites (11 campos coletados, sem erros críticos) before starting generation
- [ ] T086 [US2] Update documento status to EM_GERACAO in database before calling OrquestradorMultiAgenteService
- [ ] T087 [US2] Implement 'gerar_documento' WebSocket event handler in ChatGateway calling GeracaoService
- [ ] T088 [US2] Implement 'geracao_iniciada' event emission after validation passes
- [ ] T089 [US2] Implement 'geracao_completa' event emission with file paths and tempo de geração
- [ ] T090 [US2] Implement GET /api/documentos/:uuid/download/docx endpoint for file download with proper Content-Disposition headers
- [ ] T091 [P] [US2] Implement GET /api/documentos/:uuid/download/pdf endpoint (if PDF conversion implemented)

#### Frontend: Generation UI

- [ ] T092 [P] [US2] Create GenerationProgress component in apps/web/src/components/generation/ProgressBar.tsx with 5-phase visualization
- [ ] T093 [P] [US2] Create PhaseIndicator component in apps/web/src/components/generation/PhaseIndicator.tsx showing current phase name
- [ ] T094 [P] [US2] Create SectionChecklist component in apps/web/src/components/generation/SectionChecklist.tsx marking completed sections (9 items)
- [ ] T095 [US2] Implement socket event listeners for 'geracao_iniciada', 'progresso_geracao', 'secao_gerada', 'geracao_completa' in documents store
- [ ] T096 [US2] Create GenerationModal component in apps/web/src/components/generation/GenerationModal.tsx showing real-time progress
- [ ] T097 [US2] Implement "Gerar ETP" button click handler emitting 'gerar_documento' socket event
- [ ] T098 [US2] Show GenerationModal automatically when generation starts (on 'geracao_iniciada' event)
- [ ] T099 [US2] Display download buttons (DOCX, PDF) after 'geracao_completa' event with proper file download links
- [ ] T100 [US2] Handle generation errors gracefully showing error message and allowing retry

**Checkpoint**: At this point, User Story 2 is complete - documents can be generated with full multi-agent orchestration

---

## Phase 5: User Story 3 - Organização por Projetos (Priority: P2)

**Goal**: Allow users to organize multiple ETPs into projects with color-coded hierarchical visualization in left sidebar for quick navigation.

**Independent Test**: Create 2 projects ("Projeto A" and "Projeto B"), create 2 ETPs in each, verify: (1) sidebar shows 2 projects, (2) expanding shows 2 ETPs per project, (3) clicking ETP loads in center area, (4) project colors appear as badges.

### Implementation for User Story 3

#### Backend: Projects API

- [ ] T101 [P] [US3] Create ProjetosController in apps/backend/src/projetos/projetos.controller.ts with REST endpoints
- [ ] T102 [P] [US3] Create ProjetosService in apps/backend/src/projetos/projetos.service.ts with business logic
- [ ] T103 [P] [US3] Implement POST /api/projetos endpoint (create project) in ProjetosController
- [ ] T104 [P] [US3] Implement GET /api/projetos endpoint with usuarioId filter in ProjetosController
- [ ] T105 [P] [US3] Implement GET /api/projetos/:uuid endpoint (fetch single project with documents) in ProjetosController
- [ ] T106 [P] [US3] Implement PATCH /api/projetos/:uuid endpoint (update nome, cor, descricao) in ProjetosController
- [ ] T107 [P] [US3] Implement DELETE /api/projetos/:uuid endpoint (hard delete, SET NULL on documentos) in ProjetosController
- [ ] T108 [P] [US3] Create Zod validation schemas for projeto DTOs in apps/backend/src/projetos/dto/create-projeto.dto.ts
- [ ] T109 [US3] Add projetoId association logic to DocumentosService.create() and update() methods

#### Frontend: Sidebar Project Tree

- [ ] T110 [P] [US3] Create projects Zustand store in apps/web/src/stores/projects.store.ts managing project list and expanded state
- [ ] T111 [P] [US3] Implement fetchProjetos(), createProjeto(), updateProjeto(), deleteProjeto() actions in projects store
- [ ] T112 [P] [US3] Create LeftSidebar component in apps/web/src/components/sidebar/LeftSidebar.tsx with collapsible structure
- [ ] T113 [P] [US3] Create ProjectTree component in apps/web/src/components/sidebar/ProjectTree.tsx rendering hierarchical list
- [ ] T114 [P] [US3] Create ProjectItem component in apps/web/src/components/sidebar/ProjectItem.tsx with expand/collapse toggle
- [ ] T115 [P] [US3] Create DocumentItem component in apps/web/src/components/sidebar/DocumentItem.tsx with status icon (Circle, Clock, CheckCircle2)
- [ ] T116 [US3] Implement project color badge rendering using Tailwind dynamic colors
- [ ] T117 [US3] Implement expand/collapse animation using Tailwind transitions
- [ ] T118 [US3] Add "+" button in sidebar header opening CreateProjectDialog
- [ ] T119 [US3] Create CreateProjectDialog component in apps/web/src/components/sidebar/CreateProjectDialog.tsx with nome, cor, descricao fields
- [ ] T120 [US3] Implement color picker in CreateProjectDialog using shadcn Popover + color swatches
- [ ] T121 [US3] Connect DocumentItem click handler to load documento in main content area
- [ ] T122 [US3] Add project selector dropdown to "Novo ETP" modal for associating document to project

**Checkpoint**: User Story 3 complete - projects enable organization of multiple ETPs

---

## Phase 6: User Story 4 - Edição e Versionamento de Documento (Priority: P2)

**Goal**: Enable editing of generated ETP sections with WYSIWYG editor (TipTap), automatic versioning on save, and ability to restore previous versions.

**Independent Test**: Open completed ETP, click "Gestão Contratual" section, edit text in TipTap editor, wait 2 seconds (debounce), verify: (1) "Salvo" badge appears, (2) GET /api/documentos/:id/versoes returns version 2, (3) history shows diff.

### Implementation for User Story 4

#### Backend: Versioning Logic

- [ ] T123 [P] [US4] Create VersoesController in apps/backend/src/documentos/versoes.controller.ts (nested under documentos)
- [ ] T124 [P] [US4] Create VersoesService in apps/backend/src/documentos/versoes.service.ts handling version CRUD
- [ ] T125 [US4] Implement createVersion() method auto-incrementing numeroVersao (MAX + 1) in VersoesService
- [ ] T126 [US4] Implement version creation trigger when conteudoSecoes updated via PATCH /api/documentos/:uuid
- [ ] T127 [US4] Implement GET /api/documentos/:uuid/versoes endpoint listing all versions ordered by numeroVersao DESC
- [ ] T128 [US4] Implement GET /api/documentos/:uuid/versoes/:numeroVersao endpoint fetching specific version
- [ ] T129 [US4] Implement POST /api/documentos/:uuid/versoes/:numeroVersao/restaurar endpoint creating new version with old content
- [ ] T130 [US4] Implement generateDiff() utility method comparing two conteudoSecoes JSONs and generating alteracoes text

#### Backend: Section Editing WebSocket

- [ ] T131 [US4] Implement 'editar_secao' WebSocket event handler in ChatGateway with 2-second debounce
- [ ] T132 [US4] Update Documento.conteudoSecoes[secaoId] in database after debounce period
- [ ] T133 [US4] Create new VersaoDocumento entry after successful save
- [ ] T134 [US4] Emit 'secao_salva' event with numeroVersao and timestamp back to client

#### Frontend: Document Editor

- [ ] T135 [P] [US4] Create DocumentEditor component in apps/web/src/components/editor/DocumentEditor.tsx using TipTap React
- [ ] T136 [P] [US4] Configure TipTap extensions (StarterKit, Bold, Italic, BulletList, OrderedList, Heading)
- [ ] T137 [P] [US4] Create EditorToolbar component in apps/web/src/components/editor/EditorToolbar.tsx with formatting buttons
- [ ] T138 [P] [US4] Create SectionSelector component in apps/web/src/components/editor/SectionSelector.tsx showing 9 sections
- [ ] T139 [US4] Implement onChange debounce (2 seconds) before emitting 'editar_secao' socket event
- [ ] T140 [US4] Display "Salvo às HH:MM" badge after receiving 'secao_salva' event
- [ ] T141 [US4] Create DocumentView page in apps/web/src/pages/DocumentView.tsx with split view (sections list + editor)
- [ ] T142 [US4] Load documento.conteudoSecoes[secaoId] into TipTap editor when section selected

#### Frontend: Version History

- [ ] T143 [P] [US4] Create VersionHistory component in apps/web/src/components/editor/VersionHistory.tsx modal listing versions
- [ ] T144 [P] [US4] Create VersionItem component in apps/web/src/components/editor/VersionItem.tsx showing numeroVersao, timestamp, alteracoes
- [ ] T145 [US4] Implement fetchVersions() action in documents store calling GET /api/documentos/:uuid/versoes
- [ ] T146 [US4] Add "Ver versões" button in DocumentView toolbar opening VersionHistory modal
- [ ] T147 [US4] Implement "Restaurar" button in VersionItem calling POST /api/documentos/:uuid/versoes/:numeroVersao/restaurar
- [ ] T148 [US4] Show confirmation dialog before restoring version (warns it creates new version, not overwrite)
- [ ] T149 [US4] Reload documento after successful restoration showing restored content in editor

**Checkpoint**: User Story 4 complete - documents can be edited with full version control

---

## Phase 7: User Story 5 - Validação Legal Contínua (Priority: P3)

**Goal**: Display real-time legal compliance panel in right sidebar showing conformidade percentage, alerts, critical errors, and legal references (Lei/Artigo).

**Independent Test**: Provide data with legal inconsistency (e.g., R$ 500.000 with "convite" modalidade exceeding R$ 330.000 limit), verify: (1) right sidebar shows alert "Modalidade incompatível", (2) compliance drops <80%, (3) legal reference (Art. X da Lei Y) appears in alert.

### Implementation for User Story 5

#### Backend: Enhanced Legal Validation

- [ ] T150 [P] [US5] Add 15+ legal validation rules to regras-legais.config.ts covering Lei 8.666/93, Lei 14.133/21, IN SEGES
- [ ] T151 [P] [US5] Mark critical rules (e.g., valor_modalidade, prazo_minimo) that block generation in regras-legais.config.ts
- [ ] T152 [US5] Implement ValidacoesController in apps/backend/src/validacao/validacoes.controller.ts (nested under documentos)
- [ ] T153 [US5] Implement GET /api/documentos/:uuid/validacoes endpoint with filters (secaoId, valido, latest)
- [ ] T154 [US5] Implement POST /api/documentos/:uuid/validacoes endpoint for manual re-validation
- [ ] T155 [US5] Add 'latest' query logic filtering only most recent ValidacaoLegal per (documentoId, secaoId, regra)
- [ ] T156 [US5] Return resumo object with totalRegras, regrasValidas, percentualConformidade, errosCriticos, alertas
- [ ] T157 [US5] Implement section-level validation called by agents during generation (validates each section's conteudo)
- [ ] T158 [US5] Emit 'alerta_secao' WebSocket event when validation detects issues during generation

#### Frontend: Compliance Panel

- [ ] T159 [P] [US5] Create RightSidebar component in apps/web/src/components/sidebar/RightSidebar.tsx with collapsible compliance panel
- [ ] T160 [P] [US5] Create CompliancePanel component in apps/web/src/components/compliance/CompliancePanel.tsx showing percentual gauge
- [ ] T161 [P] [US5] Create AlertList component in apps/web/src/components/compliance/AlertList.tsx rendering alertas and erros
- [ ] T162 [P] [US5] Create AlertItem component in apps/web/src/components/compliance/AlertItem.tsx with badge (Atenção/Erro Crítico)
- [ ] T163 [US5] Implement fetchValidacoes() action in documents store calling GET /api/documentos/:uuid/validacoes
- [ ] T164 [US5] Display fundamentacao legal (Lei X, Art. Y) in AlertItem tooltip or expandable section
- [ ] T165 [US5] Add socket listener for 'validacao_completa' event updating compliance panel after data confirmation
- [ ] T166 [US5] Add socket listener for 'alerta_secao' event appending real-time alerts during generation
- [ ] T167 [US5] Disable "Gerar ETP" button if errosCriticos.length > 0 (critical errors block generation)
- [ ] T168 [US5] Show warning toast if generation attempted with alertas but no errosCriticos (allow with confirmation)
- [ ] T169 [US5] Highlight sections with validation issues in SectionSelector using red/yellow indicators

**Checkpoint**: All 5 user stories complete - system fully functional with legal compliance tracking

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T170 [P] Create comprehensive README.md in repository root with project overview, setup instructions, and architecture diagram
- [ ] T171 [P] Update quickstart.md with any changes discovered during implementation (if paths or commands changed)
- [ ] T172 [P] Add JSDoc comments to all public methods in backend services for API documentation
- [ ] T173 [P] Add PropTypes or TypeScript prop interfaces documentation to all React components
- [ ] T174 [P] Implement proper error logging with Winston or Pino in backend services
- [ ] T175 [P] Add request logging middleware in NestJS main.ts logging all HTTP requests
- [ ] T176 [P] Implement rate limiting for REST endpoints (100 req/min per IP) using @nestjs/throttler
- [ ] T177 Code cleanup: Remove console.log statements, unused imports, and commented code across all files
- [ ] T178 Refactor: Extract magic numbers to constants (e.g., 11 MANDATORY_FIELDS_COUNT, 2000 DEBOUNCE_MS)
- [ ] T179 Refactor: Extract long methods (>50 lines) into smaller focused functions
- [ ] T180 [P] Add loading skeletons for slow-loading components (ProjectTree, DocumentList) using shadcn Skeleton
- [ ] T181 [P] Implement optimistic UI updates for create/update operations (show change immediately, rollback on error)
- [ ] T182 [P] Add empty states for ProjectTree (no projects), DocumentList (no documents) with helpful CTAs
- [ ] T183 [P] Improve error messages to be user-friendly (translate technical errors to plain Portuguese)
- [ ] T184 [P] Add keyboard shortcuts for common actions (Ctrl+Enter send message, Ctrl+S force save, etc.)
- [ ] T185 Security: Validate all UUIDs in API endpoints to prevent injection attacks
- [ ] T186 Security: Sanitize all user input before passing to AI agents (prevent prompt injection)
- [ ] T187 Security: Implement CSRF protection for state-changing endpoints
- [ ] T188 [P] Performance: Add database indexes verification (ensure all 9 indexes from data-model.md exist)
- [ ] T189 [P] Performance: Implement connection pooling for Prisma Client (configure in schema.prisma)
- [ ] T190 [P] Performance: Add Redis caching for frequently accessed projetos and documentos lists (5 min TTL)
- [ ] T191 Performance: Profile and optimize slowest API endpoints using NestJS interceptors
- [ ] T192 [P] Accessibility: Add ARIA labels to all interactive elements (buttons, inputs, modals)
- [ ] T193 [P] Accessibility: Ensure keyboard navigation works for entire app (Tab, Enter, Escape)
- [ ] T194 [P] Accessibility: Add screen reader announcements for real-time events (message received, progress updated)
- [ ] T195 Run complete quickstart.md validation from fresh environment (verify setup time ~15-20 min)
- [ ] T196 Validate all 5 user stories work end-to-end with real Anthropic API calls
- [ ] T197 Create production environment checklist (DATABASE_URL, ANTHROPIC_API_KEY, file storage, etc.)
- [ ] T198 [P] Write deployment documentation for Railway/Render/AWS (Dockerfile, env vars, migrations)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
  - Duration: ~1-2 days
  
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
  - Duration: ~3-4 days
  - **CRITICAL GATE**: No user story work until T011-T027 complete
  
- **User Story 1 (Phase 3)**: Depends on Foundational completion
  - Duration: ~1 week (most complex story, establishes patterns)
  - Can start immediately after Phase 2
  
- **User Story 2 (Phase 4)**: Depends on Foundational completion, integrates with US1
  - Duration: ~1 week (multi-agent orchestration + DOCX generation)
  - Can start after Phase 2, but benefits from US1 being complete for testing
  
- **User Story 3 (Phase 5)**: Depends on Foundational completion, minimal US1 integration
  - Duration: ~3-4 days (mostly UI work)
  - Can start after Phase 2, independent from US1/US2
  
- **User Story 4 (Phase 6)**: Depends on Foundational + US2 completion (needs generated documents to edit)
  - Duration: ~4-5 days (TipTap integration + versioning)
  - Must wait for US2 to have documents to edit
  
- **User Story 5 (Phase 7)**: Depends on Foundational completion, enhances US1/US2
  - Duration: ~3-4 days (UI + validation rules)
  - Can start after Phase 2, benefits from US1/US2 for testing
  
- **Polish (Phase 8)**: Depends on all desired user stories being complete
  - Duration: ~1 week
  - Start after US1+US2 for MVP, or after all stories for full release

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → ┬→ Phase 3 (US1) ────────────→ MVP Ready!
                                            │                               ↓
                                            ├→ Phase 4 (US2) ──────→ (needs US1 patterns)
                                            │                               ↓
                                            ├→ Phase 5 (US3) ──────→ (independent)
                                            │                               ↓
                                            ├→ Phase 7 (US5) ──────→ (independent)
                                            │                               ↓
                                            └→ Phase 6 (US4) ──────→ (needs US2 documents)
                                                                            ↓
                                                                    Phase 8 (Polish)
```

**Suggested Order for Single Developer**:
1. Setup (T001-T010)
2. Foundational (T011-T027) ← **GATE: Must complete before proceeding**
3. US1 - Coleta (T028-T060) ← **MVP milestone 1**
4. US2 - Geração (T061-T100) ← **MVP milestone 2** ✅ Deployable!
5. US3 - Projetos (T101-T122)
6. US5 - Validação (T150-T169)
7. US4 - Edição (T123-T149)
8. Polish (T170-T198)

**Parallel Opportunities** (if multiple developers):

**After Foundational (Phase 2):**
- Developer A: US1 (Coleta) - T028-T060
- Developer B: US3 (Projetos) - T101-T122
- Developer C: US5 (Validação rules) - T150-T158

**After US1 Complete:**
- Developer A: US2 (Geração) - T061-T100
- Developer B: US3 (Frontend) - T110-T122
- Developer C: US5 (Frontend) - T159-T169

**After US2 Complete:**
- Developer A: US4 (Edição) - T123-T149
- Developer B: Polish (backend) - T170-T191
- Developer C: Polish (frontend) - T180-T194

### Within Each Phase

**Phase 2 (Foundational) - Parallel Groups:**
- Group A: T011-T013 (Database) → Sequential
- Group B: T014-T017 (Shared types) → All parallel [P]
- Group C: T018-T022 (Backend core) → Mixed (T019 after T018)
- Group D: T023-T027 (Frontend core) → All parallel [P]

**Phase 3 (US1) - Parallel Groups:**
- Backend agents: T028-T031 → All parallel [P]
- Backend API: T032-T039 → Sequential (ChatGateway/Service)
- Backend REST: T040-T046 → All parallel [P]
- Frontend components: T047-T051 → All parallel [P]
- Frontend integration: T052-T060 → Sequential (stores then connections)

**Phase 4 (US2) - Parallel Groups:**
- Agents: T061-T065 → All parallel [P]
- Orchestration: T066-T070 → Sequential
- Validation: T071-T076 → T071-T072 parallel [P], then T073-T076
- DOCX generation: T077-T083 → T077-T078 parallel [P], then T079-T083
- API: T084-T091 → Mixed (T090-T091 parallel [P])
- Frontend: T092-T100 → T092-T094 parallel [P], rest sequential

### Task Dependencies Examples

**Sequential Dependencies:**
- T018 (BaseAgente) must complete before T028-T031 (specialized agents extend it)
- T032 (ChatGateway) and T033 (ChatService) must complete before T034-T039 (event handlers)
- T079 (gerarDocumento) must complete before T080 (section creation methods)
- T066 (OrquestradorMultiAgente) must complete before T067-T070 (orchestration methods)

**Parallel Opportunities:**
- T028, T029, T030, T031 → All agents can be built simultaneously
- T061, T062, T063, T064 → All specialized agents parallel
- T047, T048, T049, T050, T051 → All chat UI components parallel
- T092, T093, T094 → All generation UI components parallel

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only) - Recommended Approach

**Week 1:**
1. Complete Phase 1: Setup (T001-T010) - 1 day
2. Complete Phase 2: Foundational (T011-T027) - 3-4 days

**Week 2-3:**
3. Complete Phase 3: User Story 1 (T028-T060) - 5-7 days
4. **STOP and VALIDATE**: Test coleta conversacional end-to-end with real Anthropic API

**Week 4:**
5. Complete Phase 4: User Story 2 (T061-T100) - 5-7 days
6. **STOP and VALIDATE**: Generate complete ETP document, verify DOCX quality

**Week 5:**
7. Selected Polish tasks (T170-T176, T185-T187) - 3-4 days
8. Deploy MVP and gather feedback

**Total MVP Time: ~4-5 weeks** for 2 core user stories

**Why This Works:**
- US1 + US2 = Complete value proposition (collect data → generate document)
- Users can immediately start generating real ETPs
- Establishes all technical patterns (agents, WebSocket, DOCX, etc)
- Validates Anthropic API costs and performance at real scale
- Provides feedback for remaining stories (do users need projects? editing?)

### Incremental Delivery (All Stories)

**Post-MVP (Weeks 6-8):**

**Week 6:**
- US3 - Projetos (T101-T122) - 3-4 days
- Deploy and validate organization features

**Week 7:**
- US5 - Validação (T150-T169) - 3-4 days
- Deploy and validate compliance panel

**Week 8:**
- US4 - Edição (T123-T149) - 4-5 days
- Deploy and validate editing + versioning

**Week 9-10:**
- Polish (T170-T198) - 5-7 days
- Final production readiness

**Total Full Implementation: ~8-10 weeks**

### Parallel Team Strategy (3 Developers)

**Week 1 (All Together):**
- Phase 1 + Phase 2 (T001-T027)

**Week 2-3 (Parallel):**
- Dev A: US1 Backend (T028-T046)
- Dev B: US1 Frontend (T047-T060)
- Dev C: US3 Backend (T101-T109)

**Week 4 (Parallel):**
- Dev A: US2 Agents + Orchestration (T061-T070)
- Dev B: US2 DOCX + API (T077-T091)
- Dev C: US5 Backend (T150-T158)

**Week 5 (Parallel):**
- Dev A: US2 Frontend (T092-T100)
- Dev B: US3 Frontend (T110-T122)
- Dev C: US5 Frontend (T159-T169)

**Week 6 (Parallel):**
- Dev A: US4 Backend (T123-T134)
- Dev B: US4 Frontend (T135-T149)
- Dev C: Polish (T170-T191)

**Total Parallel Time: ~6 weeks** with 3 developers

---

## Validation Checkpoints

### After Phase 2 (Foundational)
- [ ] Verify PostgreSQL migrations applied successfully
- [ ] Verify Prisma Client generates all 5 entity types
- [ ] Verify Redis connection works (redis-cli ping)
- [ ] Verify Claude Agent SDK initializes (ANTHROPIC_API_KEY valid)
- [ ] Verify frontend dev server starts without errors
- [ ] Verify backend dev server starts and health check passes

### After Phase 3 (US1)
- [ ] Create new ETP via UI
- [ ] Verify WebSocket connection established (check console)
- [ ] Send messages and verify assistant responses within 3s
- [ ] Verify progress bar updates as fields collected
- [ ] Verify all 11 mandatory fields can be collected
- [ ] Verify "Gerar ETP" button enables at 100% progress
- [ ] Check database: dadosColetados JSON populated correctly

### After Phase 4 (US2)
- [ ] Use pre-filled document (or complete US1 flow)
- [ ] Click "Gerar ETP" and verify generation starts
- [ ] Verify progress updates through 5 phases (10% → 100%)
- [ ] Verify all 9 sections appear in section checklist
- [ ] Wait for completion (~2-3 minutes)
- [ ] Download DOCX file and open in Word/LibreOffice
- [ ] Verify all 9 sections present with correct formatting
- [ ] Verify headers, margins, numbering match spec

### After Phase 5 (US3)
- [ ] Create 2 projects with different colors
- [ ] Create 2 ETPs in each project
- [ ] Verify sidebar shows both projects
- [ ] Expand/collapse projects and verify animations
- [ ] Click ETP items and verify main content updates
- [ ] Verify color badges appear correctly

### After Phase 6 (US4)
- [ ] Open completed ETP
- [ ] Click section to edit
- [ ] Type in TipTap editor
- [ ] Wait 2 seconds and verify "Salvo" badge
- [ ] Refresh page and verify edits persisted
- [ ] Open version history and verify version 2 exists
- [ ] Restore version 1 and verify content reverts

### After Phase 7 (US5)
- [ ] Create ETP with invalid data (R$ 600.000 + modalidade dispensa)
- [ ] Verify right sidebar shows compliance <80%
- [ ] Verify error appears with legal reference (Lei 14.133/21, Art. 75)
- [ ] Verify "Gerar ETP" button disabled
- [ ] Fix data and verify compliance updates
- [ ] Verify generation allowed after fix

### Final Validation (Phase 8)
- [ ] Run through quickstart.md from scratch (new developer test)
- [ ] Verify setup completes in ~15-20 minutes
- [ ] Complete full US1+US2 flow 3 times with different data
- [ ] Verify average generation time <3 minutes
- [ ] Test with 5 concurrent WebSocket connections
- [ ] Verify no memory leaks or performance degradation
- [ ] Check logs for any uncaught errors

---

## Summary

| Phase | Tasks | Dependencies | Duration (Solo) | Duration (3 Devs) |
|-------|-------|--------------|-----------------|-------------------|
| Phase 1: Setup | T001-T010 (10) | None | 1 day | 1 day |
| Phase 2: Foundational | T011-T027 (17) | Phase 1 | 3-4 days | 2-3 days |
| Phase 3: US1 | T028-T060 (33) | Phase 2 | 5-7 days | 3-4 days |
| Phase 4: US2 | T061-T100 (40) | Phase 2 | 5-7 days | 3-4 days |
| Phase 5: US3 | T101-T122 (22) | Phase 2 | 3-4 days | 2-3 days |
| Phase 6: US4 | T123-T149 (27) | Phase 2, US2 | 4-5 days | 2-3 days |
| Phase 7: US5 | T150-T169 (20) | Phase 2 | 3-4 days | 2-3 days |
| Phase 8: Polish | T170-T198 (29) | All stories | 5-7 days | 3-4 days |

**Total Tasks**: 198
**Total MVP (US1+US2)**: ~90 tasks (T001-T100 minus some polish)
**Total Full Implementation**: 198 tasks

**MVP Timeline**: 4-5 weeks (solo) | 2-3 weeks (3 devs)
**Full Timeline**: 8-10 weeks (solo) | 5-6 weeks (3 devs)

**Parallel Opportunities**: 67 tasks marked [P] can run concurrently
**Independent Stories**: US1, US3, US5 independent; US2 integrates US1; US4 needs US2

**Recommended MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) + Phase 4 (US2)
**Why**: Delivers core value (AI conversation → ETP document) in ~4-5 weeks

---

## Notes

- All tasks follow strict checklist format: `- [ ] [TID] [P?] [Story?] Description with file path`
- [P] indicates task can run in parallel with others (different files, no blocking dependencies)
- [Story] labels (US1-US5) map tasks to user stories from spec.md for traceability
- File paths follow Turborepo monorepo structure from plan.md
- Phase 2 (Foundational) is a hard gate - no user story work until complete
- Each user story should be independently testable at its checkpoint
- Validation checkpoints provide clear acceptance criteria per phase
- MVP (US1+US2) delivers complete value proposition for early feedback
- Tests are optional per spec.md and not included in task list
