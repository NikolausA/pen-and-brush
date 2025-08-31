import { useState } from "react";
import { useDispatch } from "react-redux";
import { Pane, majorScale } from "evergreen-ui";
import { NewProjectModal } from "@/components/simple";
import { ProjectList } from "@/components/smart";
import { HeaderHome } from "@/components/ui";
import {
  createProject,
  setCurrentProject,
  deleteProject,
} from "@/core/store/slices/projects-slice";
// import type { RootState, AppDispatch } from "@/core/store";
import type { AppDispatch } from "@/core/store";
import { useGetProjectsQuery } from "@/core/store/api";

export const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: projects, isLoading, isError, error } = useGetProjectsQuery();

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

  if (isLoading) {
    <Pane>Loading...</Pane>;
  }
  if (isError) {
    <Pane color="danger">Error: {String(error)}</Pane>;
  }
  if (!projects || projects.length === 0) {
    return <Pane>Нет проектов</Pane>;
  }

  const filteredProjects = projects.filter((project) =>
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

      <ProjectList projects={filteredProjects} onDelete={handleDelete} />
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </Pane>
  );
};
