# 🔧 Fix: Projetos Não Carregando no Frontend

## 🐛 Problema Identificado

O frontend não estava carregando projetos porque:

1. ❌ **Backend não estava rodando** na porta 3001
2. ❌ **Banco de dados não estava populado** com dados de teste

## ✅ Solução Aplicada

### 1. Iniciar Backend

```bash
cd /home/karnagge/dev/pessoal/ETPConstructor/apps/backend
pnpm dev
```

**Resultado**: Backend rodando em `http://localhost:3001`

### 2. Popular Banco de Dados

```bash
cd /home/karnagge/dev/pessoal/ETPConstructor/apps/backend
npx tsx prisma/seed.ts
```

**Resultado**: Dados criados:
- ✅ 1 Usuário: `admin@etp.gov.br`
- ✅ 4 Projetos (incluindo "Licitações TI 2025")
- ✅ 5 Documentos

### 3. Verificar API

```bash
curl http://localhost:3001/api/projetos
curl http://localhost:3001/api/documentos
```

**Resultado**: APIs retornando dados corretamente

---

## 🚀 Servidores Necessários

Para o sistema funcionar completamente, você precisa ter rodando:

| Serviço | Comando | Porta | Status |
|---------|---------|-------|--------|
| **PostgreSQL** | `docker compose up -d` | 5432 | ✅ Rodando |
| **Redis** | (incluído no docker-compose) | 6379 | ✅ Rodando |
| **Backend** | `cd apps/backend && pnpm dev` | 3001 | ✅ Rodando |
| **Frontend** | `cd apps/web && pnpm dev` | 3000 | ✅ Rodando |

---

## 📋 Checklist de Inicialização

Sempre que reiniciar o desenvolvimento:

```bash
# Terminal 1: Docker (PostgreSQL + Redis)
cd /home/karnagge/dev/pessoal/ETPConstructor
docker compose up -d

# Terminal 2: Backend
cd /home/karnagge/dev/pessoal/ETPConstructor/apps/backend
pnpm dev

# Terminal 3: Frontend
cd /home/karnagge/dev/pessoal/ETPConstructor/apps/web
pnpm dev
```

Ou use o script helper:

```bash
./dev.sh
# Escolha opção 1 (Docker)
# Depois opção 9 (Iniciar tudo com Turborepo)
```

---

## 🔍 Como Verificar Se Está Tudo OK

### 1. Verificar Backend
```bash
curl http://localhost:3001/api/projetos
```
**Esperado**: JSON com lista de projetos

### 2. Verificar Frontend
- Abra `http://localhost:3000`
- Sidebar esquerda deve mostrar projetos
- Clique em um projeto → documentos devem aparecer

### 3. Verificar WebSocket
- Abra um ETP
- Envie uma mensagem
- Deve receber resposta do agente

---

## 🎓 Dados de Teste Disponíveis

Após rodar o seed, você tem:

**Usuário**:
- Email: `admin@etp.gov.br`
- Nome: Administrador Teste
- UUID: (gerado automaticamente)

**Projetos**:
- "Licitações TI 2025" (mais recente)
- "Teste Projeto"
- E outros de seeds anteriores

**Documentos**:
- "ETP - Exemplo de Desenvolvimento" (dentro de projeto)
- "GPU 2", "Teste 2 de projeto", etc.

---

## 📝 Arquivo de Configuração

O frontend usa o `.env` para saber onde está o backend:

```properties
# /apps/web/.env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

**Importante**: Se mudar a porta do backend, atualize este arquivo!

---

## 🐛 Troubleshooting

### Problema: "Cannot connect to API"
**Solução**: Verifique se o backend está rodando:
```bash
curl http://localhost:3001/api/projetos
```

### Problema: "Empty projects list"
**Solução**: Rode o seed novamente:
```bash
cd apps/backend && npx tsx prisma/seed.ts
```

### Problema: "Database connection error"
**Solução**: Verifique se o Docker está rodando:
```bash
docker ps | grep postgres
```

---

## ✅ Status Atual

- ✅ Backend rodando na porta 3001
- ✅ Frontend rodando na porta 3000
- ✅ Banco populado com dados de teste
- ✅ APIs respondendo corretamente
- ✅ WebSocket configurado

**Agora é só recarregar o navegador!** 🎉

---

**Data**: 20 de Outubro de 2025  
**Fix aplicado por**: GitHub Copilot + Karnagge
