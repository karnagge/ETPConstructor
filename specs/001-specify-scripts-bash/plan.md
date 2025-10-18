# Implementation Plan: ETP Generator System

**Branch**: `001-specify-scripts-bash` | **Date**: 2025-10-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-specify-scripts-bash/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Sistema web para geração automatizada de Estudos Técnicos Preliminares (ETP) para licitações públicas no Brasil, utilizando IA conversacional (Claude Sonnet 4.5 via Claude Agent SDK) para coleta de dados e orquestração multi-agente para geração de documentos em conformidade com legislação brasileira (Lei 8.666/93, Lei 14.133/21, IN SEGES). Interface clean similar ao Claude Desktop, construída com Vite e bibliotecas mínimas.

## Technical Context

**Language/Version**: TypeScript 5.3+ / Node.js 20+  
**Primary Dependencies**: 
- Backend: NestJS 10, Prisma ORM, Socket.IO, Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`), docx
- Frontend: Vite 5, React 18, Tailwind CSS, shadcn/ui, Zustand, TipTap, socket.io-client
**Storage**: PostgreSQL 15 (dados estruturados), Redis 7 (sessões), filesystem local (arquivos DOCX/PDF)  
**Testing**: Jest (unit/integration), Playwright (E2E), Supertest (API contracts)  
**Target Platform**: Linux server (Docker), navegadores modernos (Chrome/Firefox/Edge)  
**Project Type**: Web application (monorepo Turborepo com backend NestJS + frontend Vite)  
**Performance Goals**: 
- Chat response time <3s (p95)
- Document generation <3 min (típico ETP com ~100k valor)
- Suporte a 10 usuários simultâneos (10 WebSocket connections)
**Constraints**: 
- Custo de API Anthropic viável (~50-100 requests/ETP)
- Legal compliance obrigatória (bloqueio em erros críticos)
- Interface clean e minimalista (inspired by Claude Desktop)
**Scale/Scope**: MVP com 5 user stories prioritárias (P1-P3), ~15-20 endpoints REST, 9 seções de documento ETP, 5 agentes especializados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Multi-Agent AI Architecture
- **Status**: PASS
- **Evidence**: Spec defines 5 specialized agents (FR-006): AgenteColetorConversacional, AgenteValidadorLegal, AgenteEspecificacoesTecnicas, AgenteEstimativaCustos, AgenteGestaoContratual
- **Implementation**: All agents will extend BaseAgente class wrapping Claude Agent SDK
- **Orchestration**: OrquestradorMultiAgenteService will coordinate Promise.all for parallel execution (FR-007)

### ✅ Principle II: Legal Compliance First
- **Status**: PASS
- **Evidence**: FR-017 blocks document generation on critical legal errors, FR-018 calculates compliance percentage, ValidacaoLegal entity tracks audit trail
- **Implementation**: AgenteValidadorLegal validates at collection completion AND each section (FR-002)
- **User Transparency**: Real-time alerts via WebSocket (FR-019)

### ✅ Principle III: Monorepo Full-Stack TypeScript
- **Status**: PASS
- **Evidence**: Technical Context specifies Turborepo with TypeScript 5.3+, NestJS backend, Vite frontend
- **Structure**: apps/backend + apps/web + packages/shared-types for type sharing
- **Tooling**: pnpm workspace with shared ESLint/Prettier configs

### ✅ Principle IV: Real-Time Communication
- **Status**: PASS
- **Evidence**: FR-001 requires WebSocket with 2s response time, FR-004 tracks progress via events
- **Implementation**: Socket.IO with ChatGateway for conversational collection, progress_geracao events for generation phases
- **Session Management**: ChatService maintains per-client state (FR-003 validation context)

### ✅ Principle V: Type Safety & Validation
- **Status**: PASS
- **Evidence**: Prisma ORM for database types (FR-011), shared-types package for client-server contracts
- **Validation**: Zod schemas for DTOs (FR-003 response validation), JSON parsing with extrairJSON() for AI responses
- **Frontend**: Zustand stores typed with TypeScript interfaces

### ✅ Principle VI: Claude Agent SDK (NON-NEGOTIABLE)
- **Status**: PASS
- **Evidence**: User explicitly requested "Claude Agent SDK", Technical Context lists `@anthropic-ai/claude-agent-sdk` as primary dependency
- **Model**: claude-sonnet-4-20250514 (Sonnet 4.5)
- **Configuration**: .claude/ directory with settings.json, CLAUDE.md for project instructions
- **Authentication**: ANTHROPIC_API_KEY environment variable
- **Features**: Automatic context compaction, prompt caching, streaming mode for real-time feedback

### 🎯 Pre-Design Gate: PASSED
All 6 constitutional principles satisfied. Proceeding to Phase 0 research.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
ETPConstructor/
├── .claude/                           # Claude Agent SDK configuration
│   ├── settings.json                  # Hooks and MCP servers (optional)
│   └── CLAUDE.md                      # Project-level instructions
│
├── apps/
│   ├── backend/                       # NestJS API + WebSocket server
│   │   ├── src/
│   │   │   ├── agentes/               # AI Agent implementations
│   │   │   │   ├── base-agente.ts     # Abstract base wrapping Claude Agent SDK
│   │   │   │   ├── agente-coletor-conversacional.service.ts
│   │   │   │   ├── agente-validador-legal.service.ts
│   │   │   │   ├── agente-especificacoes-tecnicas.service.ts
│   │   │   │   ├── agente-estimativa-custos.service.ts
│   │   │   │   ├── agente-gestao-contratual.service.ts
│   │   │   │   └── orquestrador-multi-agente.service.ts
│   │   │   ├── chat/                  # WebSocket gateway + service
│   │   │   │   ├── chat.gateway.ts    # Socket.IO events
│   │   │   │   └── chat.service.ts    # Session state management
│   │   │   ├── documentos/            # REST API for documents
│   │   │   │   ├── documentos.controller.ts
│   │   │   │   ├── documentos.service.ts
│   │   │   │   └── dto/               # Zod validation schemas
│   │   │   ├── geracao/               # Document generation orchestration
│   │   │   │   ├── geracao.service.ts
│   │   │   │   └── docx-builder.service.ts
│   │   │   ├── projetos/              # Projects CRUD
│   │   │   │   ├── projetos.controller.ts
│   │   │   │   └── projetos.service.ts
│   │   │   ├── validacao/             # Legal validation logic
│   │   │   │   └── validacao-legal.service.ts
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma      # Database schema
│   │   │   │   └── migrations/
│   │   │   └── main.ts                # Bootstrap NestJS + Socket.IO
│   │   ├── test/
│   │   │   ├── integration/           # API + WebSocket integration tests
│   │   │   └── unit/                  # Service unit tests
│   │   └── package.json
│   │
│   └── web/                           # Vite + React frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/                # shadcn/ui components
│       │   │   ├── chat/              # Chat interface (like Claude Desktop)
│       │   │   │   ├── ChatWindow.tsx
│       │   │   │   ├── MessageList.tsx
│       │   │   │   └── InputArea.tsx
│       │   │   ├── sidebar/           # Projects + documents tree
│       │   │   │   ├── ProjectTree.tsx
│       │   │   │   └── DocumentItem.tsx
│       │   │   ├── editor/            # TipTap WYSIWYG editor
│       │   │   │   └── DocumentEditor.tsx
│       │   │   └── generation/        # Progress + alerts
│       │   │       ├── ProgressBar.tsx
│       │   │       └── AlertPanel.tsx
│       │   ├── pages/
│       │   │   ├── Home.tsx           # Main ETP workspace
│       │   │   └── DocumentView.tsx   # Single document view + editor
│       │   ├── services/
│       │   │   ├── socket.service.ts  # Socket.IO client wrapper
│       │   │   └── api.service.ts     # REST API client (fetch wrapper)
│       │   ├── stores/                # Zustand state management
│       │   │   ├── chat.store.ts
│       │   │   ├── documents.store.ts
│       │   │   └── projects.store.ts
│       │   ├── types/                 # Frontend-only types (imports from shared-types)
│       │   ├── main.tsx               # Vite entry point
│       │   └── App.tsx                # Root component + routing
│       ├── e2e/                       # Playwright E2E tests
│       │   └── flows/
│       │       ├── create-etp.spec.ts
│       │       └── generate-document.spec.ts
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── packages/
│   ├── shared-types/                  # Shared TypeScript interfaces
│   │   ├── src/
│   │   │   ├── documento.types.ts     # Documento, DadosColetados, ConteudoSecoes
│   │   │   ├── projeto.types.ts       # Projeto entity
│   │   │   ├── validacao.types.ts     # ValidacaoLegal entity
│   │   │   └── index.ts               # Re-exports
│   │   └── package.json
│   │
│   └── config/                        # Shared configs (ESLint, Prettier, tsconfig)
│       ├── eslint-config/
│       ├── typescript-config/
│       └── package.json
│
├── docker-compose.yml                 # PostgreSQL + Redis for local dev
├── turbo.json                         # Turborepo pipeline config
├── pnpm-workspace.yaml                # pnpm workspace definition
├── package.json                       # Root package with workspace scripts
└── README.md
```

