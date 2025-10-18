<!--
SYNC IMPACT REPORT - Constitution Update
═══════════════════════════════════════════════════════════════════════════
VERSION CHANGE: Initial → 1.1.0
REASON: Add Claude Agent SDK as mandatory framework for AI agent implementation

AMENDMENTS IN v1.1.0:
  ✓ NEW: Principle VI - Claude Agent SDK (NON-NEGOTIABLE)
  ✓ UPDATED: Technology Stack Requirements - Added Claude Agent SDK
  ✓ CLARIFIED: Multi-Agent Architecture now built on Claude Agent SDK foundation

PRINCIPLES ESTABLISHED:
  ✓ Multi-Agent AI Architecture
  ✓ Legal Compliance First
  ✓ Monorepo Full-Stack TypeScript
  ✓ Real-Time Communication
  ✓ Type Safety & Validation
  ✓ Claude Agent SDK (NEW)

SECTIONS ADDED:
  + Core Principles (6 principles - 1 new)
  + Technology Stack Requirements
  + Development Workflow & Quality Gates
  + Governance

TEMPLATES STATUS:
  ✅ plan-template.md - Compatible with monorepo structure
  ✅ spec-template.md - User story approach aligns with phases
  ✅ tasks-template.md - Phase-based execution matches principles
  ⚠️  commands/ - Directory not present, will be created as needed

FOLLOW-UP ACTIONS:
  □ Review constitution with team
  □ Establish legal compliance validation procedures
  □ Configure CI/CD pipelines per governance rules
  □ Document agent system prompt templates
  □ Configure .claude/ directory structure for SDK features
  □ Define MCP servers for external integrations (if needed)
═══════════════════════════════════════════════════════════════════════════
-->

# ETP Generator Constitution

## Core Principles

### I. Multi-Agent AI Architecture

Every AI component MUST be implemented as a specialized agent built on **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`):

- **Single Responsibility**: Each agent handles ONE domain (collection, legal validation, technical specs, cost estimation, contract management)
- **SDK Foundation**: All agents leverage Claude Agent SDK for context management, tool permissions, and Claude integration
- **Consistent Interface**: Custom agents extend base patterns with domain-specific system prompts and tools
- **Orchestration**: Complex operations MUST use `OrquestradorMultiAgenteService` to coordinate multiple agents
- **Prompt Engineering**: System prompts MUST be explicit, structured, and include JSON response schemas
- **Error Isolation**: Agent failures MUST NOT cascade; orchestrator handles degradation gracefully

**Rationale**: Brazilian public procurement ETPs require specialized domain expertise (legal, technical, financial). Multi-agent architecture built on Claude Agent SDK ensures professional-grade context management, automatic prompt caching, and production-ready error handling through Claude Sonnet 4.5 specialization.

### II. Legal Compliance First (NON-NEGOTIABLE)

ALL document generation MUST pass legal validation before completion:

- **Validation Gates**: `AgenteValidadorLegal` validates data at collection completion AND each generated section
- **Legislation Knowledge**: System MUST embed Lei 8.666/93, Lei 14.133/21, IN SEGES 05/2017, IN SEGES 65/2021 requirements
- **Audit Trail**: Every validation result stored in `ValidacaoLegal` table with rules, results, timestamps
- **User Transparency**: Legal alerts and errors MUST be surfaced in real-time via WebSocket
- **Blocking Errors**: Documents with legal errors CANNOT be marked as "concluido"

**Rationale**: Non-compliant ETPs expose government agencies to legal challenges, audit findings, and procurement delays. Legal validation is the core value proposition distinguishing this system from generic document generators.

### III. Monorepo Full-Stack TypeScript

Project structure MUST follow Turborepo monorepo pattern:

- **Apps**: `apps/backend` (NestJS), `apps/web` (Next.js 14 App Router)
- **Packages**: `packages/shared-types` for shared TypeScript interfaces, `packages/config` for shared configs
- **Single Source of Truth**: Types defined once in `shared-types`, imported by both backend and frontend
- **Workspace Scripts**: Root-level commands orchestrate all apps (`pnpm dev`, `pnpm build`, `pnpm test`)
- **Consistent Tooling**: ESLint, Prettier, TypeScript configs shared via `packages/config`

**Rationale**: Type safety across client-server boundary prevents runtime errors in critical legal/financial data. Monorepo enables atomic changes to contracts, reduces version drift, and simplifies deployment.

### IV. Real-Time Communication

User interactions during ETP generation MUST use WebSocket (Socket.IO):

- **Conversational Collection**: Chat-based data collection via `ChatGateway` emits progress, validations, confirmations
- **Generation Progress**: Document generation emits phase updates (10%, 30%, 60%, 80%, 90%, 100%) via `progresso_geracao` events
- **Immediate Feedback**: Legal warnings/errors emitted as `alerta_secao` events during validation
- **Session Management**: `ChatService` maintains per-client session state (history, collected data, validated fields)
- **Graceful Degradation**: Connection loss MUST preserve session state; reconnection resumes from last state

**Rationale**: ETP generation takes 2-5 minutes with multiple AI calls. Real-time feedback prevents user abandonment, builds trust through transparency, and enables immediate correction of collection errors.

### V. Type Safety & Validation

All data boundaries MUST enforce runtime validation:

- **DTOs with Zod**: Every NestJS controller endpoint validates input with Zod schemas
- **Prisma Type Safety**: Database operations use generated Prisma Client types
- **Shared Types**: `packages/shared-types` exports interfaces used by both frontend and backend
- **AI Response Parsing**: Agent responses parsed with `extrairJSON()` and validated against expected schemas before use
- **Frontend State**: Zustand stores typed with TypeScript interfaces

**Rationale**: Financial data (cost estimates), legal requirements (procurement laws), and technical specifications (ABNT norms) cannot tolerate data corruption. Type safety prevents entire classes of bugs in critical procurement workflows.

### VI. Claude Agent SDK (NON-NEGOTIABLE)

All AI agent implementations MUST use the **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`):

