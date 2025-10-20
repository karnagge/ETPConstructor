import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

interface SectionChecklistProps {
  sections: Section[];
  className?: string;
}

const SECTION_TITLES: Record<string, string> = {
  '1_definicao_objeto': '1. Definição do Objeto',
  '2_justificativa': '2. Justificativa da Contratação',
  '3_especificacoes': '3. Especificações Técnicas',
  '4_estimativa_custos': '4. Estimativa de Custos',
  '5_gestao_fiscalizacao': '5. Gestão e Fiscalização',
  '6_obrigacoes_contratante': '6. Obrigações do Contratante',
  '7_obrigacoes_contratada': '7. Obrigações da Contratada',
  '8_criterios_aceitacao': '8. Critérios de Aceitação',
  '9_sancoes': '9. Sanções Administrativas',
};

export function SectionChecklist({ sections, className }: SectionChecklistProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-sm font-semibold text-neutral-700 mb-3">
        Seções do Documento (9/9)
      </h3>

      <div className="space-y-1">
        {sections.map((section) => {
          const title = SECTION_TITLES[section.id] || section.title;

          return (
            <div
              key={section.id}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
                section.status === 'completed' && 'bg-green-50',
                section.status === 'generating' && 'bg-blue-50',
                section.status === 'error' && 'bg-red-50',
                section.status === 'pending' && 'bg-neutral-50'
              )}
            >
              {/* Status icon */}
              {section.status === 'pending' && (
                <Circle className="h-4 w-4 text-neutral-400" aria-label="Pendente" />
              )}
              {section.status === 'generating' && (
                <Loader2
                  className="h-4 w-4 animate-spin text-blue-600"
                  aria-label="Gerando"
                />
              )}
              {section.status === 'completed' && (
                <CheckCircle2
                  className="h-4 w-4 text-green-600"
                  aria-label="Concluído"
                />
              )}
              {section.status === 'error' && (
                <Circle className="h-4 w-4 text-red-600" aria-label="Erro" />
              )}

              {/* Section title */}
              <span
                className={cn(
                  'flex-1 text-sm',
                  section.status === 'completed' && 'text-green-700 font-medium',
                  section.status === 'generating' && 'text-blue-700 font-medium',
                  section.status === 'error' && 'text-red-700',
                  section.status === 'pending' && 'text-neutral-600'
                )}
              >
                {title}
              </span>

              {/* Status badge (optional) */}
              {section.status === 'generating' && (
                <span className="text-xs text-blue-600">Gerando...</span>
              )}
              {section.status === 'error' && (
                <span className="text-xs text-red-600">Erro</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3">
        <span className="text-xs text-neutral-600">
          {sections.filter((s) => s.status === 'completed').length} de{' '}
          {sections.length} seções concluídas
        </span>
        {sections.every((s) => s.status === 'completed') && (
          <span className="text-xs font-medium text-green-600">✓ Completo</span>
        )}
      </div>
    </div>
  );
}