**Structure Decision**: Selected **Web Application (Option 2)** with Turborepo monorepo structure. Rationale:
- **Backend (NestJS)**: Handles multi-agent orchestration, WebSocket connections, REST API, database access via Prisma
- **Frontend (Vite+React)**: Clean UI similar to Claude Desktop, real-time chat interface, document editing with TipTap
- **Shared Types**: Single source of truth for contracts between backend and frontend (DadosColetados, ConteudoSecoes, Documento entity)
- **Turborepo**: Enables atomic type changes, parallel builds, and shared tooling configs

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**Status**: No violations detected. All 6 constitutional principles satisfied.

---

## Phase 0 & 1 Deliverables

### ✅ Phase 0: Outline & Research (Complete)

**Artifact**: [research.md](./research.md)

**Key Decisions Resolved**:
1. **Claude Agent SDK Integration** - TypeScript implementation with automatic context management
2. **Vite Frontend Architecture** - Minimal libraries approach without Next.js overhead
3. **Claude Desktop-Inspired UI** - Three-column layout with clean design patterns
4. **Multi-Agent Orchestration** - Promise.all for parallel execution with graceful degradation
5. **Real-Time WebSocket** - Socket.IO with room-based isolation per document
6. **DOCX Generation** - docx library for programmatic document creation
7. **Legal Validation Rules** - Pure functions in config file for maintainability
8. **Database Schema** - Prisma with PostgreSQL, normalized with explicit relationships
9. **Development Workflow** - Docker Compose for environment parity
10. **Testing Strategy** - 3-level approach (unit, integration, E2E)

