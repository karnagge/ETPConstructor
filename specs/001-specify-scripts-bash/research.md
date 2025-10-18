# Research Document: ETP Generator System

**Phase**: 0 (Outline & Research)  
**Date**: 2025-10-18  
**Status**: Complete

## Overview

Este documento resolve todas as decisões técnicas necessárias para implementação do sistema ETP Generator, incluindo setup do Claude Agent SDK, arquitetura de agentes especializados, integração Vite+React, e padrões de interface clean similar ao Claude Desktop.

---

## 1. Claude Agent SDK Integration

### Decision
Usar `@anthropic-ai/claude-agent-sdk` (TypeScript) como base para todos os agentes especializados, com modelo `claude-sonnet-4-20250514` (Sonnet 4.5).

### Rationale
- **Automatic Context Management**: SDK resolve automaticamente problema de context overflow através de compaction inteligente, crítico para conversas longas de coleta de dados (11+ campos obrigatórios)
- **Prompt Caching**: Reduz custos em 90% para system prompts repetidos (cada agente tem prompt especializado de ~2k tokens)
- **Production-Ready**: Battle-tested no Claude Code, evita reinventar infraestrutura complexa de sessões e streaming
- **Streaming Support**: Real-time feedback essencial para UX similar ao Claude Desktop (FR-004)
- **Tool Permissions**: Modelo de permissões granulares (`allowedTools`/`disallowedTools`) previne acessos não autorizados

### Alternatives Considered
- **Direct `@anthropic-ai/sdk`**: Rejeitado - requer implementar manualmente context management, prompt caching, e error handling que SDK fornece out-of-the-box
- **LangChain**: Rejeitado - overhead de abstração desnecessário, pior integração com Claude features nativas
- **Custom wrapper**: Rejeitado - tempo de desenvolvimento >2 meses para replicar funcionalidades do SDK

### Implementation Details

#### BaseAgente Pattern
```typescript
// apps/backend/src/agentes/base-agente.ts
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
      permissionMode: 'allow-listed', // Explicit whitelist
      streaming: true, // Real-time feedback
    });
  }
  
  abstract get systemPrompt(): string;
  abstract get allowedTools(): string[];
  abstract get nome(): string;
  abstract get especialidade(): string;
  
  protected async executar(mensagem: string, contexto?: any): Promise<string> {
    const response = await this.agent.run(mensagem, {
      onChunk: (chunk) => this.onStreamChunk(chunk), // Real-time progress
    });
    return response.content;
  }
  
  protected onStreamChunk(chunk: any): void {
    // Override in subclasses for real-time WebSocket emission
  }
}
```

#### Configuration Directory Structure
```
.claude/
├── settings.json           # SDK configuration
└── CLAUDE.md               # Project context for all agents
```

**`.claude/settings.json`**:
```json
{
  "hooks": {
    "onToolUse": "./scripts/log-agent-tools.sh"
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

**`.claude/CLAUDE.md`**:
```markdown
# ETP Generator Project Context

## Domain
Brazilian public procurement ETPs compliant with:
- Lei 8.666/93 (old procurement law)
- Lei 14.133/21 (new procurement law)
- IN SEGES 05/2017 (ETP requirements)
- IN SEGES 65/2021 (cost estimation)

## Critical Requirements
- All legal validations MUST pass before document completion
- 9 mandatory sections in generated document
- 11 mandatory fields in data collection
- Real-time progress via WebSocket (Socket.IO)

