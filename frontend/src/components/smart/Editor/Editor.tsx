import { Pane } from "evergreen-ui";
import { TopMenu } from "@/components/ui/top-menu/top-menu.tsx";
import { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  EnhancedHistoryPanel,
  EnhancedToolsPanel,
  CanvasContainer,
  LayersManager,
} from "@/components/smart";
import { useGetLayersQuery } from "@/core/store/api.ts";

interface EditorProps {
  projectId: string;
}

export const Editor = ({ projectId }: EditorProps) => {
  const { data: layersData, isLoading } = useGetLayersQuery(projectId);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);

  // Только координация между компонентами
  const handleLayerChange = useCallback((layerId: string) => {
    setActiveLayerId(layerId);
  }, []);

  if (isLoading) return <Pane>Loading...</Pane>;

  return (
    <Pane display="flex" flexDirection="column" height="100vh">
      <TopMenu />
      <DndProvider backend={HTML5Backend}>
        <EnhancedToolsPanel projectId={projectId} />
        <Pane display="flex" flex={1} >
          <CanvasContainer
            projectId={projectId}
            activeLayerId={activeLayerId}
            layersData={layersData}
          />
          <Pane width={300} /* правая панель */>
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
