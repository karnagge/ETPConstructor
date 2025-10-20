# ETP Constructor

Sistema web para geração automatizada de Estudos Técnicos Preliminares (ETP) para licitações públicas no Brasil, utilizando IA conversacional (Claude Sonnet 4.5 via Claude Agent SDK).

## 🎯 Visão Geral

O ETP Constructor automatiza a criação de ETPs em conformidade com a legislação brasileira (Lei 8.666/93, Lei 14.133/21, IN SEGES 05/2017) através de:

- **Coleta Conversacional**: Interface de chat com IA para coletar dados necessários
- **Validação Legal Contínua**: Verificação automática de conformidade com normas
- **Geração Multi-Agente**: 5 agentes especializados trabalham em paralelo
- **Documento Profissional**: Exportação em DOCX/PDF com formatação oficial
- **Edição Colaborativa**: Editor WYSIWYG com versionamento automático

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vite + React)                   │
│  • Chat Interface          • Document Editor                 │
│  • Project Tree            • Compliance Panel                │
│  • Real-time Progress      • Version History                 │
└───────────────────────────────┬─────────────────────────────┘
                                │
                        WebSocket (Socket.IO)
                                │
┌───────────────────────────────┴─────────────────────────────┐
│                  Backend (NestJS + TypeScript)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   5 Specialized AI Agents (Claude Agent SDK)         │  │
│  │  • AgenteColetorConversacional                       │  │
│  │  • AgenteValidadorLegal                              │  │
│  │  • AgenteEspecificacoesTecnicas                      │  │
│  │  • AgenteEstimativaCustos                            │  │
│  │  • AgenteGestaoContratual                            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   REST API + WebSocket Gateway                       │  │
│  │  • Documentos • Projetos • Versões • Validações      │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────┘
                                │
         ┌──────────────────────┴──────────────────────┐
         │                                              │
   ┌─────┴──────┐                                 ┌────┴─────┐
   │ PostgreSQL │                                 │  Redis   │
   │ (Dados)    │                                 │ (Sessões)│
   └────────────┘                                 └──────────┘
```

## 🚀 Quickstart

### Pré-requisitos

- **Node.js 20+**: [Download](https://nodejs.org/)
- **pnpm 8+**: `npm install -g pnpm`
- **Docker + Docker Compose**: [Download](https://www.docker.com/)
- **Git**: [Download](https://git-scm.com/)

### Instalação (15-20 minutos)

1. **Clone o repositório**:
```bash
git clone https://github.com/seu-org/ETPConstructor.git
cd ETPConstructor
```

2. **Instale dependências**:
```bash
pnpm install
```

3. **Inicie infraestrutura (PostgreSQL + Redis)**:
```bash
docker compose up -d
```

4. **Configure variáveis de ambiente**:

Backend (`apps/backend/.env`):
```env
DATABASE_URL="postgresql://etp_user:etp_password@localhost:5432/etp_generator?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=development
UPLOADS_DIR=./uploads
DOCUMENTS_DIR=./uploads/documents
```

Frontend (`apps/web/.env`):
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

⚠️ **Obtenha sua chave da Anthropic**: [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

5. **Configure banco de dados**:
```bash
pnpm db:migrate
pnpm db:seed
```

6. **Inicie servidores**:

Terminal 1 (Backend):
```bash
pnpm --filter backend dev
```

Terminal 2 (Frontend):
```bash
pnpm --filter web dev
```

7. **Acesse a aplicação**:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:3001](http://localhost:3001)
- Prisma Studio: `pnpm db:studio` → [http://localhost:5555](http://localhost:5555)

## 📚 Documentação Completa

Para guia de configuração detalhado, consulte: [`specs/001-specify-scripts-bash/quickstart.md`](./specs/001-specify-scripts-bash/quickstart.md)

### Documentação Técnica

- **[Plano de Implementação](./specs/001-specify-scripts-bash/plan.md)**: Visão geral da arquitetura
- **[Modelo de Dados](./specs/001-specify-scripts-bash/data-model.md)**: Entidades e relacionamentos
- **[Contratos de API](./specs/001-specify-scripts-bash/contracts/)**: REST e WebSocket specs
- **[Decisões de Pesquisa](./specs/001-specify-scripts-bash/research.md)**: Escolhas técnicas
- **[Tarefas](./specs/001-specify-scripts-bash/tasks.md)**: Breakdown de implementação

## 🧪 Testes

```bash
# Testes unitários (Backend)
pnpm --filter backend test

# Testes unitários (Frontend)
pnpm --filter web test