## Agent Specializations
1. AgenteColetorConversacional - Data collection via natural conversation
2. AgenteValidadorLegal - Legal compliance validation
3. AgenteEspecificacoesTecnicas - Technical specifications generation
4. AgenteEstimativaCustos - Cost estimation with market research
5. AgenteGestaoContratual - Contract management clauses
```

---

## 2. Vite Frontend Architecture

### Decision
Usar **Vite 5 + React 18** com Tailwind CSS e componentes shadcn/ui, sem frameworks pesados (Next.js out).

### Rationale
- **Minimalist Approach**: Alinhado com requisito do usuário "minimal libraries and a clean interface like claude desktop"
- **Fast HMR**: Vite oferece <100ms hot reload, crítico para iteração rápida de UI
- **No SSR Overhead**: ETP Generator é application interna (não precisa SEO), Vite é suficiente
- **Bundle Size**: Build otimizado <200kb gzipped vs ~1MB de Next.js

### Alternatives Considered
- **Next.js 14**: Rejeitado - overhead desnecessário de SSR/App Router para app interno sem requisitos de SEO
- **Create React App**: Rejeitado - deprecated, build lento (Webpack), comunidade migrando para Vite
- **Solid.js**: Rejeitado - ecossistema menor, equipe já familiar com React

### Implementation Details

#### Vite Configuration
```typescript
// apps/web/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/shared-types/src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001', // Backend NestJS
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true, // WebSocket proxy
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-editor': ['@tiptap/react', '@tiptap/starter-kit'],
        },
      },
    },
  },
});
```

#### UI Component Strategy
- **shadcn/ui**: Copy-paste components (Dialog, DropdownMenu, Button) - não adiciona runtime weight
- **Tailwind CSS**: Utility-first CSS - purge unused classes em production
- **Lucide React**: Icons minimalistas (substituir heroicons se necessário)

---

## 3. Claude Desktop-Inspired UI Patterns

### Decision
Replicar layout limpo do Claude Desktop: sidebar esquerda (projetos), área central (chat/document), sidebar direita (conformidade legal).

### Rationale
- **Familiar UX**: Usuários técnicos já familiarizados com Claude Desktop não têm curva de aprendizado
- **Focus on Content**: Design minimalista mantém foco no chat e documento gerado
- **Progressive Disclosure**: Sidebar direita colapsa por padrão, expande apenas quando há alertas legais

### Implementation Details

#### Layout Structure
```tsx
// apps/web/src/App.tsx
import { LeftSidebar } from '@/components/sidebar/LeftSidebar';
import { RightSidebar } from '@/components/sidebar/RightSidebar';
import { MainContent } from '@/components/MainContent';

