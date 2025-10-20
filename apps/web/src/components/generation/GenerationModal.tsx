import { useEffect } from 'react';
import { X, Download, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentsStore } from '@/stores/documents.store';
import { ProgressBar } from './ProgressBar';
import { PhaseIndicator } from './PhaseIndicator';
import { SectionChecklist } from './SectionChecklist';

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentoUuid: string;
  className?: string;
}

export function GenerationModal({
  isOpen,
  onClose,
  documentoUuid,
  className,
}: GenerationModalProps) {
  const { generation } = useDocumentsStore();

  // Close modal automatically when generation completes
  useEffect(() => {
    if (!generation.isGenerating && generation.progress === 100 && generation.completedAt) {
      // Auto-close after 3 seconds of completion - disabled to let user download
      // const timer = setTimeout(() => {
      //   onClose();
      // }, 3000);
      // return () => clearTimeout(timer);
    }
  }, [generation.isGenerating, generation.progress, generation.completedAt]);

  if (!isOpen) return null;

  const isComplete = generation.progress === 100 && !generation.isGenerating;
  const hasError = !!generation.error;

  // Determine phase status
  const getPhaseStatus = () => {
    if (hasError) return 'error';
    if (isComplete) return 'completed';
    if (generation.isGenerating) return 'running';
    return 'idle';
  };

  const handleDownload = (type: 'docx' | 'pdf') => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const downloadUrl = `${baseUrl}/documentos/${documentoUuid}/download/${type}`;
    
    // Open in new tab to trigger download
    window.open(downloadUrl, '_blank');
  };

  const handleClose = () => {
    if (generation.isGenerating) {
      const confirmed = window.confirm(
        'A geração está em andamento. Tem certeza que deseja fechar? (A geração continuará em segundo plano)'
      );
      if (!confirmed) return;
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2',
          'rounded-lg bg-white shadow-2xl',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            {isComplete ? '✓ Geração Concluída' : 'Gerando Documento ETP'}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 px-6 py-6">
          {/* Error message */}
          {hasError && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Erro na Geração</h3>
                <p className="mt-1 text-sm text-red-700">{generation.error}</p>
              </div>
            </div>
          )}

          {/* Progress bar */}
          {!hasError && (
            <ProgressBar
              percent={generation.progress}
              phase={generation.currentPhase}
            />
          )}

          {/* Current phase indicator */}
          {!hasError && !isComplete && (
            <PhaseIndicator
              phase={generation.currentPhase}
              status={getPhaseStatus()}
            />
          )}

          {/* Section checklist */}
          {!hasError && (
            <SectionChecklist sections={generation.sections} />
          )}

          {/* Generation time */}
          {isComplete && generation.startedAt && generation.completedAt && (
            <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
              <span className="text-sm text-neutral-600">Tempo de geração</span>
              <span className="font-medium text-neutral-900">
                {Math.round(
                  (generation.completedAt.getTime() - generation.startedAt.getTime()) / 1000
                )}{' '}
                segundos
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          {hasError && (
            <button
              onClick={handleClose}
              className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
            >
              Fechar
            </button>
          )}

          {isComplete && (
            <>
              <button
                onClick={handleClose}
                className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
              >
                Fechar
              </button>
              <button
                onClick={() => handleDownload('docx')}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Baixar DOCX
              </button>
            </>
          )}

          {generation.isGenerating && (
            <button
              onClick={handleClose}
              className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
            >
              Minimizar
            </button>
          )}
        </div>
      </div>
    </>
  );
}
