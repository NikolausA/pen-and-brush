import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CanvasHandle } from "@/components/smart";
import { Pane, Popover, Menu, Button, toaster } from "evergreen-ui";
import { Download } from "lucide-react";
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
  // НОВОЕ: Добавлены props для экспорта
  stageRef?: React.RefObject<CanvasHandle> | null;
  projectName?: string;
}

export const FileMenu = ({
  isModalOpen,
  setIsModalOpen,
  onCreateProject,
  stageRef, // НОВОЕ
  projectName = "drawing", // НОВОЕ
}: FileMenuProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // НОВОЕ

  function saveProject() {
    console.log("save");
  }

  // ОБНОВЛЕНО: Полная реализация экспорта
  const handleExport = async () => {
    // Закрываем меню перед началом экспорта
    setIsMenuOpen(false);

    // Проверяем наличие ref на Stage
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
      // Получаем Stage из ref
      const stage = stageRef.current.getStage();

      if (!stage) {
        throw new Error("Stage not found");
      }

      // Генерируем имя файла с датой и временем
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const fileName = `${projectName}_${timestamp}.png`;

      // Экспортируем с высоким качеством
      const result = exportStageToPNG(stage, {
        fileName,
        pixelRatio: 3, // Высокое качество
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
            <Menu.Item onSelect={saveProject}>Сохранить</Menu.Item>
            {/* ОБНОВЛЕНО: Добавлена иконка и индикатор загрузки */}
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
