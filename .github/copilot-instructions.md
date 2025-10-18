# ETPConstructor Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-18

## Active Technologies
- **Language**: TypeScript 5.3+ / Node.js 20+
- **Backend**: NestJS 10, Prisma ORM, Socket.IO, Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`), docx
- **Frontend**: Vite 5, React 18, Tailwind CSS, shadcn/ui, Zustand, TipTap, socket.io-client
- **Database**: PostgreSQL 15, Redis 7
- **Testing**: Jest (unit/integration), Playwright (E2E), Supertest (API contracts)
- **AI Model**: Claude Sonnet 4.5 (claude-sonnet-4-20250514)

## Project Structure
```
ETPConstructor/
├── .claude/                    # Claude Agent SDK configuration
├── apps/
│   ├── backend/                # NestJS API + WebSocket server
│   │   ├── src/
│   │   │   ├── agentes/        # AI Agent implementations (5 specialized)
│   │   │   ├── chat/           # Socket.IO gateway
│   │   │   ├── documentos/     # REST API
│   │   │   └── prisma/         # Database schema
│   │   └── tests/
│   └── web/                    # Vite + React frontend
│       ├── src/
│       │   ├── components/     # UI components
│       │   ├── stores/         # Zustand state management
│       │   └── services/       # API/Socket clients
│       └── e2e/
└── packages/
    ├── shared-types/           # Shared TypeScript interfaces
    └── config/                 # ESLint, Prettier configs
```

## Commands
- `pnpm install` - Install all dependencies
- `pnpm dev` - Start all dev servers (Turborepo)
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code
- `pnpm --filter backend prisma migrate dev` - Run database migrations
- `docker compose up -d` - Start PostgreSQL + Redis

## Code Style
- **TypeScript**: Strict mode enabled, no implicit any
- **React**: Function components + hooks only (no class components)
- **CSS**: Tailwind utility classes only (no inline styles or CSS files)
- **API**: REST for CRUD operations, WebSocket (Socket.IO) for real-time
- **Validation**: Zod schemas for all DTOs
- **AI Agents**: All extend BaseAgente class wrapping Claude Agent SDK

## Architecture Principles
1. **Multi-Agent AI**: 5 specialized agents (Coletor, Validador Legal, Especificações, Custos, Gestão)
2. **Legal Compliance First**: Validação legal bloqueia geração se erros críticos
3. **Monorepo TypeScript**: Tipos compartilhados via `packages/shared-types`
4. **Real-Time Communication**: Socket.IO para chat e progresso de geração
5. **Type Safety**: Prisma ORM, Zod validation, shared types
6. **Claude Agent SDK**: OBRIGATÓRIO para todos os agentes (`@anthropic-ai/claude-agent-sdk`)

## Recent Changes
- 001-specify-scripts-bash: Initial setup with TypeScript 5.3+, NestJS, Vite, Claude Agent SDK

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
