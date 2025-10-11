// src/pages/editor/Editor.tsx (или src/components/smart/Editor/Editor.tsx)
import { Pane } from "evergreen-ui";
import { TopMenu } from "@/components/ui/top-menu/top-menu.tsx";
import { useState, useCallback, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  EnhancedHistoryPanel,
  EnhancedToolsPanel,
  CanvasContainer,
  type CanvasContainerHandle,
  type CanvasHandle,
  LayersManager,
} from "@/components/smart";
import { useGetLayersQuery, useGetProjectByIdQuery } from "@/core/store/api.ts";

interface EditorProps {
  projectId: string;
}

export const Editor = ({ projectId }: EditorProps) => {
  const { data: layersData, isLoading: layersLoading } =
    useGetLayersQuery(projectId);
  const { data: projectData, isLoading: projectLoading } =
    useGetProjectByIdQuery(projectId);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);

  const canvasContainerRef = useRef<CanvasContainerHandle>(null);

  const handleLayerChange = useCallback((layerId: string) => {
    setActiveLayerId(layerId);
  }, []);

  // Получаем ref на canvas для экспорта
  const getCanvasStageRef = (): React.RefObject<CanvasHandle> | null => {
    return canvasContainerRef.current?.getCanvasRef() || null;
  };

  if (layersLoading || projectLoading) {
    return (
      <Pane
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        Loading...
      </Pane>
    );
  }

  const projectName = projectData?.name || "drawing";

  return (
    <Pane display="flex" flexDirection="column" height="100vh">
      {/* ОБНОВЛЕНО: Передаем stageRef и projectName в TopMenu */}
      <TopMenu
        stageRef={getCanvasStageRef()}
        projectName={projectName}
        projectId={projectId}
      />

      <DndProvider backend={HTML5Backend}>
        <EnhancedToolsPanel />
        <Pane display="flex" flex={1}>
          <CanvasContainer
            ref={canvasContainerRef}
            projectId={projectId}
            activeLayerId={activeLayerId}
            layersData={layersData}
          />
          <Pane width={300}>
            <LayersManager
              projectId={projectId}
              activeLayerId={activeLayerId}
              onLayerChange={handleLayerChange}
            />
            <EnhancedHistoryPanel projectId={projectId} />
          </Pane>
        </Pane>
      </DndProvider>
    </Pane>
  );
};
