# Quickstart Guide: ETP Generator System

**Phase**: 1 (Design & Contracts)  
**Date**: 2025-10-18  
**Estimated Setup Time**: 15-20 minutes

## Overview

Este guia rápido leva você do zero até o sistema ETP Generator rodando localmente, incluindo backend NestJS, frontend Vite, banco PostgreSQL, Redis, e ambiente configurado para desenvolvimento.

---

## Prerequisites

Certifique-se de ter instalado:

- **Node.js 20+**: `node --version` (recomendado 20.x LTS)
- **pnpm 8+**: `pnpm --version` (ou instalar via `npm install -g pnpm`)
- **Docker + Docker Compose**: `docker --version` && `docker compose version`
- **Git**: `git --version`

**Opcional**:
- **PostgreSQL Client** (psql): Para inspecionar banco manualmente
- **Redis CLI** (redis-cli): Para debug de sessões

---

## Step 1: Clone Repository

```bash
git clone https://github.com/seu-org/ETPConstructor.git
cd ETPConstructor
```

Verifique que está no branch correto:
```bash
git checkout 001-specify-scripts-bash
```

---

## Step 2: Install Dependencies

### Root + All Workspaces

```bash
pnpm install
```

Isso instala dependências de:
- `apps/backend` (NestJS, Prisma, Socket.IO, Claude Agent SDK)
- `apps/web` (Vite, React, Tailwind, TipTap)
- `packages/shared-types` (TypeScript types compartilhados)
- `packages/config` (ESLint, Prettier, tsconfig)

**Duração esperada**: ~3-5 minutos (dependendo da internet)

---

## Step 3: Start Infrastructure (Docker)

Inicie PostgreSQL e Redis via Docker Compose:

```bash
docker compose up -d
```

Verifique que containers estão rodando:
```bash
docker ps
```

Você deve ver:
```
CONTAINER ID   IMAGE              PORTS                    NAMES
abc123def456   postgres:15-alpine 0.0.0.0:5432->5432/tcp   etpconstructor-postgres-1
789ghi012jkl   redis:7-alpine     0.0.0.0:6379->6379/tcp   etpconstructor-redis-1
```

---

## Step 4: Configure Environment Variables

### Backend Environment

Crie arquivo `.env` em `apps/backend/`:

```bash
cd apps/backend
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://etp_user:etp_password@localhost:5432/etp_generator?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Server
PORT=3001
NODE_ENV=development

# Files
UPLOADS_DIR=./uploads
DOCUMENTS_DIR=./uploads/documents
EOF
```

**⚠️ IMPORTANTE**: Substitua `your_anthropic_api_key_here` pela sua chave real da Anthropic.

