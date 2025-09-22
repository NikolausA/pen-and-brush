import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/core/store";
import {
  setActiveTool,
  setStrokeColor,
} from "@/core/store/slices/tool-slice.ts";
import type { GraphicObjectType } from "@/core/types/interfaces/igraphic-objects";
import type { ToolType } from "@/core/types/interfaces/entities";
import { ToolsPanel } from "@/components/smart";

interface ToolPanelProps {
  projectId: string;
}

export const EnhancedToolsPanel = ({ projectId }: ToolPanelProps) => {
  const dispatch = useDispatch();
  const activeTool = useSelector((state: RootState) => state.tool.activeTool);
  const activeColor = useSelector((state: RootState) => state.tool.strokeColor);

  const mapToolToGraphicType = useCallback(
    (tool: string): GraphicObjectType => {
      switch (tool) {
        case "brush":
        case "eraser":
          return "freePath";
        case "line":
          return "line";
        case "rectangle":
          return "rect";
        case "circle":
          return "circle";
        default:
          return "freePath";
      }
    },
    []
  );

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
