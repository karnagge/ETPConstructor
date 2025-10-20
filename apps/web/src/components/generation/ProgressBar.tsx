import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percent: number;
  phase: string;
  className?: string;
}

const PHASE_THRESHOLDS = [
  { min: 0, max: 10, label: 'Iniciando validação', color: 'bg-blue-500' },
  { min: 10, max: 30, label: 'Validação inicial', color: 'bg-blue-600' },
  { min: 30, max: 60, label: 'Análise especializada', color: 'bg-indigo-600' },
  { min: 60, max: 90, label: 'Montagem do documento', color: 'bg-purple-600' },
  { min: 90, max: 100, label: 'Finalizando', color: 'bg-green-600' },
];

export function ProgressBar({ percent, phase, className }: ProgressBarProps) {
  const currentPhase = PHASE_THRESHOLDS.find(
    (p) => percent >= p.min && percent < p.max
  ) || PHASE_THRESHOLDS[PHASE_THRESHOLDS.length - 1];

  return (
    <div className={cn('w-full space-y-2', className)}>
      {/* Phase label */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-700">
          {phase || currentPhase.label}
        </span>
        <span className="text-neutral-500">{percent}%</span>
      </div>

      {/* Progress bar track */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        {/* Progress bar fill */}
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            currentPhase.color
          )}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Animated shimmer effect */}
          {percent < 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>

      {/* Phase indicators (5 dots) */}
      <div className="flex items-center justify-between pt-1">
        {PHASE_THRESHOLDS.map((phase, index) => {
          const isCompleted = percent > phase.max;
          const isCurrent = percent >= phase.min && percent < phase.max;

          return (
            <div
              key={index}
              className="flex flex-col items-center gap-1"
              title={phase.label}
            >
              {/* Dot indicator */}
              <div
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-300',
                  isCompleted && 'bg-green-500 ring-2 ring-green-200',
                  isCurrent && cn('ring-2 ring-offset-1', phase.color.replace('bg-', 'bg-'), 'ring-' + phase.color.replace('bg-', '')),
                  !isCompleted && !isCurrent && 'bg-neutral-300'
                )}
              />
              {/* Phase number */}
              <span
                className={cn(
                  'text-xs transition-colors',
                  (isCompleted || isCurrent) ? 'text-neutral-700 font-medium' : 'text-neutral-400'
                )}
              >
                {index + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
