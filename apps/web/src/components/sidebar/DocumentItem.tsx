import { Circle, Clock, CheckCircle2, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DocumentoListItem {
  id: string;
  uuid: string;
  titulo: string;
  status: string;
  criadoEm: string;
  atualizadoEm: string;
}

interface DocumentItemProps {
  documento: DocumentoListItem;
  projetoCor: string;
  onClick?: (documentoUuid: string) => void;
}

const statusIcons = {
  RASCUNHO: Circle,
  EM_GERACAO: Clock,
  CONCLUIDO: CheckCircle2,
  ARQUIVADO: FileText,
};

const statusColors = {
  RASCUNHO: 'text-neutral-400',
  EM_GERACAO: 'text-blue-500',
  CONCLUIDO: 'text-green-500',
  ARQUIVADO: 'text-neutral-300',
};

export function DocumentItem({ documento, projetoCor, onClick }: DocumentItemProps) {
  const StatusIcon = statusIcons[documento.status as keyof typeof statusIcons] || FileText;
  const statusColor = statusColors[documento.status as keyof typeof statusColors] || 'text-neutral-400';

  const handleClick = () => {
    onClick?.(documento.uuid);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100',
        'transition-colors duration-150'
      )}
    >
      {/* Status Icon */}
      <StatusIcon className={cn('h-3.5 w-3.5', statusColor)} />

      {/* Document Title */}
      <span className="flex-1 truncate text-left text-neutral-700">
        {documento.titulo}
      </span>

      {/* Color Indicator */}
      <div
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: projetoCor }}
      />
    </button>
  );
}
