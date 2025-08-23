import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Pane, majorScale } from 'evergreen-ui';
import { NewProjectModal } from '@/components/simple';
import { ProjectList } from '@/components/smart';
import { HeaderHome } from '@/components/ui';
import { getProjects, createProject, setCurrentProject } from '@/core/store/slices/projects-slice';
import type { RootState, AppDispatch } from '@/core/store';

export const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { projects, loading, error } = useSelector((state: RootState) => state.projects);

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  const handleClick = () => setIsModalOpen(true);

  const handleCreateProject = (name: string, width: number, height: number) => {
    dispatch(createProject({ name, width, height })).then((action) => {
      if (createProject.fulfilled.match(action)) {
        dispatch(setCurrentProject(action.payload));
        setIsModalOpen(false);
      }
    });
  };

  const handleDelete = (id: string) => {
    dispatch(deleteProject(id));
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Pane
      padding={majorScale(4)}
      display="flex"
      flexDirection="column"
      alignItems="center"
      maxWidth={1200}
      width="100%"
      margin="auto"
    >
      <HeaderHome
        title="Мои проекты"
        buttonText="Новый проект"
        searchQuery={searchQuery}
        onButtonClick={handleClick}
        onSearchChange={setSearchQuery}
      />
      {loading && <Pane>Loading...</Pane>}
      {error && <Pane color="danger">{error}</Pane>}
      <ProjectList projects={filteredProjects} onDelete={handleDelete} />
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </Pane>
  );
};