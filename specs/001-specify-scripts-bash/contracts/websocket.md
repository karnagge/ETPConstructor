# API Contracts: WebSocket (Socket.IO)

**Phase**: 1 (Design & Contracts)  
**Date**: 2025-10-18  
**Connection URL**: `ws://localhost:3001` (Socket.IO default namespace)

## Overview

Esta especificação define todos os eventos WebSocket (Socket.IO) para comunicação real-time entre frontend e backend, incluindo coleta conversacional, progresso de geração, e alertas legais.

---

## Connection Setup

### Client Connection (Frontend)

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'], // Fallback para long-polling
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 20000,
});

// Connection events
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.warn('Disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Server forçou desconexão, reconectar manualmente
    socket.connect();
  }
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

### Server Configuration (Backend)

```typescript
// apps/backend/src/chat/chat.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ 
  cors: { origin: 'http://localhost:3000' },
  transports: ['websocket', 'polling'],
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  
  // Event handlers...
}
```

---

## Room-Based Isolation

Cada documento tem uma "room" isolada para múltiplos usuários (fase futura):

```typescript
// Cliente entra na room ao abrir documento
socket.emit('entrar_documento', { documentoUuid: 'xxx' });

// Servidor adiciona cliente à room
client.join(`doc-${documentoUuid}`);

// Mensagens emitidas apenas para essa room
this.server.to(`doc-${documentoUuid}`).emit('evento', data);
```

---

## Events: Client → Server

### 1. entrar_documento

**Description**: Cliente conecta a um documento específico e entra na room.

**Payload**:
```typescript
{
  documentoUuid: string; // UUID público do documento
}
```

**Server Action**:
- Adiciona cliente à room `doc-${documentoUuid}`
- Carrega estado da sessão (se existir) do Redis
- Emite evento `sessao_carregada` com dados atuais

**Response Events**: 
- `sessao_carregada` (success)
- `erro_conexao` (error)

**Example**:
```typescript
socket.emit('entrar_documento', { 
  documentoUuid: 'abc-123-def-456' 
});
```

---

### 2. iniciar_coleta

**Description**: Inicia processo de coleta conversacional de dados para novo ETP.

**Payload**:
```typescript
{
  documentoUuid: string;
}
```

**Server Action**:
- Inicializa sessão de chat no ChatService
- Gera mensagem de boas-vindas do AgenteColetorConversacional
- Emite `mensagem_assistente` com primeira pergunta

**Response Events**:
- `mensagem_assistente` (success)
- `erro_coleta` (error)

**Example**:
```typescript
socket.emit('iniciar_coleta', { 
  documentoUuid: 'abc-123-def-456' 
});

// Servidor responde com:
socket.on('mensagem_assistente', (data) => {
  console.log(data.mensagem); 
  // "Olá! Vou ajudá-lo a criar um ETP. Qual é o objeto da contratação?"
});
```

---

### 3. enviar_mensagem

**Description**: Usuário envia mensagem durante coleta conversacional.

**Payload**:
```typescript
{
  documentoUuid: string;
  mensagem: string;
  timestamp: string; // ISO 8601
}
```

**Server Action**:
- Adiciona mensagem ao histórico da sessão
- Processa com AgenteColetorConversacional
- Extrai/valida dados se aplicável
- Atualiza `dadosColetados` no Documento
- Emite `campo_coletado` se campo foi preenchido
- Emite `mensagem_assistente` com próxima pergunta ou confirmação

**Response Events**:
- `mensagem_assistente` (sempre)
- `campo_coletado` (se dado validado)
- `progresso_coleta` (atualização de progresso)
- `erro_processamento` (error)

**Example**:
```typescript
socket.emit('enviar_mensagem', {
  documentoUuid: 'abc-123-def-456',
  mensagem: 'Contratação de serviços de desenvolvimento de software',
  timestamp: '2025-10-18T14:30:00.000Z',
});
```

---

### 4. confirmar_dados

**Description**: Usuário confirma dados coletados e inicia validação legal.

**Payload**:
```typescript
{
  documentoUuid: string;
}
```

**Server Action**:
- Executa AgenteValidadorLegal nos `dadosColetados`
- Cria entries em ValidacaoLegal
- Calcula percentual de conformidade
- Emite `validacao_completa` com resumo

**Response Events**:
- `validacao_completa` (success)
- `erro_validacao` (error)

**Example**:
```typescript
socket.emit('confirmar_dados', { 
  documentoUuid: 'abc-123-def-456' 
});
```

---

### 5. gerar_documento

**Description**: Inicia processo de geração do documento ETP completo.

