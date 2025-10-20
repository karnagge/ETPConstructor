import { ChevronRight } from 'lucide-react';

/**
 * T138: SectionSelector component
 * Shows 9 sections of ETP document for navigation
 */
interface Section {
  id: string;
  titulo: string;
  numero: string;
}

interface SectionSelectorProps {
  sections: Section[];
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
}

const DEFAULT_SECTIONS: Section[] = [
  { id: '1_definicao_objeto', titulo: 'Definição do Objeto', numero: '1' },
  { id: '2_justificativa', titulo: 'Justificativa da Contratação', numero: '2' },
  { id: '3_especificacoes', titulo: 'Especificações Técnicas', numero: '3' },
  { id: '4_estimativa_custos', titulo: 'Estimativa de Custos', numero: '4' },
  {
    id: '5_gestao_fiscalizacao',
    titulo: 'Gestão e Fiscalização',
    numero: '5',
  },
  {
    id: '6_obrigacoes_contratante',
    titulo: 'Obrigações do Contratante',
    numero: '6',
  },
  {
    id: '7_obrigacoes_contratada',
    titulo: 'Obrigações da Contratada',
    numero: '7',
  },
  {
    id: '8_criterios_aceitacao',
    titulo: 'Critérios de Aceitação',
    numero: '8',
  },
  { id: '9_sancoes', titulo: 'Sanções Administrativas', numero: '9' },
];

export function SectionSelector({
  sections = DEFAULT_SECTIONS,
  activeSection,
  onSelectSection,
}: SectionSelectorProps) {
  return (
    <div className="w-64 border-r border-neutral-200 bg-neutral-50 overflow-y-auto">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-700">Seções do ETP</h3>
        <p className="text-xs text-neutral-500 mt-1">
          Selecione uma seção para editar
        </p>
      </div>

      <nav className="p-2">
        {sections.map((section) => {
          const isActive = section.id === activeSection;

          return (
            <button
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className={`
                w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }
              `}
            >
              <span
                className={`
                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs
                ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-neutral-200 text-neutral-600'
                }
              `}
              >
                {section.numero}
              </span>

              <span className="flex-1 text-sm">{section.titulo}</span>

              {isActive && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