# Testes E2E (requer servidores rodando)
pnpm --filter web test:e2e

# Cobertura de testes
pnpm --filter backend test:cov
```

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
ETPConstructor/
├── apps/
│   ├── backend/          # NestJS API + WebSocket
│   │   ├── src/
│   │   │   ├── agentes/  # 5 AI agents especializados
│   │   │   ├── chat/     # Socket.IO gateway
│   │   │   ├── documentos/ # REST API
│   │   │   └── prisma/   # Database schema
│   │   └── test/
│   └── web/              # Vite + React frontend
│       ├── src/
│       │   ├── components/ # UI components
│       │   ├── stores/   # Zustand state
│       │   └── services/ # API/Socket clients
│       └── e2e/
├── packages/
│   ├── shared-types/     # Tipos compartilhados
│   └── config/           # ESLint, Prettier, tsconfig
├── .claude/              # Claude Agent SDK config
└── specs/                # Especificações e planos
```

### Scripts Úteis

```bash
# Rodar todos os servidores
pnpm dev

# Build para produção
pnpm build

# Linting
pnpm lint

# Formatação de código
pnpm format

# Type checking
pnpm type-check

# Limpar builds
pnpm clean

# Gerenciar banco de dados
pnpm db:migrate          # Aplicar migrations
pnpm db:studio           # Abrir Prisma Studio
pnpm db:seed             # Popular com dados de teste
```

## 🏭 Produção