**Payload**:
```typescript
{
  documentoUuid: string;
  forcarGeracao?: boolean; // Ignorar alertas legais (não erros críticos)
}
```

**Server Action**:
- Valida pré-requisitos (11 campos, sem erros críticos)
- Atualiza status para EM_GERACAO
- Chama OrquestradorMultiAgenteService
- Emite `progresso_geracao` periodicamente (10%, 30%, 60%, 80%, 90%, 100%)
- Emite `secao_gerada` quando cada seção completa
- Emite `alerta_secao` se validação legal detectar problema
- Emite `geracao_completa` quando finalizado

**Response Events**:
- `geracao_iniciada` (confirmation)
- `progresso_geracao` (periodic updates)
- `secao_gerada` (per section)
- `alerta_secao` (legal warnings)
- `geracao_completa` (success)
- `erro_geracao` (error)

**Example**:
```typescript
socket.emit('gerar_documento', { 
  documentoUuid: 'abc-123-def-456',
  forcarGeracao: false,
});
```

---

### 6. editar_secao

**Description**: Usuário edita conteúdo de seção específica no editor TipTap.

**Payload**:
```typescript
{
  documentoUuid: string;
  secaoId: string; // Ex: "3_especificacoes"
  conteudo: any; // JSON structure específica da seção
}
```

**Server Action**:
- Atualiza `conteudoSecoes[secaoId]` no Documento
- Debounce de 2s antes de persistir (auto-save)
- Cria nova VersaoDocumento após save
- Emite `secao_salva` com confirmação

**Response Events**:
- `secao_salva` (success)
- `erro_salvamento` (error)

**Example**:
```typescript
socket.emit('editar_secao', {
  documentoUuid: 'abc-123-def-456',
  secaoId: '3_especificacoes',
  conteudo: {
    requisitosObrigatorios: ['Novo requisito A'],
    normasTecnicas: ['ABNT NBR ISO 27001'],
  },
});
```

---

### 7. cancelar_geracao

**Description**: Usuário cancela geração de documento em andamento.

**Payload**:
```typescript
{
  documentoUuid: string;
}
```

**Server Action**:
- Interrompe orquestração de agentes (se possível)
- Reverte status para RASCUNHO
- Emite `geracao_cancelada`

**Response Events**:
- `geracao_cancelada` (success)
- `erro_cancelamento` (error)

**Example**:
```typescript
socket.emit('cancelar_geracao', { 
  documentoUuid: 'abc-123-def-456' 
});
```

---

## Events: Server → Client

### 1. sessao_carregada

**Description**: Sessão de documento carregada após `entrar_documento`.

**Payload**:
```typescript
{
  documentoUuid: string;
  status: 'RASCUNHO' | 'EM_GERACAO' | 'CONCLUIDO' | 'ARQUIVADO';
  dadosColetados: any; // Partial or complete
  historicoChat: Array<{
    role: 'user' | 'assistant';
    mensagem: string;
    timestamp: string;
  }>;
  progressoColeta: number; // 0-100
}
```

**Example**:
```typescript
socket.on('sessao_carregada', (data) => {
  console.log('Progresso atual:', data.progressoColeta);
  // Restaurar histórico de chat na UI
});
```

---

### 2. mensagem_assistente

**Description**: Assistente envia mensagem durante coleta conversacional.

**Payload**:
```typescript
{
  mensagem: string;
  timestamp: string;
  contexto?: {
    campoEsperado?: string; // Ex: "descricao_detalhada"
    sugestoes?: string[]; // Opções pré-definidas (ex: modalidades)
  };
}
```

**Example**:
```typescript
socket.on('mensagem_assistente', (data) => {
  addMessageToChat('assistant', data.mensagem);
  
  if (data.contexto?.sugestoes) {
    showSuggestions(data.contexto.sugestoes);
  }
});
```

---

### 3. campo_coletado

**Description**: Campo de dados foi validado e armazenado com sucesso.

**Payload**:
```typescript
{
  campo: string; // Ex: "objeto_contratacao"
  valor: any;
  timestamp: string;
}
```

**Example**:
```typescript
socket.on('campo_coletado', (data) => {
  console.log(`✓ Campo ${data.campo} coletado:`, data.valor);
  // Mostrar badge verde ao lado do campo na UI
});
```

---

### 4. progresso_coleta

**Description**: Atualização de progresso da coleta de dados.

**Payload**:
```typescript
{
  camposColetados: number; // Ex: 8
  camposTotais: number; // 11
  percentual: number; // 72.7
  camposFaltantes: string[]; // ["criterios_sustentabilidade", "modalidade_licitacao", "requisitos_tecnicos"]
}
```

