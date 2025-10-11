import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pane, majorScale } from "evergreen-ui";
import { NewProjectModal } from "@/components/simple";
import { ProjectList } from "@/components/smart";
import { HeaderHome } from "@/components/ui";
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
} from "@/core/store/api";

export const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: projects, isLoading, isError, error } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  if (isError) {
    console.log(error);
  }

  const handleClick = () => setIsModalOpen(true);

  const handleCreateProject = async (
    name: string,
    width: number,
    height: number
  ) => {
    try {
      const newProject = await createProject({
        name,
        width,
        height,
      }).unwrap();

      navigate(`/projects/${newProject.id}`);
      console.log("Проект создан:", newProject);

      setIsModalOpen(false);
    } catch (err) {
      console.error("Ошибка при создании проекта:", err);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id).unwrap();
  };

  const filteredProjects =
    projects?.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

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

      {isLoading && <Pane>Loading...</Pane>}

      {filteredProjects.length > 0 ? (
        <ProjectList projects={filteredProjects} onDelete={handleDelete} />
      ) : (
        <Pane marginTop={majorScale(2)}>Нет проектов</Pane>
      )}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </Pane>
  );
};