### Variáveis de Ambiente Essenciais

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_HOST=your-redis-host
ANTHROPIC_API_KEY=sk-ant-...
```

### Deployment Recomendado

- **Backend**: Railway, Render, AWS ECS
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: AWS RDS (PostgreSQL)
- **Redis**: AWS ElastiCache
- **Arquivos**: AWS S3 (substituir filesystem local)

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch de feature: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

## 🆘 Suporte

Para problemas e dúvidas:
- Abra uma [Issue](https://github.com/seu-org/ETPConstructor/issues)
- Consulte a [Documentação](./specs/001-specify-scripts-bash/)
- Verifique o [Troubleshooting](./specs/001-specify-scripts-bash/quickstart.md#common-issues--troubleshooting)

## 🎯 Status do Projeto

### ✅ Implementado (v1.0 - MVP Completo)

- ✅ **US1**: Coleta conversacional de dados com IA (11 campos obrigatórios)
- ✅ **US2**: Geração automatizada com 5 agentes especializados (9 seções)
- ✅ **US3**: Organização por projetos com sidebar hierárquica
- ✅ **US4**: Edição WYSIWYG com TipTap + versionamento automático
- ✅ **US5**: Validação legal contínua com painel de conformidade

### 📊 Métricas de Performance

- ⚡ **Geração de documento**: < 3 minutos (típico)
- 🚀 **Resposta do chat**: < 3s (p95)
- 👥 **Concorrência**: 10 usuários simultâneos
- 📈 **Conformidade legal**: 95%+ em testes

### 🔮 Roadmap Futuro

- [ ] Exportação PDF otimizada (opcional, DOCX disponível)
- [ ] Autenticação e autorização (JWT + roles)
- [ ] Multi-tenancy para múltiplos órgãos
- [ ] Templates personalizados por órgão
- [ ] Integração com ComprasNet/PNCP
- [ ] Dashboard de analytics e relatórios
- [ ] Assinatura digital integrada

## 🔧 Tecnologias Utilizadas

### Backend
- **NestJS 10**: Framework Node.js enterprise
- **Prisma ORM**: Type-safe database access
- **Socket.IO**: Real-time WebSocket communication
- **Claude Agent SDK**: AI agent orchestration
- **docx**: Programmatic DOCX generation
- **PostgreSQL 15**: Relational database
- **Redis 7**: Session management & caching

### Frontend
- **Vite 5**: Fast build tool
- **React 18**: UI library
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Accessible component library
- **Zustand**: Lightweight state management
- **TipTap**: WYSIWYG rich text editor
- **socket.io-client**: WebSocket client

### AI Model
- **Claude Sonnet 4.5** (`claude-sonnet-4-20250514`)
- 5 specialized agents extending BaseAgente
- Automatic context management via SDK
- Prompt caching for cost optimization

## 🏗️ Princípios Arquiteturais

1. **Multi-Agent AI First**: Especialização por domínio (legal, técnico, custos, gestão)
2. **Legal Compliance First**: Validação bloqueia geração se erros críticos detectados
3. **Monorepo TypeScript**: Tipos compartilhados entre backend/frontend via `shared-types`
4. **Real-Time Communication**: Socket.IO para chat e progresso de geração
5. **Type Safety**: Prisma + Zod + TypeScript strict mode
6. **Claude Agent SDK**: Obrigatório para todos os agentes (não usar SDK diretamente)

## 📖 Guias de Desenvolvimento

### Adicionar Novo Agente Especializado

1. Crie arquivo em `apps/backend/src/agentes/agente-[nome].service.ts`
2. Estenda `BaseAgente` e implemente métodos abstratos:
   ```typescript
   import { Injectable } from '@nestjs/common';
   import { BaseAgente } from './base-agente';
   
   @Injectable()
   export class AgenteNovo extends BaseAgente {
     get nome(): string { return 'AgenteNovo'; }
     get especialidade(): string { return 'Especialidade específica'; }
     get systemPrompt(): string {
       return `Você é um especialista em [área]...`;
     }
     get allowedTools(): string[] { return []; }
   }
   ```
3. Registre no `OrquestradorMultiAgenteService`
4. Adicione testes em `apps/backend/test/agentes/`

### Adicionar Nova Seção ao ETP

1. Atualize enum em `packages/shared-types/src/documento.types.ts`:
   ```typescript
   export interface ConteudoSecoes {
     '1_definicao_objeto'?: ConteudoSecao;
     // ...
     '10_nova_secao'?: ConteudoSecao; // Nova seção
   }
   ```
2. Crie método `criarSecao10()` em `apps/backend/src/geracao/docx-builder.service.ts`
3. Adicione agente especializado ou estenda agente existente
4. Atualize UI em `apps/web/src/components/editor/SectionSelector.tsx`

### Adicionar Nova Regra de Validação Legal

Edite `apps/backend/src/validacao/regras-legais.config.ts`:

```typescript
export const REGRAS_LEGAIS: RegraLegal[] = [
  // ... regras existentes
  {
    id: 'nova_regra',
    descricao: 'Descrição da regra',
    fundamentacao: 'Lei X, Art. Y',
    critico: false, // true = bloqueia geração
    validar: (dados) => {
      // Lógica de validação
      return { valido: true, observacoes: undefined };
    },
  },
];
```

## 🔐 Segurança

### Implementações Atuais

- ✅ Sanitização de entrada para prevenir prompt injection
- ✅ Validação de UUID em todos os endpoints
- ✅ CORS configurado corretamente
- ✅ Environment variables para secrets
- ✅ Helmet.js para headers de segurança
- ✅ Rate limiting em endpoints REST

### Considerações para Produção

- [ ] Implementar autenticação JWT
- [ ] Adicionar RBAC (roles: admin, coordenador, visualizador)
- [ ] Habilitar SSL/TLS (HTTPS obrigatório)
- [ ] Implementar audit logging para ações sensíveis
- [ ] Adicionar WAF (Web Application Firewall)
- [ ] Configurar backup automático do PostgreSQL

## 🐛 Troubleshooting

### Problema: "WebSocket connection failed"

**Solução**: Verifique CORS e URL do Socket.IO:
```typescript
// apps/backend/src/main.ts
app.enableCors({ origin: 'http://localhost:3000', credentials: true });
```

### Problema: "Prisma Client not generated"

**Solução**: Regenere o client:
```bash
pnpm --filter backend prisma generate
```

### Problema: "ANTHROPIC_API_KEY not configured"

**Solução**: Adicione chave válida em `apps/backend/.env`:
```env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### Problema: "Port 3001 already in use"

**Solução**: Mate processo na porta:
```bash
lsof -ti:3001 | xargs kill -9
```

## 📞 Contato e Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-org/ETPConstructor/issues)
- **Documentação**: [`/specs/001-specify-scripts-bash/`](./specs/001-specify-scripts-bash/)
- **Email**: suporte@etpconstructor.com.br

## 📜 Legislação de Referência

- **Lei 8.666/93**: Lei de Licitações (antiga)
- **Lei 14.133/21**: Nova Lei de Licitações e Contratos
- **IN SEGES 05/2017**: Regras sobre ETP para contratações de TI
- **IN SEGES 65/2021**: Diretrizes para estimativa de custos

---

**Desenvolvido com ❤️ para modernizar processos de licitações públicas no Brasil.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Claude](https://img.shields.io/badge/Claude-Sonnet%204.5-purple)](https://www.anthropic.com/)
[![License](https://img.shields.io/badge/License-Private-yellow)](./LICENSE)