**Example**:
```typescript
socket.on('progresso_coleta', (data) => {
  updateProgressBar(data.percentual);
  console.log('Faltam:', data.camposFaltantes);
});
```

---

### 5. validacao_completa

**Description**: Validação legal dos dados coletados concluída.

**Payload**:
```typescript
{
  percentualConformidade: number; // 0-100
  totalRegras: number;
  regrasValidas: number;
  errosCriticos: Array<{
    regra: string;
    observacoes: string;
    fundamentacao: string; // Ex: "Lei 14.133/21, Art. 75"
  }>;
  alertas: Array<{
    regra: string;
    observacoes: string;
    fundamentacao: string;
  }>;
  timestamp: string;
}
```

**Example**:
```typescript
socket.on('validacao_completa', (data) => {
  if (data.errosCriticos.length > 0) {
    showErrorPanel(data.errosCriticos);
    disableGenerateButton();
  } else {
    updateComplianceScore(data.percentualConformidade);
    enableGenerateButton();
  }
});
```

---

### 6. geracao_iniciada

**Description**: Confirmação de início da geração de documento.

**Payload**:
```typescript
{
  documentoUuid: string;
  estimativaTempoMinutos: number; // Ex: 3
  timestamp: string;
}
```

**Example**:
```typescript
socket.on('geracao_iniciada', (data) => {
  showProgressModal();
  console.log(`Geração levará ~${data.estimativaTempoMinutos} minutos`);
});
```

---

### 7. progresso_geracao

**Description**: Atualização de progresso da geração de documento.

**Payload**:
```typescript
{
  percentual: number; // 10, 30, 60, 80, 90, 100
  fase: string; // Ex: "Análise Especializada", "Montagem do Documento"
  timestamp: string;
}
```

**Fases**:
1. **10%**: Validação Inicial
2. **30%**: Análise Especializada (agentes paralelos)
3. **60%**: Montagem do Documento
4. **80%**: Validação Legal Final
5. **90%**: Geração de Arquivos
6. **100%**: Concluído

**Example**:
```typescript
socket.on('progresso_geracao', (data) => {
  updateProgressBar(data.percentual);
  updatePhaseLabel(data.fase);
});
```

---

### 8. secao_gerada

**Description**: Seção específica do documento foi gerada com sucesso.

**Payload**:
```typescript
{
  secaoId: string; // Ex: "3_especificacoes"
  titulo: string; // Ex: "3. ESPECIFICAÇÕES TÉCNICAS"
  agenteResponsavel: string; // Ex: "AgenteEspecificacoesTecnicas"
  timestamp: string;
}
```

**Example**:
```typescript
socket.on('secao_gerada', (data) => {
  console.log(`✓ Seção ${data.titulo} gerada`);
  markSectionComplete(data.secaoId);
});
```

---

### 9. alerta_secao

**Description**: Validação legal detectou problema em seção gerada.

**Payload**:
```typescript
{
  secaoId: string;
  tipo: 'alerta' | 'erro_critico';
  regra: string;
  observacoes: string;
  fundamentacao: string;
  timestamp: string;
}
```

**Example**:
```typescript
socket.on('alerta_secao', (data) => {
  if (data.tipo === 'erro_critico') {
    showCriticalError(data);
  } else {
    showWarning(data);
  }
  
  addToCompliancePanel(data);
});
```

---

### 10. geracao_completa

**Description**: Geração de documento concluída com sucesso.

**Payload**:
```typescript
{
  documentoUuid: string;
  caminhoDocx: string;
  caminhoPdf: string;
  tempoGeracaoSegundos: number;
  timestamp: string;
}
```

**Example**:
```typescript
socket.on('geracao_completa', (data) => {
  hideProgressModal();
  showSuccessMessage();
  enableDownloadButtons();
  console.log(`✓ Documento gerado em ${data.tempoGeracaoSegundos}s`);
});
```

---

### 11. secao_salva

**Description**: Edição de seção foi salva com sucesso (auto-save).

**Payload**:
```typescript
{
  secaoId: string;
  novaVersao: {
    numeroVersao: number;
    timestamp: string;
  };
}
```

**Example**:
```typescript
socket.on('secao_salva', (data) => {
  showSaveBadge(`Salvo às ${new Date(data.novaVersao.timestamp).toLocaleTimeString()}`);
  updateVersionNumber(data.novaVersao.numeroVersao);
});
```

---

### 12. geracao_cancelada

**Description**: Geração de documento foi cancelada pelo usuário.

**Payload**:
```typescript
{
  documentoUuid: string;
  timestamp: string;
}
```