export default function App() {
  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Left Sidebar: Projects + Documents */}
      <LeftSidebar className="w-64 border-r border-neutral-200" />
      
      {/* Main Content: Chat or Document Editor */}
      <MainContent className="flex-1" />
      
      {/* Right Sidebar: Legal Compliance (collapsible) */}
      <RightSidebar className="w-80 border-l border-neutral-200" />
    </div>
  );
}
```

#### Color Palette (Inspired by Claude Desktop)
```css
/* apps/web/src/index.css */
:root {
  --bg-primary: #fafafa;        /* neutral-50 */
  --bg-secondary: #ffffff;      /* white */
  --text-primary: #171717;      /* neutral-900 */
  --text-secondary: #737373;    /* neutral-500 */
  --border-default: #e5e5e5;    /* neutral-200 */
  --accent-blue: #3b82f6;       /* blue-500 */
  --accent-green: #22c55e;      /* green-500 */
  --accent-red: #ef4444;        /* red-500 */
}
```

#### Chat Message Component
```tsx
// apps/web/src/components/chat/MessageBubble.tsx
interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  return (
    <div className={cn(
      'px-4 py-3 rounded-lg max-w-2xl',
      role === 'user' 
        ? 'bg-blue-500 text-white ml-auto' 
        : 'bg-white border border-neutral-200'
    )}>
      <p className="text-sm">{content}</p>
    </div>
  );
}
```

---

## 4. Multi-Agent Orchestration Pattern

### Decision
Implementar orquestrador que executa agentes especializados em **paralelo** quando possível, com fallback graceful em caso de erro de agente individual.

### Rationale
- **Performance**: Executar AgenteEspecificacoesTecnicas, AgenteEstimativaCustos, AgenteGestaoContratual em paralelo reduz tempo de geração de ~6min para ~2min (FR-008)
- **Resilience**: Falha em agente não crítico (ex: AgenteGestaoContratual) não deve bloquear geração completa
- **Observability**: Progresso granular por agente (10% → 30% → 60% → 80% → 90% → 100%) via WebSocket

### Implementation Details

#### Orchestrator Service
```typescript
// apps/backend/src/agentes/orquestrador-multi-agente.service.ts
import { Injectable } from '@nestjs/common';
import { AgenteEspecificacoesTecnicas } from './agente-especificacoes-tecnicas.service';
import { AgenteEstimativaCustos } from './agente-estimativa-custos.service';
import { AgenteGestaoContratual } from './agente-gestao-contratual.service';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class OrquestradorMultiAgenteService {
  constructor(
    private readonly especificacoesAgente: AgenteEspecificacoesTecnicas,
    private readonly custosAgente: AgenteEstimativaCustos,
    private readonly gestaoAgente: AgenteGestaoContratual,
    private readonly chatGateway: ChatGateway,
  ) {}
  
  async gerarSecoes(dadosColetados: any, clientId: string): Promise<any> {
    // Phase 1: Validação inicial (10%)
    this.emitProgress(clientId, 10, 'Validação Inicial');
    
    // Phase 2: Execução paralela de agentes (30%)
    this.emitProgress(clientId, 30, 'Análise Especializada');
    
    const [especificacoes, custos, gestao] = await Promise.allSettled([
      this.especificacoesAgente.executar(dadosColetados),
      this.custosAgente.executar(dadosColetados),
      this.gestaoAgente.executar(dadosColetados),
    ]);
    
    // Handle individual agent failures gracefully
    const conteudoSecoes = {
      especificacoes: especificacoes.status === 'fulfilled' 
        ? especificacoes.value 
        : { erro: 'Falha ao gerar especificações' },
      custos: custos.status === 'fulfilled' 
        ? custos.value 
        : { erro: 'Falha ao estimar custos' },
      gestao: gestao.status === 'fulfilled' 
        ? gestao.value 
        : { erro: 'Falha ao gerar gestão' },
    };
    
    // Phase 3: Montagem do documento (60%)
    this.emitProgress(clientId, 60, 'Montagem do Documento');
    
    // Continue with document assembly...
    return conteudoSecoes;
  }
  
  private emitProgress(clientId: string, percent: number, phase: string): void {
    this.chatGateway.server.to(clientId).emit('progresso_geracao', {
      percent,
      phase,
      timestamp: new Date().toISOString(),
    });
  }
}
```

#### Agent Execution Pattern
```typescript
// Example: AgenteEspecificacoesTecnicas
export class AgenteEspecificacoesTecnicas extends BaseAgente {
  get systemPrompt(): string {
    return `Você é um especialista em especificações técnicas para licitações públicas brasileiras.
    
    Sua tarefa é gerar a seção "3. ESPECIFICAÇÕES TÉCNICAS" de um ETP, incluindo:
    - Requisitos obrigatórios (normas ABNT aplicáveis)
    - Critérios de aceitação quantitativos
    - Especificações de desempenho
    
    Responda SEMPRE em JSON no formato:
    {
      "requisitosObrigatorios": ["...", "..."],
      "normasTecnicas": ["ABNT NBR ...", "..."],
      "criteriosAceitacao": ["...", "..."]
    }`;
  }
  
  get allowedTools(): string[] {
    return []; // No external tools for MVP
  }
  
  async executar(dadosColetados: any): Promise<any> {
    const prompt = `Gere especificações técnicas para:
    Objeto: ${dadosColetados.objeto_contratacao}
    Descrição: ${dadosColetados.descricao_detalhada}
    Requisitos: ${JSON.stringify(dadosColetados.requisitos_tecnicos || [])}`;
    
    const response = await super.executar(prompt, dadosColetados);
    return this.parseJSON(response);
  }
  