- **Official SDK Only**: Direct use of `@anthropic-ai/sdk` is FORBIDDEN; use Claude Agent SDK wrapper instead
- **TypeScript Implementation**: Use `@anthropic-ai/claude-agent-sdk` npm package (Python SDK not applicable)
- **Context Management**: Leverage SDK's automatic context compaction to prevent context overflow
- **Tool Permissions**: Configure `allowedTools`/`disallowedTools` and `permissionMode` for each agent
- **Streaming Mode**: Use streaming API for real-time feedback during long-running operations
- **Authentication**: Use `ANTHROPIC_API_KEY` environment variable (no third-party providers initially)
- **Configuration Directory**: Maintain `.claude/` directory structure:
  - `.claude/agents/` - Subagent definitions (if needed)
  - `.claude/settings.json` - Hooks and custom configurations
  - `.claude/commands/` - Slash commands (if needed)
  - `CLAUDE.md` or `.claude/CLAUDE.md` - Project-level instructions

**Rationale**: The Claude Agent SDK provides battle-tested infrastructure from Claude Code including automatic prompt caching, context management, and production error handling. Building on this foundation prevents reinventing critical agent infrastructure and ensures performance optimizations that would take months to develop independently.

**SDK Features Enabled**:
- Automatic context compaction prevents token limit issues during multi-turn conversations
- Built-in prompt caching reduces costs for repeated system prompts
- Rich tool ecosystem ready for extension via Model Context Protocol (MCP)
- Session management and monitoring built-in
- Fine-grained permission control prevents accidental data access

## Technology Stack Requirements

### Mandatory Technologies

**Backend**:
- Node.js 20+ with NestJS framework
- PostgreSQL 15 via Prisma ORM
- Redis 7 for session caching
- Socket.IO for WebSocket communication
- **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) - REQUIRED for all AI agents
- Claude Sonnet 4.5 model via SDK: `claude-sonnet-4-20250514`
- docx npm package for DOCX generation

**Frontend**:
- Next.js 14 with App Router
- Tailwind CSS with shadcn/ui components
- Zustand for client state
- TipTap for rich text editing
- socket.io-client for WebSocket

**DevOps**:
- pnpm workspace
- Turborepo for build orchestration
- Docker + Docker Compose for local development
- Prisma Migrate for database versioning

**AI Infrastructure**:
- `.claude/` directory structure for SDK configuration
- Environment variable: `ANTHROPIC_API_KEY` for authentication
- Optional: MCP servers for external integrations (defined in `.claude/settings.json`)

### Forbidden Patterns

- ❌ **Direct `@anthropic-ai/sdk` usage** (MUST use `@anthropic-ai/claude-agent-sdk` instead)
- ❌ Class components (React must use function components + hooks)
- ❌ REST for real-time updates (use WebSocket)
- ❌ Inline styles (use Tailwind utility classes)
- ❌ Any CSS (use Tailwind exclusively)
- ❌ Direct database queries outside Prisma
- ❌ Hardcoded legal rules (externalize to config files)
- ❌ Manual context management (let SDK handle context compaction)
- ❌ Custom prompt caching logic (SDK provides automatic caching)

## Project Structure with Claude Agent SDK

### Directory Organization

```
etp-generator/
├── .claude/                          # Claude Agent SDK configuration
│   ├── agents/                       # Subagent definitions (if needed)
│   ├── commands/                     # Custom slash commands (if needed)
│   ├── settings.json                 # Hooks and SDK configuration
│   └── CLAUDE.md                     # Project-level instructions (optional)
│
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── agentes/              # AI Agent implementations
│   │   │   │   ├── base-agente.ts    # Base class wrapping Claude Agent SDK
│   │   │   │   ├── agente-coletor.service.ts
│   │   │   │   ├── agente-validador-legal.service.ts
│   │   │   │   ├── agente-especificacoes-tecnicas.service.ts
│   │   │   │   ├── agente-estimativa-custos.service.ts
│   │   │   │   └── agente-gestao-contratual.service.ts
│   │   │   └── ...
│   │   └── ...
│   └── web/
│       └── ...
└── ...
```

