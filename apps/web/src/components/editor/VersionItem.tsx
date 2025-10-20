import { useState } from 'react';
import { Button } from '../ui/button';
import { Clock, RotateCcw, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

/**
 * T144: VersionItem component
 * Shows version number, timestamp, and changes with restore button
 */
interface Version {
  id: string;
  numeroVersao: number;
  alteracoes: string | null;
  criadoEm: string;
}

interface VersionItemProps {
  version: Version;
  isLatest: boolean;
  onRestore: (numeroVersao: number) => void;
}

export function VersionItem({ version, isLatest, onRestore }: VersionItemProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // T147: "Restaurar" button handler
  const handleRestoreClick = () => {
    // T148: Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmRestore = () => {
    onRestore(version.numeroVersao);
    setShowConfirmation(false);
  };

  return (
    <>
      <div
        className={`
        p-4 border rounded-lg transition-colors
        ${
          isLatest
            ? 'bg-blue-50 border-blue-200'
            : 'bg-white border-neutral-200 hover:border-neutral-300'
        }
      `}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Version number and badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-neutral-900">
                Versão {version.numeroVersao}
              </span>
              {isLatest && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                  Atual
                </span>
              )}
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1.5 text-sm text-neutral-500 mb-2">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDate(version.criadoEm)}</span>
            </div>

            {/* Changes description */}
            {version.alteracoes && (
              <div className="text-sm text-neutral-700 bg-neutral-50 p-2 rounded border border-neutral-200 mt-2">
                {version.alteracoes}
              </div>
            )}
          </div>

          {/* Restore button (only if not latest version) */}
          {!isLatest && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestoreClick}
              className="ml-4"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )}
        </div>
      </div>

      {/* T148: Confirmation dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Confirmar restauração
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Você está prestes a restaurar a <strong>Versão {version.numeroVersao}</strong>.
              </p>
              <p className="text-sm bg-amber-50 border border-amber-200 rounded p-3 text-amber-900">
                <strong>Importante:</strong> Esta ação criará uma nova versão com o
                conteúdo da versão {version.numeroVersao}. A versão atual não será
                perdida.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestore}>
              Confirmar restauração
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
