import { useState } from "react";
import type { CanvasHandle } from "@/components/smart";
import { Pane, Heading } from "evergreen-ui";
import { FileMenu } from "@/components/ui/top-menu/file-menu";
import { useCreateProjectMutation } from "@/core/store/api";
import { useNavigate } from "react-router-dom";

interface TopMenuProps {
  stageRef?: React.RefObject<CanvasHandle> | null;
  projectName?: string;
  projectId?: string;
}

export const TopMenu = ({ stageRef, projectName, projectId }: TopMenuProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createProject] = useCreateProjectMutation();
  const navigate = useNavigate();

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

      console.log("Project created:", newProject);
      setIsModalOpen(false);

      // Переход на новый проект
      navigate(`/editor/${newProject.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <Pane
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      padding={12}
      borderBottom="default"
      background="white"
      height={60}
    >
      <Pane display="flex" alignItems="center" gap={16}>
        {/* ОБНОВЛЕНО: Передаем stageRef и projectName в FileMenu */}
        <FileMenu
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          onCreateProject={handleCreateProject}
          stageRef={stageRef}
          projectName={projectName}
          projectId={projectId}
        />
        <Heading size={600}>Имя проекта: {projectName}</Heading>
      </Pane>
    </Pane>
  );
};
