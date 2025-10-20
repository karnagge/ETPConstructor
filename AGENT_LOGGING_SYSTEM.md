# 🔍 Sistema de Logs em Tempo Real dos Agentes

## Implementação Completa - 20 de Outubro de 2025

### 🎯 Objetivo

Fornecer **transparência total** sobre as operações internas dos agentes IA, mostrando:
- Quando ferramentas são chamadas
- Parâmetros enviados para ferramentas
- Resultados retornados
- Tempo de execução
- Erros e exceções
- Processamento interno do Claude

---

## 🏗️ Arquitetura

### Backend

#### 1. **Tipos de Log** (`base-agente.ts`)

```typescript
export type LogEventType =
  | 'agent_start'           // Agente iniciou processamento
  | 'agent_end'             // Agente finalizou com sucesso
  | 'tool_call_start'       // Ferramenta sendo chamada
  | 'tool_call_end'         // Ferramenta concluída
  | 'tool_call_error'       // Ferramenta falhou
  | 'thinking'              // Agente processando
  | 'response_generated'    // Resposta gerada
  | 'error';                // Erro genérico
```

#### 2. **Estrutura de Log Event**

```typescript
interface AgenteLogEvent {
  id: string;                   // UUID do evento
  timestamp: string;            // ISO 8601
  event_type: LogEventType;
  agent_name: string;           // Nome do agente
  message: string;              // Mensagem legível
  
  data?: {
    tool_call?: ToolCallLog;    // Detalhes da chamada de ferramenta
    response_text?: string;     // Texto da resposta (preview)
    error?: string;             // Mensagem de erro
    metadata?: Record<string, any>;  // Metadados adicionais
  };
}
```

#### 3. **Tool Call Log**

```typescript
interface ToolCallLog {
  tool_name: string;
  input_parameters: Record<string, any>;
  started_at: string;
  ended_at?: string;
  duration_ms?: number;         // Tempo de execução
  result?: any;                 // Resultado completo
  error?: string;
  success: boolean;
}
```

### Frontend

#### **LogViewer Component** (`LogViewer.tsx`)

Componente React que exibe logs em tempo real com:
- ✅ Auto-scroll para novos eventos
- ✅ Expansão de detalhes (parâmetros, resultados)
- ✅ Syntax highlighting para JSON
- ✅ Ícones coloridos por tipo de evento
- ✅ Timestamps precisos
- ✅ Medição de performance (tempo de execução)

---

## 🔄 Fluxo de Eventos

### 1. **Agent Start**
```
[Coletor Conversacional] iniciou processamento
```

### 2. **Thinking** (ferramentas disponíveis)
```
[Coletor Conversacional] tem 5 ferramentas disponíveis
Tools: [buscar_precos_referencia, validar_orgao_publico, ...]
```

### 3. **Tool Call Start**
```
Chamando ferramenta: buscar_precos_referencia
Parâmetros:
{
  "descricao_item": "desenvolvimento de software"
}
```

### 4. **Tool Call End**
```
Ferramenta buscar_precos_referencia concluída com sucesso (234ms)
Resultado:
{
  "sucesso": true,
  "precos": [
    {
      "descricao": "Desenvolvimento de software customizado",
      "valor_unitario": 15000.00,
      "unidade": "hora"
    }
  ]
}
```

### 5. **Thinking** (processando resultados)
```
[Coletor Conversacional] processando resultados das ferramentas
```

### 6. **Response Generated**
```
[Coletor Conversacional] gerou resposta
Preview: "Ótimo! Encontrei algumas informações que podem ajudar..."
```

### 7. **Agent End**
```
[Coletor Conversacional] finalizou processamento com sucesso
```

---

## 📊 Exemplo de Uso Completo

### Usuário: "Preciso contratar desenvolvimento de software"

**Logs gerados**:

```
[09:15:23.001] agent_start 🔵
Coletor Conversacional iniciou processamento

[09:15:23.005] thinking 🧠
Coletor Conversacional tem 5 ferramentas disponíveis

[09:15:23.010] thinking 🧠
Coletor Conversacional decidiu usar ferramentas

[09:15:23.012] tool_call_start 🔧
Chamando ferramenta: buscar_precos_referencia
├─ Parâmetros:
│  {
│    "descricao_item": "desenvolvimento de software"
│  }

[09:15:23.246] tool_call_end ✅ (234ms)
Ferramenta buscar_precos_referencia concluída com sucesso
├─ Resultado:
│  {
│    "sucesso": true,
│    "fonte": "Painel de Preços - Governo Federal (Mock)",
│    "precos": [
│      {
│        "descricao": "Desenvolvimento de software customizado",
│        "valor_unitario": 15000.00,
│        "unidade": "hora",
│        "data_referencia": "2025-09-01"
│      },
│      {
│        "descricao": "Serviços de TI - desenvolvimento",
│        "valor_unitario": 12500.00,
│        "unidade": "hora",
│        "data_referencia": "2025-08-15"
│      }
│    ]
│  }

[09:15:23.250] tool_call_start 🔧
Chamando ferramenta: sugerir_requisitos_tecnicos
├─ Parâmetros:
│  {
│    "objeto_contratacao": "desenvolvimento de software"
│  }

[09:15:23.310] tool_call_end ✅ (60ms)
Ferramenta sugerir_requisitos_tecnicos concluída com sucesso
├─ Resultado:
│  {
│    "sucesso": true,
│    "requisitos_sugeridos": [
│      "Compatibilidade com sistemas operacionais Linux e Windows",
│      "Suporte a banco de dados PostgreSQL ou MySQL",
│      "Interface responsiva para dispositivos móveis",
│      ...
│    ]
│  }

[09:15:23.312] tool_call_start 🔧
Chamando ferramenta: sugerir_criterios_sustentabilidade
├─ Parâmetros:
│  {
│    "objeto_contratacao": "desenvolvimento de software"
│  }

[09:15:23.355] tool_call_end ✅ (43ms)
Ferramenta sugerir_criterios_sustentabilidade concluída com sucesso

[09:15:23.360] thinking 🧠
Coletor Conversacional processando resultados das ferramentas

[09:15:24.890] response_generated ✅
Coletor Conversacional gerou resposta
├─ Preview:
│  "Ótimo! Encontrei algumas informações que podem ajudar:
│  
│  📋 Requisitos técnicos sugeridos (baseado em ETPs similares):
│  - Compatibilidade com Linux e Windows
│  - Suporte PostgreSQL/MySQL
│  ..."

[09:15:24.895] agent_end ✅
Coletor Conversacional finalizou processamento com sucesso

Total: 1.894s
Tools executadas: 3
Tempo total em tools: 337ms (17.8% do tempo total)
```

---

## 🎨 UI do LogViewer

### Layout

```
┌────────────────────────────────────────────┐
│  🖥️ Logs dos Agentes              [42]    │
├────────────────────────────────────────────┤
│                                            │
│  🔵 agent_start  09:15:23  Coletor        │
│  └─ Coletor Conversacional iniciou...    │
│                                            │
│  🧠 thinking  09:15:23  Coletor    [▼]    │
│  └─ Coletor Conversacional tem 5...      │
│     ├─ Ferramentas: [buscar_preco...]    │
│                                            │
│  🔧 tool_call_start  09:15:23  [▼]        │
│  └─ Chamando ferramenta: buscar_preco... │
│     ├─ Parâmetros:                        │
│     │  {                                  │
│     │    "descricao_item": "desenv..."   │
│     │  }                                  │
│                                            │
│  ✅ tool_call_end  09:15:23  [234ms] [▼]  │
│  └─ Ferramenta buscar_precos_refere...   │
│     ├─ Resultado:                         │
│     │  {                                  │
│     │    "sucesso": true,                 │
│     │    "precos": [...]                  │
│     │  }                                  │
│                                            │
│  ... (auto-scroll para novos eventos)     │
└────────────────────────────────────────────┘
```