**Example**:
```typescript
socket.on('geracao_cancelada', () => {
  hideProgressModal();
  showNotification('Geração cancelada');
});
```

---

## Error Events

### erro_conexao

**Payload**:
```typescript
{
  codigo: 'DOC_NAO_ENCONTRADO' | 'PERMISSAO_NEGADA' | 'SESSAO_EXPIRADA';
  mensagem: string;
  timestamp: string;
}
```

---

### erro_coleta

**Payload**:
```typescript
{
  codigo: 'AGENTE_INDISPONIVEL' | 'VALIDACAO_FALHOU' | 'TIMEOUT';
  mensagem: string;
  detalhes?: any;
  timestamp: string;
}
```

---

### erro_processamento

**Payload**:
```typescript
{
  codigo: 'PARSE_ERROR' | 'CAMPO_INVALIDO' | 'DADOS_INCOMPLETOS';
  mensagem: string;
  campo?: string;
  timestamp: string;
}
```

---

### erro_validacao

**Payload**:
```typescript
{
  codigo: 'DADOS_INVALIDOS' | 'ERRO_CRITICO_BLOQUEANTE';
  mensagem: string;
  erros: Array<{ regra: string; observacoes: string }>;
  timestamp: string;
}
```

---

### erro_geracao

**Payload**:
```typescript
{
  codigo: 'AGENTE_FALHOU' | 'TIMEOUT_GERACAO' | 'ARQUIVO_NAO_CRIADO';
  mensagem: string;
  agenteResponsavel?: string;
  tentativasRestantes?: number;
  timestamp: string;
}
```

---

### erro_salvamento

**Payload**:
```typescript
{
  codigo: 'DB_ERROR' | 'VERSAO_CONFLITO';
  mensagem: string;
  timestamp: string;
}
```

---

## Reconnection Handling

### Client-Side Strategy

```typescript
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server forçou desconexão
    showReconnectingIndicator();
    socket.connect();
  } else if (reason === 'transport close') {
    // Perda de conexão de rede
    showOfflineIndicator();
    // Socket.IO tentará reconectar automaticamente
  }
});

socket.on('connect', () => {
  hideReconnectingIndicator();
  
  // Re-entrar na room do documento
  const documentoUuid = getCurrentDocumentUuid();
  if (documentoUuid) {
    socket.emit('entrar_documento', { documentoUuid });
  }
});
```

### Server-Side Session Persistence

```typescript
// Armazenar estado da sessão no Redis
await redis.setex(
  `session:${documentoUuid}`,
  3600, // 1 hora TTL
  JSON.stringify({
    historicoChat: [...],
    dadosColetados: {...},
    progressoColeta: 73,
  })
);

// Restaurar ao reconectar
const sessao = await redis.get(`session:${documentoUuid}`);
if (sessao) {
  client.emit('sessao_carregada', JSON.parse(sessao));
}
```

---

## Performance Considerations

### Debouncing

```typescript
// Edição de seção: debounce 2s antes de emitir
let editarSecaoTimeout: NodeJS.Timeout;

function handleSecaoEdit(secaoId: string, conteudo: any) {
  clearTimeout(editarSecaoTimeout);
  
  editarSecaoTimeout = setTimeout(() => {
    socket.emit('editar_secao', {
      documentoUuid,
      secaoId,
      conteudo,
    });
  }, 2000);
}
```

### Message Batching

```typescript
// Agrupar múltiplos campos coletados em um único evento
const camposColetados: Array<any> = [];

function addCampoColetado(campo: string, valor: any) {
  camposColetados.push({ campo, valor });
  
  // Emit batch a cada 5 campos ou após 1s
  if (camposColetados.length >= 5) {
    socket.emit('campos_coletados_batch', { campos: camposColetados });
    camposColetados.length = 0;
  }
}
```

---

## Summary

| Event Type | Client → Server | Server → Client |
|------------|-----------------|-----------------|
| Connection | 1 (entrar_documento) | 1 (sessao_carregada) |
| Coleta | 3 (iniciar, enviar, confirmar) | 4 (mensagem_assistente, campo_coletado, progresso, validacao_completa) |
| Geração | 2 (gerar, cancelar) | 6 (iniciada, progresso, secao_gerada, alerta, completa, cancelada) |
| Edição | 1 (editar_secao) | 1 (secao_salva) |
| Errors | - | 6 (erro_*) |

**Total Events**: 26 (7 client→server, 19 server→client)

**Transport**: WebSocket (fallback long-polling)  
**Rooms**: Isolation por documento (`doc-${uuid}`)  
**Session Persistence**: Redis (1h TTL)  
**Reconnection**: Automatic com state restoration
