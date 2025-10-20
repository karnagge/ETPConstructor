import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface PhaseIndicatorProps {
  phase: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  className?: string;
}

const PHASE_DESCRIPTIONS: Record<string, string> = {
  'Validação Inicial': 'Verificando dados coletados e requisitos legais',
  'Análise Especializada': 'Agentes especializados gerando conteúdo técnico',
  'Montagem do Documento': 'Estruturando seções e formatando documento',
  'Finalizando': 'Gerando arquivo DOCX final',
  'Validação Legal': 'Validando conformidade legal',
};

const STATUS_CONFIG = {
  idle: {
    icon: null,
    color: 'text-neutral-400',
    bgColor: 'bg-neutral-100',
    animate: undefined,
  },
  running: {
    icon: Loader2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    animate: 'animate-spin',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    animate: undefined,
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    animate: undefined,
  },
};

export function PhaseIndicator({ phase, status, className }: PhaseIndicatorProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const description = PHASE_DESCRIPTIONS[phase] || 'Processando...';

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg p-4 transition-colors',
        config.bgColor,
        className
      )}
    >
      {/* Status icon */}
      {Icon && (
        <Icon
          className={cn('mt-0.5 h-5 w-5', config.color, config.animate)}
          aria-hidden="true"
        />
      )}

      {/* Phase info */}
      <div className="flex-1 space-y-1">
        <h3 className={cn('font-semibold text-sm', config.color)}>
          {phase}
        </h3>
        <p className="text-xs text-neutral-600">{description}</p>
      </div>

      {/* Status badge */}
      {status === 'completed' && (
        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          Concluído
        </span>
      )}
      {status === 'running' && (
        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
          Em andamento
        </span>
      )}
      {status === 'error' && (
        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
          Erro
        </span>
      )}
    </div>
  );
}
