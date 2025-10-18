interface ProgressBarProps {
  progress: number;
  camposColetados: number;
  camposFaltantes: string[];
}

/**
 * T051: ProgressBar component
 * Shows collection progress (0-100%)
 */
export function ProgressBar({
  progress,
  camposColetados,
  camposFaltantes,
}: ProgressBarProps) {
  const isComplete = progress === 100;

  return (
    <div className="border-b border-neutral-200 p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-neutral-700">
          Progresso da Coleta
        </span>
        <span
          className={`text-sm font-bold ${
            isComplete ? 'text-green-600' : 'text-blue-600'
          }`}
        >
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status text */}
      <div className="mt-2 flex items-center justify-between text-xs text-neutral-600">
        <span>
          {camposColetados} de 11 campos coletados
        </span>
        {isComplete ? (
          <span className="text-green-600 font-medium flex items-center gap-1">
            <svg
              className="w-4 h-4"
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
            Completo!
          </span>
        ) : (
          <span>{camposFaltantes.length} campos faltando</span>
        )}
      </div>

      {/* Missing fields (collapsed, expandable) */}
      {!isComplete && camposFaltantes.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-700">
            Ver campos faltantes
          </summary>
          <ul className="mt-2 text-xs text-neutral-600 space-y-1 pl-4">
            {camposFaltantes.map((campo) => (
              <li key={campo} className="list-disc">
                {formatarNomeCampo(campo)}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/**
 * Helper to format field names for display
 */
function formatarNomeCampo(campo: string): string {
  const nomes: Record<string, string> = {
    objeto_contratacao: 'Objeto da Contratação',
    descricao_detalhada: 'Descrição Detalhada',
    justificativa_necessidade: 'Justificativa da Necessidade',
    orgao_contratante: 'Órgão Contratante',
    setor_requisitante: 'Setor Requisitante',
    modalidade_licitacao: 'Modalidade de Licitação',
    valor_estimado: 'Valor Estimado',
    prazo_execucao: 'Prazo de Execução',
    prazo_unidade: 'Unidade de Prazo',
    requisitos_tecnicos: 'Requisitos Técnicos',
    criterios_sustentabilidade: 'Critérios de Sustentabilidade',
  };

  return nomes[campo] || campo;
}