### Agent Implementation Pattern

Each agent service MUST follow this pattern:

```typescript
import { ClaudeAgent } from '@anthropic-ai/claude-agent-sdk';

export abstract class BaseAgente {
  protected agent: ClaudeAgent;
  protected model = 'claude-sonnet-4-20250514';
  
  constructor() {
    this.agent = new ClaudeAgent({
      model: this.model,
      apiKey: process.env.ANTHROPIC_API_KEY,
      systemPrompt: this.systemPrompt,
      allowedTools: this.allowedTools,
      permissionMode: 'allow-listed', // Explicit permission model
    });
  }
  
  abstract get systemPrompt(): string;
  abstract get allowedTools(): string[];
  abstract get nome(): string;
  abstract get especialidade(): string;
  
  protected async executar(mensagem: string, contexto?: any): Promise<string> {
    // Use SDK's streaming or single-turn API
    const response = await this.agent.run(mensagem);
    return response.content;
  }
}
```

### SDK Configuration Files

**`.claude/settings.json`** (Optional - for hooks and MCP):
```json
{
  "hooks": {
    "onToolUse": "./scripts/log-tool-usage.sh"
  },
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

**`CLAUDE.md`** (Optional - project instructions):
```markdown
# ETP Generator Project Context

This project generates Brazilian public procurement documents (ETPs) 
compliant with Lei 8.666/93, Lei 14.133/21, and IN SEGES regulations.

## Key Requirements
- All legal validations must pass before document completion
- Multi-agent architecture with specialized domains
- Real-time progress updates via WebSocket
```

## Development Workflow & Quality Gates

### Phase-Based Implementation

Development MUST follow 5-phase roadmap (Section 8 of specification):

1. **Phase 1 (MVP)**: Chat collection + basic DOCX generation → Deliverable: functional prototype
2. **Phase 2 (Multi-Agent)**: Specialized agents + legal validation → Deliverable: production-quality documents
3. **Phase 3 (Projects)**: Project management + organization → Deliverable: enterprise UX
4. **Phase 4 (Editing)**: TipTap editor + versioning → Deliverable: collaborative editing
5. **Phase 5 (Production)**: Tests + performance + deployment → Deliverable: production system

Each phase MUST complete before next phase begins. Phase deliverables MUST be demoable to stakeholders.

### Code Quality Gates

**Pre-Commit**:
- ✅ ESLint passes (no errors, warnings reviewed)
- ✅ TypeScript compiles without errors
- ✅ Prettier formatting applied

**Pre-PR**:
- ✅ All affected unit tests pass
- ✅ Integration tests for changed contracts pass
- ✅ Manual testing of affected user flows completed
- ✅ No `console.log` or debug code remaining

**Pre-Merge**:
- ✅ Code review approved by 1+ team member
- ✅ Constitution compliance verified (AI architecture, type safety, legal validation)
- ✅ Documentation updated (README, API docs, agent prompts)

### Testing Strategy

**Unit Tests** (Jest):
- Services: Mock Prisma, test business logic
- Agents: Mock Anthropic client, test prompt construction and response parsing
- Utils: Pure function tests

**Integration Tests** (Supertest):
- API contracts: Test REST endpoints with real database (test DB)
- WebSocket flows: Test chat collection and generation events

**E2E Tests** (Playwright):
- Critical paths: Create ETP → Collect data → Generate document → Download
- Target: 80%+ coverage of user-facing flows

**Manual Testing**:
- Legal compliance: Validate generated ETPs against real procurement requirements
- UX flows: Test chat naturalness, progress transparency, error recovery

## Governance

### Amendment Process

Constitution changes require:
1. **Proposal**: Document rationale, affected principles, migration plan
2. **Review**: Team discussion of trade-offs and alternatives
3. **Approval**: Consensus from project leads
4. **Version Bump**:
   - MAJOR: Breaking changes to architecture principles (e.g., removing multi-agent pattern)
   - MINOR: New principle added or significant expansion (e.g., adding security requirements)
   - PATCH: Clarifications, wording improvements, non-semantic fixes
5. **Propagation**: Update affected templates, documentation, and code

### Compliance Enforcement

- **Pre-Merge Review**: All PRs MUST verify constitution alignment before approval
- **Architecture Decisions**: Deviations from principles MUST be documented in `plan.md` Complexity Tracking table with justification
- **Template Synchronization**: Changes to constitution trigger review of all `.specify/templates/` files
- **Audit**: Quarterly review of codebase for constitutional drift

### Living Document

This constitution is the **source of truth** for architectural decisions. When conflicts arise between this document and:
- Code comments: Constitution wins
- README instructions: Constitution wins
- Verbal agreements: Constitution wins

Ambiguities MUST be resolved by amending constitution, not by creating parallel guidance.

**Version**: 1.1.0 | **Ratified**: 2025-10-18 | **Last Amended**: 2025-10-18
