# Data Model: ETP Generator System

**Phase**: 1 (Design & Contracts)  
**Date**: 2025-10-18  
**Status**: Complete

## Overview

Este documento define o modelo de dados completo do sistema ETP Generator, incluindo entidades principais, relacionamentos, validações e schema Prisma final para implementação.

---

## Entity Relationship Diagram

```
┌──────────────┐
│   Usuario    │
│──────────────│
│ id (PK)      │
│ email (UQ)   │◄──┐
│ nome         │   │
│ criadoEm     │   │
└──────────────┘   │
       │           │
       │ 1:N       │ 1:N
       │           │
       ▼           │
┌──────────────┐   │
│   Projeto    │   │
│──────────────│   │
│ id (PK)      │   │
│ uuid (UQ)    │◄──┤
│ nome         │   │
│ descricao    │   │
│ cor          │   │
│ usuarioId FK │───┘
│ criadoEm     │
└──────────────┘
       │
       │ 1:N
       │
       ▼
┌──────────────────┐
│   Documento      │
│──────────────────│
│ id (PK)          │
│ uuid (UQ)        │
│ titulo           │
│ tipo             │
│ status (enum)    │◄──────┐
│ dadosColetados   │       │
│ conteudoSecoes   │       │ 1:N
│ caminhoDocx      │       │
│ caminhoPdf       │       ├──────────────────┐
│ usuarioId FK     │       │                  │
│ projetoId FK     │       │                  │
│ criadoEm         │       │                  │
│ atualizadoEm     │       │                  │
│ concluidoEm      │       │                  │
└──────────────────┘       │                  │
                           │                  │
                ┌──────────┴─────────┐        │
                │                    │        │
                ▼                    ▼        │
       ┌─────────────────┐  ┌─────────────────┴──┐
       │ VersaoDocumento │  │  ValidacaoLegal    │
       │─────────────────│  │────────────────────│
       │ id (PK)         │  │ id (PK)            │
       │ numeroVersao    │  │ secaoId            │
       │ conteudoSecoes  │  │ regra              │
       │ alteracoes      │  │ valido             │
       │ documentoId FK  │  │ observacoes        │
       │ criadoEm        │  │ documentoId FK     │
       └─────────────────┘  │ criadoEm           │
                            └────────────────────┘
```

---

## Entities Detail

### 1. Usuario

Representa um servidor público ou coordenador de licitações que utiliza o sistema.

**Attributes**:
- `id` (UUID, PK): Identificador interno do usuário
- `email` (String, UNIQUE, REQUIRED): Email único para login
- `nome` (String, REQUIRED): Nome completo do usuário
- `criadoEm` (DateTime, DEFAULT now()): Timestamp de criação do registro

**Relationships**:
- `projetos` (1:N): Um usuário pode criar múltiplos projetos
- `documentos` (1:N): Um usuário pode criar múltiplos documentos (ETPs)

**Validations**:
- Email deve ser válido (formato regex)
- Nome deve ter no mínimo 3 caracteres

**Business Rules**:
- Deletar usuário deve cascadear para projetos e documentos (CASCADE)
- Email case-insensitive (normalizar para lowercase antes de salvar)

---

### 2. Projeto

Agrupa ETPs relacionados para organização e categorização (ex: "Licitações TI 2025").

**Attributes**:
- `id` (UUID, PK): Identificador interno do projeto
- `uuid` (UUID, UNIQUE, DEFAULT uuid()): Identificador público exposto em URLs
- `nome` (String, REQUIRED): Nome do projeto (ex: "Infraestrutura Q1 2025")
- `descricao` (String, OPTIONAL): Descrição detalhada do projeto
- `cor` (String, DEFAULT "#3b82f6"): Cor hex para identificação visual (badge)
- `usuarioId` (UUID, FK): Proprietário do projeto
- `criadoEm` (DateTime, DEFAULT now()): Timestamp de criação

**Relationships**:
- `usuario` (N:1): Projeto pertence a um usuário
- `documentos` (1:N): Projeto contém múltiplos documentos

