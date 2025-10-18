# API Contracts: REST Endpoints

**Phase**: 1 (Design & Contracts)  
**Date**: 2025-10-18  
**Base URL**: `http://localhost:3001/api`

## Overview

Esta especificação define todos os endpoints REST do backend NestJS, incluindo request/response schemas validados com Zod, status codes, e error handling.

---

## Authentication

**MVP**: Autenticação básica ou usuário mockado (não implementar multi-factor auth).

**Future**: JWT tokens via header `Authorization: Bearer <token>`.

Para MVP, considerar usuário padrão criado via seed:
```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "email": "admin@etp.gov.br",
  "nome": "Administrador Teste"
}
```

---

## Error Response Format

Todos os endpoints seguem formato de erro padronizado:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "titulo",
      "message": "Título deve ter no mínimo 5 caracteres"
    }
  ],
  "timestamp": "2025-10-18T14:30:00.000Z",
  "path": "/api/documentos"
}
```

---

## Endpoints

### 1. Documentos

#### 1.1 Listar Documentos

**Endpoint**: `GET /api/documentos`

**Query Parameters**:
- `usuarioId` (string, required): ID do usuário
- `projetoId` (string, optional): Filtrar por projeto específico
- `status` (enum, optional): Filtrar por status (RASCUNHO, EM_GERACAO, CONCLUIDO, ARQUIVADO)
- `limit` (number, optional, default: 50): Quantidade de resultados
- `offset` (number, optional, default: 0): Paginação

**Response**: `200 OK`
```json
{
  "documentos": [
    {
      "id": "uuid",
      "uuid": "uuid-publico",
      "titulo": "ETP - Contratação Serviços TI",
      "tipo": "ETP",
      "status": "CONCLUIDO",
      "criadoEm": "2025-10-18T10:00:00.000Z",
      "atualizadoEm": "2025-10-18T12:30:00.000Z",
      "concluidoEm": "2025-10-18T12:30:00.000Z",
      "projeto": {
        "uuid": "uuid-projeto",
        "nome": "Licitações TI 2025",
        "cor": "#3b82f6"
      }
    }
  ],
  "total": 23,
  "limit": 50,
  "offset": 0
}
```

**Error Responses**:
- `400 Bad Request`: Parâmetros inválidos
- `500 Internal Server Error`: Erro ao buscar documentos

---

#### 1.2 Criar Documento

**Endpoint**: `POST /api/documentos`

**Request Body**:
```json
{
  "titulo": "ETP - Contratação Infraestrutura",
  "tipo": "ETP",
  "usuarioId": "uuid",
  "projetoId": "uuid-opcional"
}
```

**Validation (Zod)**:
```typescript
{
  titulo: z.string().min(5).max(200),
  tipo: z.string().default('ETP'),
  usuarioId: z.string().uuid(),
  projetoId: z.string().uuid().optional(),
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "uuid": "uuid-publico",
  "titulo": "ETP - Contratação Infraestrutura",
  "tipo": "ETP",
  "status": "RASCUNHO",
  "dadosColetados": {},
  "conteudoSecoes": {},
  "criadoEm": "2025-10-18T14:00:00.000Z",
  "atualizadoEm": "2025-10-18T14:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `404 Not Found`: Usuário ou projeto não encontrado
- `500 Internal Server Error`: Erro ao criar documento

---

#### 1.3 Buscar Documento por UUID

**Endpoint**: `GET /api/documentos/:uuid`

**Path Parameters**:
- `uuid` (string, required): UUID público do documento

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "uuid": "uuid-publico",
  "titulo": "ETP - Contratação Serviços TI",
  "tipo": "ETP",
  "status": "CONCLUIDO",
  "dadosColetados": {
    "objeto_contratacao": "Contratação de serviços de desenvolvimento",
    "descricao_detalhada": "...",
    "valor_estimado": 150000
  },
  "conteudoSecoes": {
    "1_definicao_objeto": { /* ... */ },
    "2_justificativa": { /* ... */ }
  },
  "caminhoDocx": "/files/documentos/uuid.docx",
  "caminhoPdf": "/files/documentos/uuid.pdf",
  "criadoEm": "2025-10-18T10:00:00.000Z",
  "atualizadoEm": "2025-10-18T12:30:00.000Z",
  "concluidoEm": "2025-10-18T12:30:00.000Z",
  "usuario": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@etp.gov.br"
  },
  "projeto": {
    "uuid": "uuid-projeto",
    "nome": "Licitações TI 2025",
    "cor": "#3b82f6"
  }
}
```

**Error Responses**:
- `404 Not Found`: Documento não encontrado
- `500 Internal Server Error`: Erro ao buscar documento

---

#### 1.4 Atualizar Documento

**Endpoint**: `PATCH /api/documentos/:uuid`

**Path Parameters**:
- `uuid` (string, required): UUID público do documento

**Request Body** (todos campos opcionais):
```json
{
  "titulo": "Novo título",
  "status": "EM_GERACAO",
  "projetoId": "novo-uuid-projeto",
  "conteudoSecoes": {
    "3_especificacoes": {
      "titulo": "3. ESPECIFICAÇÕES TÉCNICAS",
      "conteudo": { /* ... */ }
    }
  }
}
```

**Validation**:
```typescript
{
  titulo: z.string().min(5).max(200).optional(),
  status: z.enum(['RASCUNHO', 'EM_GERACAO', 'CONCLUIDO', 'ARQUIVADO']).optional(),
  projetoId: z.string().uuid().optional(),
  dadosColetados: z.record(z.any()).optional(),
  conteudoSecoes: z.record(z.any()).optional(),
}
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "uuid": "uuid-publico",
  "titulo": "Novo título",
  "status": "EM_GERACAO",
  "atualizadoEm": "2025-10-18T14:35:00.000Z"
}
```

**Business Rules**:
- Se `conteudoSecoes` for atualizado, criar nova VersaoDocumento automaticamente
- Status só pode transitar em ordem: RASCUNHO → EM_GERACAO → CONCLUIDO
- Setar `concluidoEm` automaticamente quando status → CONCLUIDO

**Error Responses**:
- `400 Bad Request`: Validation error ou transição de status inválida
- `404 Not Found`: Documento não encontrado
- `500 Internal Server Error`: Erro ao atualizar documento

---

#### 1.5 Deletar Documento (Soft Delete)

**Endpoint**: `DELETE /api/documentos/:uuid`

**Path Parameters**:
- `uuid` (string, required): UUID público do documento

**Response**: `204 No Content`

**Business Rules**:
- Soft delete: seta `status = ARQUIVADO` ao invés de deletar do DB
- Documentos arquivados não aparecem em listagens por padrão
- Para hard delete (desenvolvimento), usar query param `?hard=true`

**Error Responses**:
- `404 Not Found`: Documento não encontrado
- `500 Internal Server Error`: Erro ao deletar documento

---

#### 1.6 Download Documento DOCX

**Endpoint**: `GET /api/documentos/:uuid/download/docx`

**Path Parameters**:
- `uuid` (string, required): UUID público do documento

**Response**: `200 OK`
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="ETP-Contratacao-TI.docx"

[binary file content]
```

