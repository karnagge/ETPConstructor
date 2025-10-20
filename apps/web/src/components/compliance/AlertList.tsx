import { AlertItem } from './AlertItem';

interface Alert {
  regra: string;
  observacoes?: string;
  fundamentacao_legal?: string;
  criticidade: 'critica' | 'alerta' | 'informacao';
}

interface AlertListProps {
  alertas: Alert[];
  errosCriticos: Alert[];
}

/**
 * AlertList - Display all validation alerts and critical errors
 * T161: Renders alertas and erros in separate sections
 */
export function AlertList({ alertas, errosCriticos }: AlertListProps) {
  const hasIssues = errosCriticos.length > 0 || alertas.length > 0;

  if (!hasIssues) {
    return (
      <div className="flex items-center justify-center py-8 text-center">
        <div className="space-y-2">
          <div className="flex justify-center">
            <svg
              className="h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700">
            Nenhum problema detectado
          </p>
          <p className="text-xs text-gray-500">
            Todos os critérios legais foram atendidos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Critical Errors */}
      {errosCriticos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-red-800">
            Erros Críticos ({errosCriticos.length})
          </h3>
          <p className="text-xs text-red-600 mb-3">
            Estes erros impedem a geração do documento. Corrija-os antes de
            continuar.
          </p>
          <div className="space-y-2">
            {errosCriticos.map((erro, idx) => (
              <AlertItem key={`erro-${idx}`} {...erro} />
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-yellow-800">
            Alertas ({alertas.length})
          </h3>
          <p className="text-xs text-yellow-600 mb-3">
            Recomendações para melhorar a conformidade legal.
          </p>
          <div className="space-y-2">
            {alertas.map((alerta, idx) => (
              <AlertItem key={`alerta-${idx}`} {...alerta} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
