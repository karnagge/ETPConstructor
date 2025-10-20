import { useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import { useProjetosStore } from '../../stores/projects.store';
import { ProjectTree } from './ProjectTree';
import { CreateProjectDialog } from './CreateProjectDialog';
import { Button } from '../ui/button';

interface LeftSidebarProps {
  className?: string;
  onNewETP?: () => void;
}

export function LeftSidebar({ className, onNewETP }: LeftSidebarProps) {
  const { projetos, loading, fetchProjetos } = useProjetosStore();

  useEffect(() => {
    fetchProjetos();
  }, [fetchProjetos]);

  return (
    <div className={className}>
      <div className="flex h-full flex-col">
        {/* App Header */}
        <div className="border-b border-neutral-200 px-4 py-4">
          <h1 className="text-xl font-bold text-neutral-900">
            ETP Constructor
          </h1>
          <p className="text-sm text-neutral-500">
            Geração Automatizada de ETPs
          </p>
        </div>

        {/* Novo ETP Button */}
        <div className="border-b border-neutral-200 px-4 py-3">
          <Button
            onClick={onNewETP}
            className="w-full justify-center gap-2"
            size="default"
          >
            <FileText className="h-4 w-4" />
            Novo ETP
          </Button>
        </div>

        {/* Projects Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-900">Projetos</h2>
          <CreateProjectDialog>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </CreateProjectDialog>
        </div>

        {/* Project Tree */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading && projetos.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-neutral-500">
              Carregando projetos...
            </div>
          ) : projetos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-neutral-500">Nenhum projeto ainda</p>
              <p className="mt-1 text-xs text-neutral-400">
                Clique em + para criar
              </p>
            </div>
          ) : (
            <ProjectTree projetos={projetos} />
          )}
        </div>
      </div>
    </div>
  );
}
