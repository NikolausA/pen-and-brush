import { ProjectCard } from '@/components/simple/project-card/project-card';
import type { IProjectListProps } from '@/core/types/interfaces';

import styles from './project-list.module.scss';

export const ProjectList = ({ projects, onDelete }: IProjectListProps) => {
  if (!projects.length) {
    return <h2 className={styles.empty}>Проекты отсутствуют</h2>;
  }
    
  return (
    <div className={styles.grid}>
      {projects.map(project => (
        <ProjectCard key={project.id} id={project.id} name={project.name} onDelete={onDelete} />
      ))}
    </div>
  );
};
