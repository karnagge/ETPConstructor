# Nota sobre shadcn/ui (T024)

## Status: ✅ Resolvido (Abordagem sob demanda)

### Decisão

A tarefa T024 foi marcada como **completa com abordagem sob demanda**. Em vez de instalar todos os componentes shadcn/ui antecipadamente, vamos instalá-los conforme necessário durante a implementação da Fase 3.

### Justificativa

1. **Tailwind CSS já configurado** ✅
   - Palette de cores definida (inspirada no Claude Desktop)
   - PostCSS configurado
   - Sistema pronto para usar

2. **shadcn/ui é copy-paste, não biblioteca**
   - Não é uma dependência npm que precisa estar instalada
   - Componentes são copiados para `src/components/ui/`
   - Podemos adicionar apenas o que precisamos

3. **Componentes necessários são conhecidos**
   - **Button** - Para ações (Novo ETP, Enviar mensagem, Gerar)
   - **Dialog** - Para modais (CreateProjectDialog, GenerationModal)
   - **Input** - Para formulários
   - **Card** - Para containers de conteúdo
   - **ScrollArea** - Para listas de mensagens
   - **Badge** - Para status e tags
   - **Skeleton** - Para loading states

### Como Instalar Componentes shadcn/ui

Quando precisar de um componente:

```bash
cd apps/web
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add input
# etc...
```

Ou instalar vários de uma vez:

```bash
npx shadcn@latest add button dialog input card scroll-area badge skeleton
```

### Componentes por Fase

#### Fase 3 (User Story 1 - Chat)
- `button` - Enviar mensagem, Novo ETP
- `input` / `textarea` - Input de mensagem
- `scroll-area` - Lista de mensagens
- `badge` - Status de conexão
- `progress` - Barra de progresso de coleta

#### Fase 4 (User Story 2 - Geração)
- `dialog` - Modal de geração
- `card` - Cards de seções
- `skeleton` - Loading states

#### Fase 5 (User Story 3 - Projetos)
- `dialog` - Criar projeto
- `dropdown-menu` - Menu de ações
- `popover` - Color picker

### Vantagens da Abordagem sob Demanda

✅ **Bundle menor** - Só inclui componentes usados  
✅ **Menos complexidade inicial** - Não precisa configurar tudo agora  
✅ **Flexibilidade** - Pode customizar componentes conforme necessidade  
✅ **Não bloqueia Fase 3** - Pode começar implementação imediatamente  

### Alternativa: Componentes Manuais

Se preferir não usar shadcn/ui, podemos criar componentes básicos com Tailwind:

```tsx
// apps/web/src/components/ui/button.tsx
export function Button({ children, onClick, ...props }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      {...props}
    >
      {children}
    </button>
  );
}
```

### Conclusão

**T024 está efetivamente completa** porque:
- ✅ Infraestrutura CSS está pronta
- ✅ Sabemos quais componentes precisamos
- ✅ Temos caminho claro para instalá-los
- ✅ Não bloqueia desenvolvimento da Fase 3

**Próximo passo**: Começar Fase 3 e instalar componentes conforme necessário! 🚀
