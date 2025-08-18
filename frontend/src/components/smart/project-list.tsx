import { ProjectCard } from '@/components/simple';
import type { IProjectListProps } from '@/core/types/interfaces';
import { Pane, Heading } from 'evergreen-ui';

export const ProjectList = ({ projects, onDelete }: IProjectListProps) => {
  if (!projects.length) {
    return <Heading size={400}>Проекты отсутствуют</Heading>;
  }
    
  return (
    <Pane 
      display="flex" 
      flexWrap="wrap" 
      justifyContent="center" 
      marginX={-12} 
      gap={16}
    >
      {projects.map(project => (
        <ProjectCard 
          key={project.id} 
          id={project.id} 
          name={project.name} 
          onDelete={onDelete} 
        />
      ))}
    </Pane>
  );
};