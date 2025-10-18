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

## 🎯 Roadmap

- [x] MVP: Coleta conversacional + Geração de documentos
- [ ] Organização por projetos
- [ ] Edição com TipTap + Versionamento
- [ ] Validação legal contínua com painel
- [ ] Exportação PDF otimizada
- [ ] Autenticação e multi-tenancy
- [ ] Templates personalizados
- [ ] Integração com sistemas de compras governamentais

---

Desenvolvido com ❤️ para modernizar processos de licitações públicas no Brasil.