**Business Rules**:
- Só permitir download se status = CONCLUIDO
- Se arquivo não existir no filesystem mas documento está CONCLUIDO, regenerar on-demand

**Error Responses**:
- `400 Bad Request`: Documento não está concluído
- `404 Not Found`: Documento ou arquivo não encontrado
- `500 Internal Server Error`: Erro ao ler arquivo

---

#### 1.7 Download Documento PDF

**Endpoint**: `GET /api/documentos/:uuid/download/pdf`

**Path Parameters**:
- `uuid` (string, required): UUID público do documento

**Response**: `200 OK`
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="ETP-Contratacao-TI.pdf"

[binary file content]
```

**Business Rules**: Mesmas do endpoint DOCX

**Error Responses**: Mesmas do endpoint DOCX

---

### 2. Versões de Documento

#### 2.1 Listar Versões

**Endpoint**: `GET /api/documentos/:uuid/versoes`

**Path Parameters**:
- `uuid` (string, required): UUID público do documento

**Response**: `200 OK`
```json
{
  "versoes": [
    {
      "id": "uuid-versao",
      "numeroVersao": 3,
      "alteracoes": "Ajuste na seção 3 - especificações técnicas",
      "criadoEm": "2025-10-18T14:30:00.000Z"
    },
    {
      "id": "uuid-versao-2",
      "numeroVersao": 2,
      "alteracoes": "Atualização da seção 4 - custos",
      "criadoEm": "2025-10-18T12:15:00.000Z"
    },
    {
      "id": "uuid-versao-1",
      "numeroVersao": 1,
      "alteracoes": "Versão inicial",
      "criadoEm": "2025-10-18T10:00:00.000Z"
    }
  ],
  "total": 3
}
```

**Error Responses**:
- `404 Not Found`: Documento não encontrado

---

#### 2.2 Buscar Versão Específica

**Endpoint**: `GET /api/documentos/:uuid/versoes/:numeroVersao`

**Path Parameters**:
- `uuid` (string, required): UUID público do documento
- `numeroVersao` (number, required): Número da versão

**Response**: `200 OK`
```json
{
  "id": "uuid-versao",
  "numeroVersao": 2,
  "conteudoSecoes": {
    "1_definicao_objeto": { /* ... */ },
    "2_justificativa": { /* ... */ }
  },
  "alteracoes": "Atualização da seção 4 - custos",
  "criadoEm": "2025-10-18T12:15:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: Documento ou versão não encontrada

---

#### 2.3 Restaurar Versão (Rollback)

**Endpoint**: `POST /api/documentos/:uuid/versoes/:numeroVersao/restaurar`

**Path Parameters**:
- `uuid` (string, required): UUID público do documento
- `numeroVersao` (number, required): Número da versão a restaurar

**Response**: `200 OK`
```json
{
  "mensagem": "Versão 2 restaurada com sucesso",
  "novaVersao": {
    "numeroVersao": 4,
    "alteracoes": "Restauração da versão 2",
    "criadoEm": "2025-10-18T15:00:00.000Z"
  }
}
```

**Business Rules**:
- Copia `conteudoSecoes` da versão alvo
- Cria NOVA versão (não sobrescreve atual)
- Altera no objeto `alteracoes`: "Restauração da versão {N}"
- Atualiza `conteudoSecoes` do documento principal

**Error Responses**:
- `404 Not Found`: Documento ou versão não encontrada
- `500 Internal Server Error`: Erro ao restaurar versão

---

### 3. Validações Legais

#### 3.1 Listar Validações de Documento

**Endpoint**: `GET /api/documentos/:uuid/validacoes`

**Path Parameters**:
- `uuid` (string, required): UUID público do documento

**Query Parameters**:
- `secaoId` (string, optional): Filtrar por seção específica
- `valido` (boolean, optional): Filtrar por válido/inválido
- `latest` (boolean, optional, default: true): Retornar apenas última validação de cada regra

**Response**: `200 OK`
```json
{
  "validacoes": [
    {
      "id": "uuid-validacao",
      "secaoId": "dados_coletados",
      "regra": "Valor estimado compatível com modalidade de licitação",
      "valido": false,
      "observacoes": "Valor R$ 600.000 excede limite de R$ 50.000 para modalidade dispensa",
      "criadoEm": "2025-10-18T14:00:00.000Z"
    },
    {
      "id": "uuid-validacao-2",
      "secaoId": "3_especificacoes",
      "regra": "Especificações devem referenciar normas ABNT",
      "valido": true,
      "observacoes": null,
      "criadoEm": "2025-10-18T14:05:00.000Z"
    }
  ],
  "resumo": {
    "totalRegras": 15,
    "regrasValidas": 13,
    "percentualConformidade": 87,
    "errosCriticos": 1,
    "alertas": 1
  }
}
```

**Error Responses**:
- `404 Not Found`: Documento não encontrado

---

#### 3.2 Executar Validação Manual

**Endpoint**: `POST /api/documentos/:uuid/validacoes`

**Path Parameters**:
- `uuid` (string, required): UUID público do documento

**Request Body**:
```json
{
  "secaoId": "dados_coletados",
  "forcarRevalidacao": true
}
```

**Response**: `201 Created`
```json
{
  "mensagem": "Validação executada com sucesso",
  "validacoesNovas": 15,
  "resumo": {
    "totalRegras": 15,
    "regrasValidas": 14,
    "percentualConformidade": 93,
    "errosCriticos": 0,
    "alertas": 1
  }
}
```

**Business Rules**:
- Executa AgenteValidadorLegal para seção especificada (ou todas se omitido)
- Cria novas ValidacaoLegal entries (não sobrescreve antigas)
- Retorna resumo atualizado

**Error Responses**:
- `404 Not Found`: Documento não encontrado
- `500 Internal Server Error`: Erro ao executar validação

---

### 4. Projetos

#### 4.1 Listar Projetos

**Endpoint**: `GET /api/projetos`

**Query Parameters**:
- `usuarioId` (string, required): ID do usuário
- `limit` (number, optional, default: 50): Quantidade de resultados
- `offset` (number, optional, default: 0): Paginação

**Response**: `200 OK`
```json
{
  "projetos": [
    {
      "uuid": "uuid-projeto",
      "nome": "Licitações TI 2025",
      "descricao": "Projeto agregador de licitações de tecnologia",
      "cor": "#3b82f6",
      "criadoEm": "2025-01-15T10:00:00.000Z",
      "totalDocumentos": 8
    }
  ],
  "total": 3,
  "limit": 50,
  "offset": 0
}
```

**Error Responses**:
- `400 Bad Request`: Parâmetros inválidos

---

#### 4.2 Criar Projeto

**Endpoint**: `POST /api/projetos`

**Request Body**:
```json
{
  "nome": "Infraestrutura Q2 2025",
  "descricao": "Projetos de infraestrutura para o segundo trimestre",
  "cor": "#10b981",
  "usuarioId": "uuid"
}
```

**Validation**:
```typescript
{
  nome: z.string().min(3).max(100),
  descricao: z.string().max(500).optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  usuarioId: z.string().uuid(),
}
```

**Response**: `201 Created`
```json
{
  "uuid": "uuid-projeto",
  "nome": "Infraestrutura Q2 2025",
  "descricao": "Projetos de infraestrutura para o segundo trimestre",
  "cor": "#10b981",
  "criadoEm": "2025-10-18T14:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `404 Not Found`: Usuário não encontrado
- `500 Internal Server Error`: Erro ao criar projeto

---

#### 4.3 Buscar Projeto por UUID

**Endpoint**: `GET /api/projetos/:uuid`

**Path Parameters**:
- `uuid` (string, required): UUID público do projeto

**Response**: `200 OK`
```json
{
  "uuid": "uuid-projeto",
  "nome": "Licitações TI 2025",
  "descricao": "Projeto agregador de licitações de tecnologia",
  "cor": "#3b82f6",
  "criadoEm": "2025-01-15T10:00:00.000Z",
  "documentos": [
    {
      "uuid": "uuid-doc-1",
      "titulo": "ETP - Serviços TI",
      "status": "CONCLUIDO",
      "criadoEm": "2025-02-10T10:00:00.000Z"
    }
  ],
  "totalDocumentos": 8
}
```

**Error Responses**:
- `404 Not Found`: Projeto não encontrado

---

#### 4.4 Atualizar Projeto

**Endpoint**: `PATCH /api/projetos/:uuid`

**Path Parameters**:
- `uuid` (string, required): UUID público do projeto

**Request Body** (todos campos opcionais):
```json
{
  "nome": "Novo nome",
  "descricao": "Nova descrição",
  "cor": "#ef4444"
}
```

**Response**: `200 OK`
```json
{
  "uuid": "uuid-projeto",
  "nome": "Novo nome",
  "descricao": "Nova descrição",
  "cor": "#ef4444"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `404 Not Found`: Projeto não encontrado

---

#### 4.5 Deletar Projeto

**Endpoint**: `DELETE /api/projetos/:uuid`

**Path Parameters**:
- `uuid` (string, required): UUID público do projeto

**Response**: `204 No Content`

**Business Rules**:
- Setar `projetoId = NULL` em todos documentos associados (ON DELETE SET NULL)
- Hard delete do projeto (não é soft delete)

**Error Responses**:
- `404 Not Found`: Projeto não encontrado
- `500 Internal Server Error`: Erro ao deletar projeto

---

### 5. Geração de Documento

#### 5.1 Iniciar Geração

**Endpoint**: `POST /api/documentos/:uuid/gerar`

**Path Parameters**:
- `uuid` (string, required): UUID público do documento

**Request Body** (opcional):
```json
{
  "forcarGeracao": false
}
```

**Response**: `202 Accepted`
```json
{
  "mensagem": "Geração iniciada com sucesso",
  "documentoUuid": "uuid",
  "status": "EM_GERACAO",
  "estimativaTempoMinutos": 3
}
```

**Business Rules**:
- Valida que `dadosColetados` tem 11 campos obrigatórios preenchidos
- Executa validação legal antes de iniciar (bloqueia se erros críticos)
- Atualiza status para EM_GERACAO
- Chama OrquestradorMultiAgenteService de forma assíncrona
- Retorna 202 imediatamente (cliente acompanha via WebSocket)

**Error Responses**:
- `400 Bad Request`: Dados incompletos ou validação legal falhou
- `404 Not Found`: Documento não encontrado
- `409 Conflict`: Documento já está em geração
- `500 Internal Server Error`: Erro ao iniciar geração

---

### 6. Usuários (Simplified MVP)

#### 6.1 Buscar Usuário por Email

**Endpoint**: `GET /api/usuarios`

**Query Parameters**:
- `email` (string, required): Email do usuário

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "email": "admin@etp.gov.br",
  "nome": "Administrador Teste",
  "criadoEm": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: Usuário não encontrado

---

## Rate Limiting

**MVP**: Sem rate limiting.

**Future**: 
- 100 requests/min por IP para endpoints REST
- 10 gerações simultâneas por usuário
- Custos API Claude monitorados via logging

---

## CORS Configuration

```typescript
// apps/backend/src/main.ts
app.enableCors({
  origin: ['http://localhost:3000'], // Vite frontend
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
});
```

---

## Summary

| Resource | Endpoints | Methods |
|----------|-----------|---------|
| Documentos | 7 | GET (list, get), POST, PATCH, DELETE, GET (downloads) |
| Versões | 3 | GET (list, get), POST (restore) |
| Validações | 2 | GET, POST |
| Projetos | 5 | GET (list, get), POST, PATCH, DELETE |
| Geração | 1 | POST |
| Usuários | 1 | GET |

**Total Endpoints**: 19  
**Authentication**: MVP sem auth (usuário mockado)  
**Validation**: Zod schemas em todos POST/PATCH  
**Error Handling**: Formato padronizado com status codes HTTP semânticos
