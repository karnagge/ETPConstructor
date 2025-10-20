import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { VersionItem } from './VersionItem';
import { apiService } from '../../services/api.service';
import { Loader2 } from 'lucide-react';

/**
 * T143: VersionHistory component
 * Modal listing all document versions
 */
interface Version {
  id: string;
  numeroVersao: number;
  alteracoes: string | null;
  criadoEm: string;
  conteudoSecoes: any;
}

interface VersionHistoryProps {
  documentoId: string;
  open: boolean;
  onClose: () => void;
  onRestore?: (numeroVersao: number) => void;
}

export function VersionHistory({
  documentoId,
  open,
  onClose,
  onRestore,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // T145: Fetch versions from API
  useEffect(() => {
    if (open && documentoId) {
      fetchVersions();
    }
  }, [open, documentoId]);

  const fetchVersions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.get(
        `/documentos/${documentoId}/versoes?limit=10`,
      );

      if (response.sucesso) {
        setVersions(response.dados);
      } else {
        setError('Erro ao carregar versões');
      }
    } catch (err) {
      console.error('[VersionHistory] Error fetching versions:', err);
      setError('Erro ao carregar versões');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (numeroVersao: number) => {
    try {
      // T147: Call restore endpoint
      const response = await apiService.post(
        `/documentos/${documentoId}/versoes/${numeroVersao}/restaurar`,
      );

      if (response.sucesso) {
        // T149: Reload documento after successful restoration
        onRestore?.(numeroVersao);
        onClose();
      }
    } catch (err) {
      console.error('[VersionHistory] Error restoring version:', err);
      setError('Erro ao restaurar versão');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Histórico de Versões</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-neutral-500">
                Carregando versões...
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && versions.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              Nenhuma versão encontrada
            </div>
          )}

          {!isLoading && !error && versions.length > 0 && (
            <div className="space-y-2">
              {versions.map((version, index) => (
                <VersionItem
                  key={version.id}
                  version={version}
                  isLatest={index === 0}
                  onRestore={handleRestore}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-200">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
