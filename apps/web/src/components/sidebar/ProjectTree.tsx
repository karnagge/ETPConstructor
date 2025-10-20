import { Projeto } from '../../stores/projects.store';
import { ProjectItem } from './ProjectItem';

interface ProjectTreeProps {
  projetos: Projeto[];
}

export function ProjectTree({ projetos }: ProjectTreeProps) {
  return (
    <div className="space-y-1">
      {projetos.map((projeto) => (
        <ProjectItem key={projeto.uuid} projeto={projeto} />
      ))}
    </div>
  );
}
