import { Pane, Heading } from 'evergreen-ui';
import { ProjectCard } from '@/components/simple';
import type { Project } from '@/core/store/slices/projects-slice';

interface ProjectListProps {
  projects: Project[];
  onDelete: (id: string) => void;
}

export const ProjectList = ({ projects, onDelete }: ProjectListProps) => {
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