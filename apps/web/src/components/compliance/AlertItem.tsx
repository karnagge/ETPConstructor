import { AlertCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertItemProps {
  regra: string;
  observacoes?: string;
  fundamentacao_legal?: string;
  criticidade: 'critica' | 'alerta' | 'informacao';
}

/**
 * AlertItem - Display single legal validation alert/error
 * T162: Badge shows severity (Crítico/Atenção/Info)
 * T164: Tooltip/expandable section shows legal reference
 */
export function AlertItem({
  regra,
  observacoes,
  fundamentacao_legal,
  criticidade,
}: AlertItemProps) {
  const icons = {
    critica: <XCircle className="h-4 w-4 text-red-500" />,
    alerta: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    informacao: <Info className="h-4 w-4 text-blue-500" />,
  };

  const badges = {
    critica: 'bg-red-100 text-red-800 border-red-200',
    alerta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    informacao: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const labels = {
    critica: 'Erro Crítico',
    alerta: 'Atenção',
    informacao: 'Informação',
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-3 space-y-2 text-sm',
        criticidade === 'critica' && 'border-red-200 bg-red-50',
        criticidade === 'alerta' && 'border-yellow-200 bg-yellow-50',
        criticidade === 'informacao' && 'border-blue-200 bg-blue-50',
      )}
    >
      <div className="flex items-start gap-2">
        {icons[criticidade]}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
                badges[criticidade],
              )}
            >
              {labels[criticidade]}
            </span>
          </div>
          <p className="font-medium text-gray-900">{regra}</p>
          {observacoes && (
            <p className="text-gray-600 text-xs">{observacoes}</p>
          )}
          {fundamentacao_legal && (
            <details className="text-xs text-gray-500 mt-1">
              <summary className="cursor-pointer hover:text-gray-700">
                Fundamentação legal
              </summary>
              <p className="mt-1 pl-4 border-l-2 border-gray-300">
                {fundamentacao_legal}
              </p>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