### Cores e Ícones

- 🔵 **agent_start**: Azul
- ✅ **agent_end/tool_call_end**: Verde
- 🔧 **tool_call_start**: Roxo
- ❌ **tool_call_error/error**: Vermelho
- 🧠 **thinking**: Amarelo (pulsando)
- ✅ **response_generated**: Verde esmeralda

---

## 📝 Como Integrar no Chat

### 1. **Adicionar state para logs**

```typescript
const [agenteLogs, setAgenteLogs] = useState<AgenteLogEvent[]>([]);
const [showLogs, setShowLogs] = useState(false);
```

### 2. **Escutar evento 'agente_log'**

```typescript
socket.on('agente_log', (log: AgenteLogEvent) => {
  setAgenteLogs((prev) => [...prev, log]);
});
```

### 3. **Renderizar LogViewer**

```typescript
<div className="flex h-screen">
  {/* Chat Panel */}
  <div className="flex-1">
    <ChatInterface ... />
  </div>
  
  {/* Log Panel (toggle) */}
  {showLogs && (
    <div className="w-1/3 min-w-[400px]">
      <LogViewer logs={agenteLogs} isVisible={showLogs} />
    </div>
  )}
</div>
```

### 4. **Botão de Toggle**

```typescript
<button onClick={() => setShowLogs(!showLogs)}>
  <Terminal className="h-5 w-5" />
  {showLogs ? 'Ocultar Logs' : 'Mostrar Logs'}
</button>
```

---

## 🚀 Benefícios

### Para Desenvolvedores
- ✅ Debug em tempo real
- ✅ Performance monitoring (tempo de execução)
- ✅ Verificação de parâmetros/resultados
- ✅ Identificação rápida de erros

### Para Usuários
- ✅ Transparência total ("O que o agente está fazendo?")
- ✅ Confiança (ver as fontes de dados)
- ✅ Educação (entender o processo)
- ✅ Feedback visual de progresso

### Para QA/Testing
- ✅ Logs exportáveis para análise
- ✅ Reprodução de problemas
- ✅ Validação de comportamento
- ✅ Métricas de performance

---

## 📊 Métricas Disponíveis

Com os logs, é possível calcular:

1. **Tempo médio de execução por ferramenta**
2. **Taxa de sucesso/erro**
3. **Ferramentas mais utilizadas**
4. **Tempo total de processamento**
5. **Gargalos de performance**

---

## 🔧 Configurações Futuras

### Filtros
- [ ] Filtrar por tipo de evento
- [ ] Filtrar por agente
- [ ] Busca em logs
- [ ] Exportar para JSON/CSV

### Visualizações
- [ ] Timeline visual
- [ ] Gráfico de performance
- [ ] Estatísticas agregadas
- [ ] Modo compacto/detalhado

### Persistência
- [ ] Salvar logs no backend (Redis)
- [ ] Histórico de sessões
- [ ] Download de logs

---

## 📚 Arquivos Modificados/Criados

### Backend
1. ✅ `/apps/backend/src/agentes/base-agente.ts` - Tipos e emissão de logs
2. ✅ `/apps/backend/src/chat/chat.gateway.ts` - Envio via WebSocket

### Frontend
3. ✅ `/apps/web/src/components/chat/LogViewer.tsx` - Componente de visualização

### Shared
4. ✅ `/packages/shared-types/src/agente-log.types.ts` - Tipos compartilhados

---

## ✅ Status

- ✅ Tipos definidos
- ✅ BaseAgente emitindo logs
- ✅ ChatGateway enviando via WebSocket
- ✅ LogViewer component criado
- ⏳ Integração na UI do chat (próximo passo)
- ⏳ Teste end-to-end

---

**Implementado por**: GitHub Copilot + Karnagge  
**Data**: 20 de Outubro de 2025  
**Status**: ✅ **80% COMPLETO** - Falta apenas integrar na UI principal
