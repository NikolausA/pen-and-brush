import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CanvasHandle } from "@/components/smart";
import { Pane, Popover, Menu, Button, toaster } from "evergreen-ui";
import { Download, Save } from "lucide-react";
import { NewProjectModal } from "@/components/simple";
import { exportStageToPNG } from "@/core/utils/exportCanvas";

interface FileMenuProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  onCreateProject: (
    name: string,
    width: number,
    height: number
  ) => Promise<void>;
  stageRef?: React.RefObject<CanvasHandle> | null;
  projectName?: string;
  projectId?: string;
  onSave?: () => Promise<void>;
}

export const FileMenu = ({
  isModalOpen,
  setIsModalOpen,
  onCreateProject,
  stageRef,
  projectName = "drawing",
  projectId,
  onSave,
}: FileMenuProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // НОВОЕ

  // НОВОЕ: Реализация сохранения проекта
  const saveProject = async () => {
    setIsMenuOpen(false);

    if (!projectId) {
      toaster.warning("Проект не найден", {
        description: "Невозможно сохранить проект",
        duration: 3,
      });
      return;
    }

    setIsSaving(true);

    try {
      // Если передан callback от родителя, используем его
      if (onSave) {
        await onSave();
        toaster.success("Проект сохранен", {
          description: "Все изменения успешно сохранены",
          duration: 3,
        });
      } else {
        // Автоматическое сохранение уже происходит при каждом изменении
        toaster.success("Проект сохранен", {
          description: "Изменения сохраняются автоматически",
          duration: 3,
        });
      }

      console.log("✅ Project saved:", projectId);
    } catch (error) {
      console.error("❌ Save error:", error);
      toaster.danger("Ошибка при сохранении проекта", {
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
        duration: 5,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsMenuOpen(false);

    if (!stageRef || !stageRef.current) {
      toaster.warning("Canvas не готов к экспорту", {
        description: "Пожалуйста, подождите загрузки редактора",
        duration: 3,
      });
      console.error("Stage ref is not available");
      return;
    }

    setIsExporting(true);

    try {
      const stage = stageRef.current.getStage();

      if (!stage) {
        throw new Error("Stage not found");
      }

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const fileName = `${projectName}_${timestamp}.png`;

      const result = exportStageToPNG(stage, {
        fileName,
        pixelRatio: 3,
        quality: 1,
      });

      if (result.success) {
        toaster.success("Изображение успешно экспортировано", {
          description: fileName,
          duration: 4,
        });
        console.log("✅ Export successful:", fileName);
      } else {
        throw new Error("Export failed");
      }
    } catch (error) {
      console.error("❌ Export error:", error);
      toaster.danger("Ошибка при экспорте изображения", {
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
        duration: 5,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Pane position="relative">
      <Popover
        isShown={isMenuOpen}
        onOpen={() => setIsMenuOpen(true)}
        onClose={() => setIsMenuOpen(false)}
        content={
          <Menu>
            <Menu.Item onSelect={() => setIsModalOpen(true)}>
              Новый проект
            </Menu.Item>
            {/* ОБНОВЛЕНО: Добавлена иконка и состояние загрузки */}
            <Menu.Item
              icon={<Save size={14} />}
              onSelect={saveProject}
              disabled={isSaving || !projectId}
            >
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Menu.Item>
            <Menu.Item
              icon={<Download size={14} />}
              onSelect={handleExport}
              disabled={isExporting || !stageRef}
            >
              {isExporting ? "Экспорт..." : "Экспорт в PNG"}
            </Menu.Item>
            <Menu.Item onSelect={() => navigate("/")}>Все проекты</Menu.Item>
          </Menu>
        }
      >
        <Button appearance="minimal" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          Файл
        </Button>
      </Popover>
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={onCreateProject}
      />
    </Pane>
  );
};