  private parseJSON(response: string): any {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response;
    return JSON.parse(jsonStr);
  }
}
```

---

## 5. Real-Time WebSocket Architecture

### Decision
Usar **Socket.IO** (não WebSocket nativo) com rooms por documento para isolar sessões.

### Rationale
- **Auto-Reconnection**: Socket.IO implementa reconnection automática com exponential backoff
- **Fallback**: Degrada para long-polling se WebSocket não disponível (firewalls corporativos)
- **Rooms**: Isolar eventos por documento (múltiplos usuários editando ETPs diferentes)
- **Type Safety**: `@nestjs/platform-socket.io` integra com NestJS decorators

### Implementation Details

#### Chat Gateway (Backend)
```typescript
// apps/backend/src/chat/chat.gateway.ts
import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  
  @SubscribeMessage('iniciar_coleta')
  async handleIniciarColeta(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentoId: string },
  ) {
    // Join room specific to this document
    client.join(`doc-${data.documentoId}`);
    
    // Send welcome message
    this.server.to(`doc-${data.documentoId}`).emit('mensagem_assistente', {
      content: 'Olá! Vou ajudá-lo a criar um Estudo Técnico Preliminar. Para começar, qual é o objeto da contratação?',
      timestamp: new Date().toISOString(),
    });
  }
  
  @SubscribeMessage('enviar_mensagem')
  async handleEnviarMensagem(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentoId: string; mensagem: string },
  ) {
    // Process message with AgenteColetorConversacional
    const room = `doc-${data.documentoId}`;
    // ... agent processing ...
    
    // Emit response to room
    this.server.to(room).emit('mensagem_assistente', {
      content: 'Entendi. Agora, pode descrever detalhadamente o serviço?',
      timestamp: new Date().toISOString(),
    });
  }
}
```

#### Socket Service (Frontend)
```typescript
// apps/web/src/services/socket.service.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  
  connect(): void {
    this.socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'], // Fallback
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
    
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });
    
    this.socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
    });
  }
  
  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }
  
  emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }
  
  disconnect(): void {
    this.socket?.disconnect();
  }
}

export const socketService = new SocketService();
```

---

## 6. DOCX Generation Strategy

### Decision
Usar biblioteca **docx** (npm) para gerar arquivos .docx programaticamente, com templates pré-definidos para as 9 seções.

### Rationale
- **Type Safety**: docx library é TypeScript-first, oferece type-safe builders para parágrafos, tabelas, headers
- **Standard Compliance**: Gera OpenXML válido compatível com MS Word e LibreOffice (SC-004)
- **No External Dependencies**: Não requer LibreOffice/Pandoc instalado no servidor

### Alternatives Considered
- **docxtemplater**: Rejeitado - requer templates .docx manuais, dificulta versionamento de estrutura
- **html-docx-js**: Rejeitado - qualidade de output inferior, problemas com formatação complexa
- **Pandoc**: Rejeitado - dependency externa pesada, requer instalação no servidor

### Implementation Details

#### DOCX Builder Service
```typescript
// apps/backend/src/geracao/docx-builder.service.ts
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';

@Injectable()
export class DocxBuilderService {
  async gerarDocumento(conteudoSecoes: any, metadata: any): Promise<Buffer> {
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1" = 1440 twips
          },
        },
        headers: {
          default: this.criarHeader(metadata),
        },
        children: [
          // Título principal
          new Paragraph({
            text: 'ESTUDO TÉCNICO PRELIMINAR',
            heading: HeadingLevel.TITLE,
            alignment: 'center',
          }),
          
          // Seção 1: Definição do Objeto
          ...this.criarSecao1(conteudoSecoes.definicaoObjeto),
          
          // Seção 2: Justificativa
          ...this.criarSecao2(conteudoSecoes.justificativa),
          
          // Seção 3: Especificações Técnicas
          ...this.criarSecao3(conteudoSecoes.especificacoes),
          
          // ... demais seções ...
        ],
      }],
    });
    
    return await Packer.toBuffer(doc);
  }
  
  private criarSecao3(especificacoes: any): Paragraph[] {
    return [
      new Paragraph({
        text: '3. ESPECIFICAÇÕES TÉCNICAS',
        heading: HeadingLevel.HEADING_1,
      }),
      
      new Paragraph({
        text: '3.1 Requisitos Obrigatórios',
        heading: HeadingLevel.HEADING_2,
      }),
      
      ...especificacoes.requisitosObrigatorios.map((req: string) => 
        new Paragraph({
          text: req,
          bullet: { level: 0 },
        })
      ),
      
      // ... demais subseções ...
    ];
  }
  
  private criarHeader(metadata: any): any {
    // Header com logo e informações do órgão
    // ...
  }
}
```

---

## 7. Legal Validation Rules Engine

### Decision
Implementar regras de validação legal como **funções puras** em TypeScript, externalizadas em arquivo de configuração separado.

### Rationale
- **Maintainability**: Regras legais mudam (novas leis, jurisprudência), devem ser fáceis de atualizar
- **Testability**: Funções puras facilitam unit tests (input → output determinístico)
- **Auditability**: Cada regra referencia artigo específico da lei, rastreável em ValidacaoLegal table

### Implementation Details

#### Rules Configuration
```typescript
// apps/backend/src/validacao/regras-legais.config.ts
export interface RegraLegal {
  id: string;
  descricao: string;
  fundamentacao: string; // Ex: "Lei 14.133/21, Art. 75, §1º"
  validar: (dados: any) => { valido: boolean; observacoes?: string };
}

