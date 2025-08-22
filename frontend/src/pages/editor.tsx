import { memo, useCallback } from "react";
import { Pane } from "evergreen-ui";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TopMenu } from "@/components/ui/top-menu/top-menu";
import { ToolsPanel } from "@/components/smart";
import { CanvasBlock } from "@/components/smart/canvas-block/canvas-block";
import { LayersPanel } from "@/components/smart/layers-panel/layers-panel";
import { HistoryPanel } from "@/components/smart/history-panel/history-panel";
import type { ToolType } from "@/core/types/interfaces/igraphic-object";

import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import {
  setActiveTool,
  setActiveColor,
} from "@/core/store/slices/canvas-slice";
import { selectActiveTool, selectActiveColor } from "@/core/store/selectors";

export const Editor = memo(function Editor() {
  const dispatch = useAppDispatch();

  // Состояние из Redux
  const activeTool = useAppSelector(selectActiveTool);
  const activeColor = useAppSelector(selectActiveColor);
  // const layers = useAppSelector(selectLayers);
  // const activeLayerId = useAppSelector(selectActiveLayerId);
  // const visibleElements = useAppSelector(selectVisibleObjects);

  const handleToolSelect = useCallback(
    (tool: ToolType) => dispatch(setActiveTool(tool)),
    [dispatch]
  );

  const handleColorSelect = useCallback(
    (color: string) => dispatch(setActiveColor(color)),
    [dispatch]
  );

  return (
    <Pane display="flex" flexDirection="column" height="100vh">
      <TopMenu />

      <DndProvider backend={HTML5Backend}>
        <ToolsPanel
          onToolSelect={handleToolSelect}
          onColorSelect={handleColorSelect}
          activeTool={activeTool}
          activeColor={activeColor}
        />

        <Pane display="flex" flex={1} minHeight={0}>
          <CanvasBlock
            width={window.innerWidth - 320}
            height={window.innerHeight - 120}
          />

          <Pane
            width={320}
            height="100%"
            background="white"
            borderLeft="muted"
            display="flex"
            flexDirection="column"
          >
            <LayersPanel />
            <HistoryPanel />
          </Pane>
        </Pane>
      </DndProvider>
    </Pane>
  );
});
