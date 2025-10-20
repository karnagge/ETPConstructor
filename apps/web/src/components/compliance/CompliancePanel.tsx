import { AlertList } from './AlertList';
import { cn } from '@/lib/utils';

interface CompliancePanelProps {
  percentualConformidade: number;
  totalRegras: number;
  regrasValidas: number;
  errosCriticos: any[];
  alertas: any[];
}

/**
 * CompliancePanel - Display compliance percentage gauge and alerts
 * T160: Shows percentual gauge with visual indicator
 * T161: Renders AlertList with errors and warnings
 */
export function CompliancePanel({
  percentualConformidade,
  totalRegras,
  regrasValidas,
  errosCriticos,
  alertas,
}: CompliancePanelProps) {
  const getComplianceColor = (percent: number) => {
    if (percent >= 90) return 'text-green-600';
    if (percent >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBgColor = (percent: number) => {
    if (percent >= 90) return 'bg-green-500';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getComplianceStatus = (percent: number) => {
    if (percent >= 90) return 'Excelente';
    if (percent >= 70) return 'Boa';
    if (percent >= 50) return 'Regular';
    return 'Inadequada';
  };

  return (
    <div className="space-y-6">
      {/* Compliance Gauge */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Conformidade Legal
        </h2>

        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentualConformidade / 100)}`}
                className={cn(
                  'transition-all duration-1000',
                  getComplianceBgColor(percentualConformidade),
                )}
                strokeLinecap="round"
              />
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={cn(
                  'text-3xl font-bold',
                  getComplianceColor(percentualConformidade),
                )}
              >
                {percentualConformidade.toFixed(0)}%
              </span>
              <span className="text-xs text-gray-500">
                {getComplianceStatus(percentualConformidade)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
          <div className="text-center">
            <p className="text-gray-500 text-xs">Total de Regras</p>
            <p className="font-semibold text-gray-900">{totalRegras}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs">Válidas</p>
            <p className="font-semibold text-green-600">{regrasValidas}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs">Problemas</p>
            <p className="font-semibold text-red-600">
              {totalRegras - regrasValidas}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts and Errors */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Problemas Identificados
        </h2>
        <AlertList alertas={alertas} errosCriticos={errosCriticos} />
      </div>
    </div>
  );
}