export const REGRAS_LEGAIS: RegraLegal[] = [
  {
    id: 'valor_modalidade',
    descricao: 'Valor estimado compatível com modalidade de licitação',
    fundamentacao: 'Lei 14.133/21, Art. 75',
    validar: (dados) => {
      if (!dados.modalidade_licitacao || !dados.valor_estimado) {
        return { valido: true }; // Opcional, não bloqueia
      }
      
      const limites = {
        'dispensa': 50000,
        'inexigibilidade': Infinity,
        'pregao': Infinity,
        'concorrencia': Infinity,
      };
      
      const limite = limites[dados.modalidade_licitacao] || Infinity;
      const valido = dados.valor_estimado <= limite;
      
      return {
        valido,
        observacoes: valido ? undefined : 
          `Valor R$ ${dados.valor_estimado.toLocaleString()} excede limite de R$ ${limite.toLocaleString()} para modalidade ${dados.modalidade_licitacao}`,
      };
    },
  },
  
  {
    id: 'prazo_minimo',
    descricao: 'Prazo de execução deve ser ≥ 30 dias',
    fundamentacao: 'IN SEGES 05/2017, Art. 7º',
    validar: (dados) => {
      if (!dados.prazo_execucao || !dados.prazo_unidade) {
        return { valido: true };
      }
      
      // Convert to days
      const diasMultiplicador = { dias: 1, meses: 30, anos: 365 };
      const diasTotais = dados.prazo_execucao * (diasMultiplicador[dados.prazo_unidade] || 1);
      
      const valido = diasTotais >= 30;
      return {
        valido,
        observacoes: valido ? undefined : 
          `Prazo de ${diasTotais} dias é inferior ao mínimo de 30 dias`,
      };
    },
  },
  
  // ... 15+ regras adicionais ...
];
```

#### Validation Service
```typescript
// apps/backend/src/validacao/validacao-legal.service.ts
import { Injectable } from '@nestjs/common';
import { REGRAS_LEGAIS } from './regras-legais.config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ValidacaoLegalService {
  constructor(private readonly prisma: PrismaService) {}
  
  async validarDados(documentoId: string, dados: any): Promise<any> {
    const resultados = REGRAS_LEGAIS.map(regra => {
      const resultado = regra.validar(dados);
      return {
        regra: regra.descricao,
        fundamentacao: regra.fundamentacao,
        valido: resultado.valido,
        observacoes: resultado.observacoes,
      };
    });
    
    // Persist validations
    await this.prisma.validacaoLegal.createMany({
      data: resultados.map(r => ({
        documentoId,
        secaoId: 'dados_coletados',
        regra: r.regra,
        valido: r.valido,
        observacoes: r.observacoes,
      })),
    });
    
    // Calculate compliance percentage
    const totalRegras = resultados.length;
    const regrasValidas = resultados.filter(r => r.valido).length;
    const percentualConformidade = Math.round((regrasValidas / totalRegras) * 100);
    
    return {
      percentualConformidade,
      alertas: resultados.filter(r => !r.valido && !this.isCritico(r)),
      errosCriticos: resultados.filter(r => !r.valido && this.isCritico(r)),
    };
  }
  
  private isCritico(resultado: any): boolean {
    // Erros críticos que bloqueiam geração
    const regrasCriticas = ['valor_modalidade', 'prazo_minimo'];
    return regrasCriticas.includes(resultado.regra);
  }
}
```

---

## 8. Database Schema (Prisma)

### Decision
Usar **Prisma ORM** com PostgreSQL 15, schema normalizado com relacionamentos explícitos.

### Rationale
- **Type Safety**: Prisma Client gerado oferece tipos TypeScript completos para queries
- **Migration Management**: Prisma Migrate versionamento de schema em SQL puro
- **Performance**: Query optimizer inteligente, lazy loading automático

### Implementation Details

```prisma
// apps/backend/src/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Usuario {
  id        String   @id @default(uuid())
  email     String   @unique
  nome      String
  criadoEm  DateTime @default(now())
  
  projetos   Projeto[]
  documentos Documento[]
}

