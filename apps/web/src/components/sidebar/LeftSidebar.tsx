import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useProjetosStore } from '../../stores/projects.store';
import { ProjectTree } from './ProjectTree';
import { CreateProjectDialog } from './CreateProjectDialog';
import { Button } from '../ui/button';

interface LeftSidebarProps {
  className?: string;
}

export function LeftSidebar({ className }: LeftSidebarProps) {
  const { projetos, loading, fetchProjetos } = useProjetosStore();

  useEffect(() => {
    fetchProjetos();
  }, [fetchProjetos]);

  return (
    <div className={className}>
      <div className="flex h-full flex-col">
        {/* Header */}
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
