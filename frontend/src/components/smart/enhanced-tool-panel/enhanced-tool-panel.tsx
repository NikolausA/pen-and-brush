import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/core/store";
import {
  setActiveTool,
  setStrokeColor,
} from "@/core/store/slices/tool-slice.ts";
import type { ToolType } from "@/core/types/interfaces/entities";
import { ToolsPanel } from "@/components/smart";

export const EnhancedToolsPanel = () => {
  const dispatch = useDispatch();
  const activeTool = useSelector((state: RootState) => state.tool.activeTool);
  const activeColor = useSelector((state: RootState) => state.tool.strokeColor);

  console.log(activeTool);

  const handleToolSelect = useCallback(
    (tool: string) => {
      dispatch(setActiveTool(tool as ToolType));
    },
    [dispatch]
  );

  const handleColorSelect = useCallback(
    (color: string) => {
      dispatch(setStrokeColor(color));
    },
    [dispatch]
  );

  return (
    <ToolsPanel
      onToolSelect={handleToolSelect}
      onColorSelect={handleColorSelect}
      activeTool={activeTool}
      activeShape={
        activeTool === "rectangle" || activeTool === "circle"
          ? activeTool
          : undefined
      }
      activeColor={activeColor}
    />
  );
};