Obter chave: [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

### Frontend Environment

Crie arquivo `.env` em `apps/web/`:

```bash
cd ../web
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
EOF
```

Volte para a raiz do projeto:
```bash
cd ../..
```

---

## Step 5: Setup Database

### Run Migrations

Execute as migrations do Prisma para criar tabelas:

```bash
pnpm --filter backend prisma migrate dev --name init
```

**Output esperado**:
```
Applying migration `20251018_init`
✔ Generated Prisma Client
Database schema updated!
```

### Seed Database (Optional)

Popule banco com dados de teste (usuário admin, projeto exemplo):

```bash
pnpm --filter backend prisma db seed
```

**Output esperado**:
```
✓ Seeded: admin@etp.gov.br (Administrador Teste)
✓ Seeded: Projeto "Licitações TI 2025"
```

### Verify Database

```bash
pnpm --filter backend prisma studio
```

Abre Prisma Studio em `http://localhost:5555` para visualizar dados.

---

## Step 6: Create Claude Agent SDK Configuration

Crie diretório e arquivos de configuração do Claude Agent SDK na raiz:

```bash
mkdir -p .claude
```

### .claude/CLAUDE.md

```bash
cat > .claude/CLAUDE.md << 'EOF'
# ETP Generator Project Context

## Domain
Brazilian public procurement ETPs (Estudos Técnicos Preliminares) compliant with:
- **Lei 8.666/93**: Old procurement law
- **Lei 14.133/21**: New procurement law (effective since 2023)
- **IN SEGES 05/2017**: ETP structure requirements
- **IN SEGES 65/2021**: Cost estimation guidelines

## Critical Requirements
1. **Legal Compliance First**: All validations must pass before document completion
2. **9 Mandatory Sections**: Document structure is fixed
3. **11 Mandatory Fields**: Data collection must be complete
4. **Real-Time Communication**: Progress updates via WebSocket (Socket.IO)

## Agent Specializations
1. **AgenteColetorConversacional**: Natural conversation for data collection
2. **AgenteValidadorLegal**: Validates compliance with Brazilian laws
3. **AgenteEspecificacoesTecnicas**: Generates technical specifications with ABNT norms
4. **AgenteEstimativaCustos**: Estimates costs with market research
5. **AgenteGestaoContratual**: Generates contract management clauses

## Technical Stack
- Backend: NestJS + Prisma + Socket.IO + Claude Agent SDK
- Frontend: Vite + React + Tailwind CSS + TipTap
- Database: PostgreSQL 15
- Cache: Redis 7
- AI: Claude Sonnet 4.5 (claude-sonnet-4-20250514)
EOF
```

### .claude/settings.json (Optional)

```bash
cat > .claude/settings.json << 'EOF'
{
  "hooks": {},
  "mcpServers": {}
}
EOF
```

---

## Step 7: Start Development Servers

### Terminal 1: Backend (NestJS)

```bash
pnpm --filter backend dev
```

**Output esperado**:
```
[Nest] 12345 - Starting Nest application...
[Nest] 12345 - WebSocket server listening on port 3001
[Nest] 12345 - Nest application successfully started
[Nest] 12345 - Server running on http://localhost:3001
```

### Terminal 2: Frontend (Vite)

Em novo terminal:

```bash
pnpm --filter web dev
```

**Output esperado**:
```
VITE v5.x ready in 450 ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.x:3000/
```

---

## Step 8: Verify Installation

### Health Check Endpoints

**Backend Health**:
```bash
curl http://localhost:3001/api/health
```

**Response esperada**:
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "anthropic": "api_key_configured"
}
```

**Frontend**:
Abra navegador em `http://localhost:3000` e verifique que aplicação carrega.

---

## Step 9: Test First Flow (End-to-End)

### 1. Create User (if not seeded)

```bash
curl -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@etp.gov.br",
    "nome": "Usuário Teste"
  }'
```

### 2. Create Project

```bash
curl -X POST http://localhost:3001/api/projetos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Projeto Teste",
    "descricao": "Meu primeiro projeto ETP",
    "cor": "#3b82f6",
    "usuarioId": "<UUID_DO_USUARIO>"
  }'
```

Guarde o `uuid` do projeto retornado.

### 3. Create Document

```bash
curl -X POST http://localhost:3001/api/documentos \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "ETP - Teste de Desenvolvimento",
    "tipo": "ETP",
    "usuarioId": "<UUID_DO_USUARIO>",
    "projetoId": "<UUID_DO_PROJETO>"
  }'
```

Guarde o `uuid` do documento retornado.

### 4. Test WebSocket Connection (Frontend)

Abra `http://localhost:3000` no navegador, vá para o documento criado, e:

1. **Clique "Novo ETP"** ou abra documento existente
2. **Inicie coleta**: Deve aparecer mensagem "Olá! Vou ajudá-lo a criar um ETP..."
3. **Envie mensagem**: "Contratação de serviços de TI"
4. **Verifique progresso**: Barra deve atualizar mostrando ~9% (1 de 11 campos)

### 5. Verify Database Persistence

```bash
pnpm --filter backend prisma studio
```

Navegue para tabela `Documento` e veja que `dadosColetados` foi atualizado com `objeto_contratacao`.

---

## Common Issues & Troubleshooting

### Issue: "Port 3001 already in use"

```bash
# Find process using port
lsof -ti:3001

# Kill process
kill -9 $(lsof -ti:3001)
```

### Issue: "Cannot connect to PostgreSQL"

Verifique que container está rodando:
```bash
docker ps | grep postgres
```

Se não estiver, inicie:
```bash
docker compose up -d postgres
```

### Issue: "Prisma Client not generated"

Regenere o client:
```bash
pnpm --filter backend prisma generate
```

### Issue: "ANTHROPIC_API_KEY not configured"

Verifique arquivo `.env` em `apps/backend/`:
```bash
cat apps/backend/.env | grep ANTHROPIC
```

Se vazio, edite e adicione sua chave.

### Issue: "WebSocket connection failed"