model Projeto {
  id        String   @id @default(uuid())
  uuid      String   @unique @default(uuid()) // Public-facing ID
  nome      String
  descricao String?
  cor       String   @default("#3b82f6")
  criadoEm  DateTime @default(now())
  
  usuarioId String
  usuario   Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  
  documentos Documento[]
}

model Documento {
  id               String   @id @default(uuid())
  uuid             String   @unique @default(uuid())
  titulo           String
  tipo             String   @default("ETP")
  status           StatusDocumento @default(RASCUNHO)
  dadosColetados   Json     @default("{}")
  conteudoSecoes   Json     @default("{}")
  caminhoDocx      String?
  caminhoPdf       String?
  criadoEm         DateTime @default(now())
  atualizadoEm     DateTime @updatedAt
  concluidoEm      DateTime?
  
  usuarioId String
  usuario   Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  
  projetoId String?
  projeto   Projeto? @relation(fields: [projetoId], references: [id], onDelete: SetNull)
  
  versoes    VersaoDocumento[]
  validacoes ValidacaoLegal[]
}

enum StatusDocumento {
  RASCUNHO
  EM_GERACAO
  CONCLUIDO
  ARQUIVADO
}

model VersaoDocumento {
  id             String   @id @default(uuid())
  numeroVersao   Int
  conteudoSecoes Json
  alteracoes     String?
  criadoEm       DateTime @default(now())
  
  documentoId String
  documento   Documento @relation(fields: [documentoId], references: [id], onDelete: Cascade)
  
  @@unique([documentoId, numeroVersao])
}

model ValidacaoLegal {
  id          String   @id @default(uuid())
  secaoId     String   // Ex: "3_especificacoes", "dados_coletados"
  regra       String
  valido      Boolean
  observacoes String?
  criadoEm    DateTime @default(now())
  
  documentoId String
  documento   Documento @relation(fields: [documentoId], references: [id], onDelete: Cascade)
}
```

---

## 9. Development Workflow Tools

### Decision
Usar **Docker Compose** para local development, com serviços PostgreSQL, Redis, e hot-reload para backend/frontend.

### Rationale
- **Environment Parity**: Dev environment idêntico ao production
- **Zero Config**: `docker compose up` inicia todos os serviços necessários
- **Isolation**: Cada desenvolvedor tem database isolada, sem conflitos

### Implementation Details

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: etp_user
      POSTGRES_PASSWORD: etp_password
      POSTGRES_DB: etp_generator
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
  
  # Backend runs natively for hot-reload (not in container)
  # Frontend runs natively for hot-reload (not in container)

volumes:
  postgres_data:
  redis_data:
```

**Development Commands**:
```json
// package.json (root)
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "db:migrate": "pnpm --filter backend prisma migrate dev",
    "db:studio": "pnpm --filter backend prisma studio"
  }
}
```