**Validations**:
- Nome deve ter entre 3-100 caracteres
- Cor deve ser hex válido (#RRGGBB)
- UUID público não pode ser editado após criação

**Business Rules**:
- Deletar projeto seta `projetoId = NULL` nos documentos associados (SET NULL)
- Usuário pode ter máximo 50 projetos ativos (soft limit)

---

### 3. Documento

Representa um ETP em qualquer estágio (rascunho, em geração, concluído).

**Attributes**:
- `id` (UUID, PK): Identificador interno do documento
- `uuid` (UUID, UNIQUE, DEFAULT uuid()): Identificador público
- `titulo` (String, REQUIRED): Título do documento (ex: "ETP - Contratação Serviços TI")
- `tipo` (String, DEFAULT "ETP"): Tipo de documento (extensível para TR, Edital futuramente)
- `status` (Enum, DEFAULT RASCUNHO): Status atual do documento
  - `RASCUNHO`: Dados sendo coletados
  - `EM_GERACAO`: Agentes gerando conteúdo
  - `CONCLUIDO`: Documento finalizado e arquivo DOCX disponível
  - `ARQUIVADO`: Documento arquivado (soft delete)
- `dadosColetados` (JSONB, DEFAULT {}): Estrutura JSON com 11+ campos coletados
- `conteudoSecoes` (JSONB, DEFAULT {}): Estrutura JSON com 9 seções geradas pelos agentes
- `caminhoDocx` (String, OPTIONAL): Path relativo do arquivo DOCX gerado
- `caminhoPdf` (String, OPTIONAL): Path relativo do arquivo PDF gerado
- `usuarioId` (UUID, FK): Criador do documento
- `projetoId` (UUID, FK, OPTIONAL): Projeto ao qual documento pertence
- `criadoEm` (DateTime, DEFAULT now()): Timestamp de criação
- `atualizadoEm` (DateTime, AUTO UPDATE): Timestamp da última modificação
- `concluidoEm` (DateTime, OPTIONAL): Timestamp de conclusão (quando status → CONCLUIDO)

**Relationships**:
- `usuario` (N:1): Documento pertence a um usuário
- `projeto` (N:1, OPTIONAL): Documento pode pertencer a um projeto
- `versoes` (1:N): Documento possui múltiplas versões (histórico)
- `validacoes` (1:N): Documento possui múltiplas validações legais

**Validations**:
- Título deve ter entre 5-200 caracteres
- Status só pode transitar em ordem: RASCUNHO → EM_GERACAO → CONCLUIDO
- `concluidoEm` só pode ser setado quando status = CONCLUIDO
- `dadosColetados` deve conter 11 campos obrigatórios antes de permitir geração

**Business Rules**:
- Deletar documento cascadeia para versões e validações (CASCADE)
- Arquivar documento seta status = ARQUIVADO (soft delete, não remove do DB)
- Gerar documento só permitido se progresso = 100% (11 campos validados)

**JSON Structures**:

#### dadosColetados
```json
{
  "objeto_contratacao": "Contratação de serviços de desenvolvimento de software",
  "descricao_detalhada": "Sistema web para gestão de licitações...",
  "justificativa_necessidade": "A Secretaria necessita modernizar...",
  "orgao_contratante": "Secretaria de Tecnologia da Informação",
  "setor_requisitante": "Departamento de Desenvolvimento de Sistemas",
  "modalidade_licitacao": "pregao",
  "valor_estimado": 150000.00,
  "prazo_execucao": 12,
  "prazo_unidade": "meses",
  "requisitos_tecnicos": [
    "Linguagem: TypeScript",
    "Framework: React",
    "Banco de dados: PostgreSQL"
  ],
  "criterios_sustentabilidade": [
    "Uso de energia renovável nos servidores",
    "Documentação digital (sem impressão)"
  ]
}
```

#### conteudoSecoes
```json
{
  "1_definicao_objeto": {
    "titulo": "1. DEFINIÇÃO DO OBJETO",
    "conteudo": {
      "descricao": "Contratação de empresa especializada...",
      "classificacao": "Serviços de TI",
      "codigo_catalogo": "CATSER 12345"
    }
  },
  "2_justificativa": {
    "titulo": "2. JUSTIFICATIVA DA CONTRATAÇÃO",
    "conteudo": {
      "necessidade": "A Secretaria enfrenta desafios...",
      "beneficios": ["Modernização", "Eficiência"],
      "alinhamento_estrategico": "Plano Diretor de TI 2025-2028"
    }
  },
  "3_especificacoes": {
    "titulo": "3. ESPECIFICAÇÕES TÉCNICAS",
    "conteudo": {
      "requisitosObrigatorios": ["Requisito A", "Requisito B"],
      "normasTecnicas": ["ABNT NBR ISO/IEC 27001", "ABNT NBR ISO 9001"],
      "criteriosAceitacao": ["Critério X", "Critério Y"]
    }
  },
  "4_estimativa_custos": { /* ... */ },
  "5_gestao_fiscalizacao": { /* ... */ },
  "6_obrigacoes_contratante": { /* ... */ },
  "7_obrigacoes_contratada": { /* ... */ },
  "8_criterios_aceitacao": { /* ... */ },
  "9_sancoes": { /* ... */ }
}
```

---

### 4. VersaoDocumento

Snapshot imutável do conteúdo de um documento em momento específico (versionamento).

**Attributes**:
- `id` (UUID, PK): Identificador interno da versão
- `numeroVersao` (Int, REQUIRED): Número sequencial da versão (1, 2, 3...)
- `conteudoSecoes` (JSONB, REQUIRED): Cópia completa do `conteudoSecoes` no momento do save
- `alteracoes` (String, OPTIONAL): Descrição resumida das alterações (ex: "Ajuste na seção 3 - especificações técnicas")
- `documentoId` (UUID, FK): Documento ao qual versão pertence
- `criadoEm` (DateTime, DEFAULT now()): Timestamp de criação da versão

**Relationships**:
- `documento` (N:1): Versão pertence a um documento

**Validations**:
- Combinação (documentoId, numeroVersao) deve ser única (UNIQUE CONSTRAINT)
- numeroVersao deve ser positivo e sequencial

**Business Rules**:
- Versão é IMUTÁVEL após criação (no updates permitidos)
- Primeira versão sempre numeroVersao = 1
- Auto-increment de numeroVersao: MAX(numeroVersao) + 1 por documento
- Deletar documento cascadeia para versões (CASCADE)
- Restaurar versão antiga cria NOVA versão (não sobrescreve)

**Usage Scenarios**:
- Edição em TipTap → auto-save cria nova versão após debounce 2s
- "Restaurar versão 3" → copia conteudoSecoes da v3, cria v5 (rollback)
- Diff entre versões: compare JSON paths de v(n) vs v(n-1)

---

### 5. ValidacaoLegal

Registro individual de validação de uma regra legal aplicada a uma seção específica.

**Attributes**:
- `id` (UUID, PK): Identificador interno da validação
- `secaoId` (String, REQUIRED): Identificador da seção validada (ex: "3_especificacoes", "dados_coletados")
- `regra` (String, REQUIRED): Descrição da regra validada (ex: "Valor estimado compatível com modalidade")
- `valido` (Boolean, REQUIRED): Resultado da validação (true = passou, false = falhou)
- `observacoes` (String, OPTIONAL): Detalhes da validação (especialmente se falhou)
- `documentoId` (UUID, FK): Documento ao qual validação pertence
- `criadoEm` (DateTime, DEFAULT now()): Timestamp da validação

**Relationships**:
- `documento` (N:1): Validação pertence a um documento

**Validations**:
- `secaoId` deve seguir padrão: `[0-9]_[a-z_]+` ou "dados_coletados"
- `regra` deve ter entre 10-500 caracteres

**Business Rules**:
- Nova validação é criada a cada execução do AgenteValidadorLegal
- Validações antigas NÃO são deletadas (auditoria completa)
- Query para validação atual: MAX(criadoEm) por (documentoId, secaoId, regra)
- Erros críticos (valido=false em regras marcadas como críticas) bloqueiam geração

**Usage Scenarios**:
- Coletor termina de coletar dados → AgenteValidadorLegal valida → cria 15+ ValidacaoLegal entries
- Sidebar direita lista validações com valido=false como alertas/erros
- Dashboard de conformidade calcula: COUNT(valido=true) / COUNT(*) * 100

---

## Prisma Schema

```prisma
// apps/backend/src/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== MODELS ====================

model Usuario {
  id        String   @id @default(uuid())
  email     String   @unique
  nome      String
  criadoEm  DateTime @default(now()) @map("criado_em")
  
  projetos   Projeto[]
  documentos Documento[]
  
  @@map("usuarios")
}

model Projeto {
  id        String   @id @default(uuid())
  uuid      String   @unique @default(uuid())
  nome      String
  descricao String?
  cor       String   @default("#3b82f6")
  criadoEm  DateTime @default(now()) @map("criado_em")
  
  usuarioId String   @map("usuario_id")
  usuario   Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  
  documentos Documento[]
  
  @@index([usuarioId])
  @@map("projetos")
}

model Documento {
  id               String           @id @default(uuid())
  uuid             String           @unique @default(uuid())
  titulo           String
  tipo             String           @default("ETP")
  status           StatusDocumento  @default(RASCUNHO)
  dadosColetados   Json             @default("{}") @map("dados_coletados")
  conteudoSecoes   Json             @default("{}") @map("conteudo_secoes")
  caminhoDocx      String?          @map("caminho_docx")
  caminhoPdf       String?          @map("caminho_pdf")
  criadoEm         DateTime         @default(now()) @map("criado_em")
  atualizadoEm     DateTime         @updatedAt @map("atualizado_em")
  concluidoEm      DateTime?        @map("concluido_em")
  
  usuarioId String  @map("usuario_id")
  usuario   Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  
  projetoId String?  @map("projeto_id")
  projeto   Projeto? @relation(fields: [projetoId], references: [id], onDelete: SetNull)
  
  versoes    VersaoDocumento[]
  validacoes ValidacaoLegal[]
  
  @@index([usuarioId])
  @@index([projetoId])
  @@index([status])
  @@map("documentos")
}

enum StatusDocumento {
  RASCUNHO
  EM_GERACAO
  CONCLUIDO
  ARQUIVADO
}

model VersaoDocumento {
  id             String   @id @default(uuid())
  numeroVersao   Int      @map("numero_versao")
  conteudoSecoes Json     @map("conteudo_secoes")
  alteracoes     String?
  criadoEm       DateTime @default(now()) @map("criado_em")
  
  documentoId String    @map("documento_id")
  documento   Documento @relation(fields: [documentoId], references: [id], onDelete: Cascade)
  
  @@unique([documentoId, numeroVersao])
  @@index([documentoId])
  @@map("versoes_documento")
}

model ValidacaoLegal {
  id          String   @id @default(uuid())
  secaoId     String   @map("secao_id")
  regra       String
  valido      Boolean
  observacoes String?
  criadoEm    DateTime @default(now()) @map("criado_em")
  
  documentoId String    @map("documento_id")
  documento   Documento @relation(fields: [documentoId], references: [id], onDelete: Cascade)
  
  @@index([documentoId, secaoId])
  @@index([documentoId, valido])
  @@map("validacoes_legais")
}
```

---

## Indexes Strategy

### Performance Indexes
1. **Usuario**: Email (UNIQUE) - login queries
2. **Projeto**: usuarioId - listar projetos do usuário
3. **Documento**: 
   - usuarioId - listar documentos do usuário
   - projetoId - listar documentos de um projeto
   - status - filtrar por status (ex: mostrar apenas CONCLUIDO)
4. **VersaoDocumento**: documentoId - listar versões de um documento
5. **ValidacaoLegal**:
   - (documentoId, secaoId) - buscar validações de seção específica
   - (documentoId, valido) - contar erros/alertas rapidamente

### Query Patterns
```typescript
// Listar documentos do usuário com projetos
await prisma.documento.findMany({
  where: { usuarioId: 'xxx' },
  include: { projeto: true },
  orderBy: { atualizadoEm: 'desc' },
});

// Buscar última versão de documento
await prisma.versaoDocumento.findFirst({
  where: { documentoId: 'xxx' },
  orderBy: { numeroVersao: 'desc' },
});

// Calcular percentual de conformidade
const validacoes = await prisma.validacaoLegal.findMany({
  where: { 
    documentoId: 'xxx',
    criadoEm: { gte: ultimaValidacao }, // Pegar apenas última validação
  },
});
const percentual = (validacoes.filter(v => v.valido).length / validacoes.length) * 100;
```

---

## Migration Strategy

### Initial Migration
```bash
# Create initial schema
pnpm --filter backend prisma migrate dev --name init

# Generate Prisma Client
pnpm --filter backend prisma generate
```

### Seed Data (Development)
```typescript
// apps/backend/src/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const usuario = await prisma.usuario.upsert({
    where: { email: 'admin@etp.gov.br' },
    update: {},
    create: {
      email: 'admin@etp.gov.br',
      nome: 'Administrador Teste',
    },
  });
  
  // Create test project
  const projeto = await prisma.projeto.create({
    data: {
      nome: 'Licitações TI 2025',
      descricao: 'Projeto de teste para desenvolvimento',
      cor: '#3b82f6',
      usuarioId: usuario.id,
    },
  });
  
  console.log({ usuario, projeto });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
pnpm --filter backend prisma db seed
```

---

## Type Safety Integration

### Shared Types Package
```typescript
// packages/shared-types/src/documento.types.ts
export interface DadosColetados {
  objeto_contratacao: string;
  descricao_detalhada: string;
  justificativa_necessidade: string;
  orgao_contratante: string;
  setor_requisitante: string;
  modalidade_licitacao?: 'dispensa' | 'inexigibilidade' | 'pregao' | 'concorrencia';
  valor_estimado: number;
  prazo_execucao: number;
  prazo_unidade: 'dias' | 'meses' | 'anos';
  requisitos_tecnicos?: string[];
  criterios_sustentabilidade?: string[];
}

export interface ConteudoSecao {
  titulo: string;
  conteudo: any; // Specific structure per section
}

export interface ConteudoSecoes {
  '1_definicao_objeto'?: ConteudoSecao;
  '2_justificativa'?: ConteudoSecao;
  '3_especificacoes'?: ConteudoSecao;
  '4_estimativa_custos'?: ConteudoSecao;
  '5_gestao_fiscalizacao'?: ConteudoSecao;
  '6_obrigacoes_contratante'?: ConteudoSecao;
  '7_obrigacoes_contratada'?: ConteudoSecao;
  '8_criterios_aceitacao'?: ConteudoSecao;
  '9_sancoes'?: ConteudoSecao;
}

// Re-export Prisma types for client use
export type { Usuario, Projeto, Documento, StatusDocumento } from '@prisma/client';
```

Usage in backend:
```typescript
import { DadosColetados } from '@etp/shared-types';

function validarDados(dados: DadosColetados): boolean {
  // TypeScript knows all required fields
  return dados.objeto_contratacao.length > 0;
}
```

Usage in frontend:
```typescript
import { DadosColetados, Documento } from '@etp/shared-types';

function ChatWindow({ documento }: { documento: Documento }) {
  const dados = documento.dadosColetados as DadosColetados;
  // Type-safe access to JSON fields
}
```

---

## Summary

| Entity | Purpose | Key Fields | Relationships |
|--------|---------|------------|---------------|
| Usuario | User management | email, nome | 1:N Projetos, 1:N Documentos |
| Projeto | Organize ETPs | nome, cor | N:1 Usuario, 1:N Documentos |
| Documento | ETP lifecycle | status, dadosColetados, conteudoSecoes | N:1 Usuario, N:1 Projeto, 1:N Versoes, 1:N Validacoes |
| VersaoDocumento | Version history | numeroVersao, conteudoSecoes | N:1 Documento |
| ValidacaoLegal | Compliance audit trail | regra, valido, observacoes | N:1 Documento |

**Total Tables**: 5  
**Total Indexes**: 9  
**JSON Fields**: 2 (dadosColetados, conteudoSecoes)  
**Enums**: 1 (StatusDocumento)

Data model ready for implementation. Proceeding to API contracts generation.
