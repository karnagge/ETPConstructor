import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { Projeto, useProjetosStore } from '../../stores/projects.store';
import { DocumentItem } from './DocumentItem';
import { cn } from '../../lib/utils';

interface ProjectItemProps {
  projeto: Projeto;
}

export function ProjectItem({ projeto }: ProjectItemProps) {
  const { expandedProjects, toggleExpanded } = useProjetosStore();
  const isExpanded = expandedProjects.has(projeto.uuid);
  const documentCount = projeto.documentos?.length || 0;

  return (
    <div className="space-y-0.5">
      {/* Project Header */}
      <button
        onClick={() => toggleExpanded(projeto.uuid)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100',
          'transition-colors duration-150'
        )}
      >
        {/* Expand/Collapse Icon */}
        {documentCount > 0 ? (
          isExpanded ? (
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-neutral-500" />
          )
        ) : (
          <div className="h-4 w-4" />
        )}

        {/* Folder Icon with Project Color */}
        <Folder
          className="h-4 w-4"
          style={{ color: projeto.cor }}
          fill={projeto.cor}
          fillOpacity={0.2}
        />

        {/* Project Name */}
        <span className="flex-1 truncate text-left font-medium text-neutral-900">
          {projeto.nome}
        </span>

        {/* Document Count Badge */}
        {documentCount > 0 && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: projeto.cor }}
          >
            {documentCount}
          </span>
        )}
      </button>

      {/* Documents List (only show if expanded and has documents) */}
      {isExpanded && documentCount > 0 && (
        <div className="ml-6 space-y-0.5 border-l border-neutral-200 pl-2">
          {projeto.documentos?.map((documento) => (
            <DocumentItem
              key={documento.uuid}
              documento={documento}
              projetoCor={projeto.cor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