---

## 10. Testing Strategy

### Decision
Implementar testes em 3 níveis: **Unit** (services), **Integration** (APIs), **E2E** (fluxos críticos).

### Rationale
- **Unit Tests**: Validar lógica de negócio isolada (regras legais, parsing de respostas de agentes)
- **Integration Tests**: Garantir contratos de API e WebSocket funcionando end-to-end
- **E2E Tests**: Validar user stories completas (US1: coleta conversacional)

### Implementation Details

#### Unit Test Example
```typescript
// apps/backend/src/validacao/regras-legais.spec.ts
import { REGRAS_LEGAIS } from './regras-legais.config';

describe('Regras Legais', () => {
  describe('valor_modalidade', () => {
    const regra = REGRAS_LEGAIS.find(r => r.id === 'valor_modalidade')!;
    
    it('deve validar valor dentro do limite para dispensa', () => {
      const resultado = regra.validar({
        modalidade_licitacao: 'dispensa',
        valor_estimado: 40000,
      });
      
      expect(resultado.valido).toBe(true);
    });
    
    it('deve rejeitar valor acima do limite para dispensa', () => {
      const resultado = regra.validar({
        modalidade_licitacao: 'dispensa',
        valor_estimado: 60000,
      });
      
      expect(resultado.valido).toBe(false);
      expect(resultado.observacoes).toContain('excede limite');
    });
  });
});
```

#### Integration Test Example
```typescript
// apps/backend/test/integration/documentos.e2e-spec.ts
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Documentos API (e2e)', () => {
  let app;
  
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleRef.createNestApplication();
    await app.init();
  });
  
  it('/api/documentos (POST) deve criar novo documento', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/documentos')
      .send({ titulo: 'Teste ETP', tipo: 'ETP' })
      .expect(201);
    
    expect(response.body).toHaveProperty('uuid');
    expect(response.body.status).toBe('RASCUNHO');
  });
});
```

#### E2E Test Example
```typescript
// apps/web/e2e/flows/create-etp.spec.ts
import { test, expect } from '@playwright/test';

test('deve completar fluxo de criação de ETP', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000');
  
  // Click "Novo ETP"
  await page.click('button:has-text("Novo ETP")');
  
  // Wait for chat to load
  await expect(page.locator('.chat-window')).toBeVisible();
  
  // Send first message
  await page.fill('textarea[placeholder="Digite sua mensagem..."]', 
    'Contratação de serviços de desenvolvimento de software');
  await page.press('textarea', 'Enter');
  
  // Wait for assistant response
  await expect(page.locator('.message-assistant').last()).toContainText(
    'descrição detalhada'
  );
  
  // Continue conversation...
  // Assert progress reaches 100%
  await expect(page.locator('.progress-bar')).toHaveAttribute('aria-valuenow', '100');
  
  // Click "Gerar ETP"
  await page.click('button:has-text("Gerar ETP")');
  
  // Wait for generation to complete
  await expect(page.locator('button:has-text("Baixar")')).toBeVisible({ timeout: 180000 });
});
```

---

## Summary of Research Outcomes

| Topic | Decision | Primary Benefit |
|-------|----------|-----------------|
| AI Framework | Claude Agent SDK (TypeScript) | Automatic context management + prompt caching |
| Frontend | Vite + React (no Next.js) | Minimal bundle size, fast HMR |
| UI Design | Claude Desktop-inspired layout | Familiar UX for technical users |
| Backend | NestJS + Prisma + Socket.IO | Type-safe API, real-time communication |
| Document Generation | docx library | Pure TypeScript, no external dependencies |
| Legal Validation | Pure functions in config file | Easy to maintain and test |
| Database | PostgreSQL + Prisma ORM | Strong typing, migration management |
| Dev Environment | Docker Compose | Environment parity, zero config |
| Testing | Jest + Playwright (3-level strategy) | Coverage of unit, integration, E2E |

All research items resolved. Ready to proceed to Phase 1 (Design & Contracts).