Verifique CORS no backend:
```typescript
// apps/backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

E verifique URL no frontend `.env`:
```
VITE_SOCKET_URL=http://localhost:3001
```

### Issue: "Redis connection refused"

Verifique que Redis está rodando:
```bash
docker ps | grep redis
```

Teste conexão manual:
```bash
redis-cli ping
# Deve retornar: PONG
```

---

## Development Workflow

### Running Tests

**Backend Unit Tests**:
```bash
pnpm --filter backend test
```

**Frontend Unit Tests**:
```bash
pnpm --filter web test
```

**E2E Tests** (requer ambos servidores rodando):
```bash
pnpm --filter web test:e2e
```

### Database Migrations

**Create new migration**:
```bash
pnpm --filter backend prisma migrate dev --name add_new_field
```

**Reset database** (⚠️ DELETA TODOS OS DADOS):
```bash
pnpm --filter backend prisma migrate reset
```

**Deploy migrations** (production):
```bash
pnpm --filter backend prisma migrate deploy
```

### Code Quality

**Lint all code**:
```bash
pnpm lint
```

**Format all code**:
```bash
pnpm format
```

**Type-check**:
```bash
pnpm type-check
```

### Build for Production

```bash
pnpm build
```

Isso gera:
- `apps/backend/dist/` - NestJS compiled
- `apps/web/dist/` - Vite optimized bundle

---

## Project Structure Quick Reference

```
ETPConstructor/
├── .claude/                    # Claude Agent SDK config
│   ├── CLAUDE.md
│   └── settings.json
│
├── apps/
│   ├── backend/                # NestJS API
│   │   ├── src/
│   │   │   ├── agentes/        # AI agents (5 specialized)
│   │   │   ├── chat/           # WebSocket gateway
│   │   │   ├── documentos/     # REST API
│   │   │   └── prisma/         # Database schema
│   │   └── .env                # ← CREATE THIS
│   │
│   └── web/                    # Vite + React
│       ├── src/
│       │   ├── components/     # UI components
│       │   ├── stores/         # Zustand state
│       │   └── services/       # API/Socket clients
│       └── .env                # ← CREATE THIS
│
├── packages/
│   ├── shared-types/           # Shared TypeScript types
│   └── config/                 # ESLint, Prettier configs
│
├── docker-compose.yml          # PostgreSQL + Redis
├── turbo.json                  # Turborepo config
└── pnpm-workspace.yaml         # pnpm workspaces
```

---

## Next Steps

Após setup completo:

1. **Explore UI**: Abra `http://localhost:3000` e teste criar um ETP manualmente
2. **Read Contracts**: Revise `specs/001-specify-scripts-bash/contracts/` para entender APIs
3. **Study Agents**: Veja implementação dos agentes em `apps/backend/src/agentes/`
4. **Customize Legal Rules**: Edite `apps/backend/src/validacao/regras-legais.config.ts`
5. **Add New Section**: Estenda `conteudoSecoes` JSON structure com nova seção

---

## Production Deployment (Future)

**Environment Variables**:
- `NODE_ENV=production`
- `DATABASE_URL` → PostgreSQL gerenciado (AWS RDS, etc)
- `REDIS_HOST` → Redis gerenciado (AWS ElastiCache, etc)
- `ANTHROPIC_API_KEY` → Armazenar em secrets manager

**Recommended Hosting**:
- **Backend**: Railway, Render, AWS ECS
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: AWS RDS (PostgreSQL)
- **Redis**: AWS ElastiCache
- **Files**: AWS S3 (substituir filesystem local)

---

## Summary

| Step | Command | Duration |
|------|---------|----------|
| 1. Clone repo | `git clone ...` | 1 min |
| 2. Install deps | `pnpm install` | 3-5 min |
| 3. Start Docker | `docker compose up -d` | 1 min |
| 4. Config .env | Manual edit | 2 min |
| 5. Migrations | `prisma migrate dev` | 1 min |
| 6. Claude SDK config | Create `.claude/` files | 1 min |
| 7. Start servers | `pnpm dev` (2 terminals) | 2 min |
| 8. Verify | Health checks + Prisma Studio | 2 min |
| **TOTAL** | | **~15 min** |

**Support**: Para problemas, consulte troubleshooting ou abra issue no repositório.

**Documentation**: 
- [Architecture](./plan.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/)
- [Research Decisions](./research.md)