---

### ✅ Phase 1: Design & Contracts (Complete)

**Artifacts**:
- [data-model.md](./data-model.md) - 5 entities with Prisma schema
- [contracts/rest-api.md](./contracts/rest-api.md) - 19 REST endpoints
- [contracts/websocket.md](./contracts/websocket.md) - 26 WebSocket events
- [quickstart.md](./quickstart.md) - Setup guide (15-20 min)

**Data Model Summary**:
- **5 Entities**: Usuario, Projeto, Documento, VersaoDocumento, ValidacaoLegal
- **9 Indexes**: Performance-optimized for common queries
- **2 JSON Fields**: dadosColetados (11 campos), conteudoSecoes (9 seções)
- **1 Enum**: StatusDocumento (RASCUNHO, EM_GERACAO, CONCLUIDO, ARQUIVADO)

**API Contracts Summary**:
- **REST**: 19 endpoints across 6 resources (Documentos, Versões, Validações, Projetos, Geração, Usuários)
- **WebSocket**: 7 client→server events, 19 server→client events
- **Validation**: Zod schemas on all POST/PATCH endpoints
- **Real-Time**: Socket.IO rooms for per-document isolation

---

## Post-Design Constitution Re-Check

*Re-evaluation after Phase 1 artifacts created*

### ✅ All Principles Maintained

**No deviations introduced during design phase**. Data model, API contracts, and architecture align with all 6 constitutional principles:

1. ✅ Multi-Agent AI (5 specialized agents with BaseAgente pattern)
2. ✅ Legal Compliance First (ValidacaoLegal entity, blocking on critical errors)
3. ✅ Monorepo TypeScript (Prisma types, shared-types package, Zod validation)
4. ✅ Real-Time Communication (Socket.IO with 26 events, room-based isolation)
5. ✅ Type Safety (Prisma Client, Zod DTOs, shared interfaces)
6. ✅ Claude Agent SDK (All agents extend BaseAgente wrapping SDK)

---

## Next Steps (Phase 2)

**Command**: This planning phase stops here per prompt instructions.

**What's Next**: Execute `speckit.tasks` command to generate:
- `tasks.md` - Phase-by-phase implementation tasks
- Breakdown of Phase 2-5 work into actionable items
- Test scenarios for each user story

**Ready for Implementation**: 
- ✅ Research complete (all unknowns resolved)
- ✅ Data model defined (Prisma schema ready)
- ✅ API contracts specified (19 REST + 26 WebSocket events)
- ✅ Quickstart documented (setup in ~15 min)
- ✅ Agent context updated (Copilot instructions file)

---

## Summary

**Branch**: `001-specify-scripts-bash`  
**Feature**: ETP Generator System (MVP)  
**Status**: Planning Complete ✅

**Artifacts Generated**:
1. `plan.md` (this file) - Technical context + architecture decisions
2. `research.md` - 10 technical decisions with rationale
3. `data-model.md` - Database schema + entity details
4. `contracts/rest-api.md` - 19 REST endpoints
5. `contracts/websocket.md` - 26 WebSocket events
6. `quickstart.md` - Setup guide (15-20 min)
7. `.github/copilot-instructions.md` - Updated agent context

**Ready to Proceed**: Yes, all Phase 0 and Phase 1 deliverables complete.

**Estimated Implementation Time** (Phases 2-5):
- Phase 2 (Multi-Agent Core): ~3-4 weeks
- Phase 3 (Projects UI): ~1-2 weeks
- Phase 4 (Editing + Versioning): ~2 weeks
- Phase 5 (Testing + Production): ~2-3 weeks
- **Total**: ~8-11 weeks for full MVP

**Team Recommendation**: 2-3 developers (1 backend specialist, 1 frontend specialist, 1 full-stack for integration)

