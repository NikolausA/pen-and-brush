import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/core/store";
import { Canvas } from "@/components/smart";
import type {
  GraphicObject,
  GraphicObjectType,
} from "@/core/types/interfaces/igraphic-objects.ts";
import { addObject } from "@/core/store/slices/graphicObjectSlice.ts";
import { useUpdateLayerMutation } from "@/core/store/api";
import { useHistoryManager, useGraphicsData } from "@/core/hooks";
import type { Layer } from "@/core/types/interfaces/entities";

interface CanvasContainerProps {
  projectId: string;
  activeLayerId: string | null;
  layersData: Layer[];
}

export const CanvasContainer = ({
  projectId,
  activeLayerId,
  layersData,
}: CanvasContainerProps) => {
  const dispatch = useDispatch();
  const activeTool = useSelector((state: RootState) => state.tool.activeTool);
  const activeColor = useSelector((state: RootState) => state.tool.strokeColor);

  const [draft, setDraft] = useState<GraphicObject | null>(null);
  const isDrawingRef = useRef(false);
  const nextId = useRef(0);

  // Находим активный слой по ID
  const activeLayer =
    layersData?.find((layer) => layer.id === activeLayerId) || null;

  const { visibleElements } = useGraphicsData({
    layersData,
    draft,
    activeLayer, // Теперь передаем найденный объект слоя
  });

  const { addToHistory } = useHistoryManager(projectId);
  const [updateLayer] = useUpdateLayerMutation();

  // Функция маппинга инструментов в типы графических объектов
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

  const handleMouseDown = useCallback(
    (pos: { x: number; y: number }) => {
      if (!layersData || !activeLayerId || !activeLayer) return;

      // Исправляем вызов addToHistory согласно новой типизации
      addToHistory(`Добавлен элемент: ${activeTool}`, {
        layers: layersData ?? [],
      });

      isDrawingRef.current = true;
      const id = `element-${nextId.current++}`;
      const graphicType = mapToolToGraphicType(activeTool);

      // Способ 1: Создаем объект явно для каждого типа
      let newDraft: GraphicObject;

      switch (graphicType) {
        case "freePath":
          newDraft = {
            id,
            layerId: activeLayerId,
            type: "freePath",
            strokeColor: activeTool === "eraser" ? "#ffffff" : activeColor,
            strokeWidth: 5,
            points: [pos.x, pos.y],
          };
          break;

        case "line":
          newDraft = {
            id,
            layerId: activeLayerId,
            type: "line",
            strokeColor: activeTool === "eraser" ? "#ffffff" : activeColor,
            strokeWidth: 1,
            points: [pos.x, pos.y, pos.x, pos.y],
          };
          break;

        case "rect":
          newDraft = {
            id,
            layerId: activeLayerId,
            type: "rect",
            strokeColor: activeTool === "eraser" ? "#ffffff" : activeColor,
            strokeWidth: 1,
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            fillColor: activeColor,
          };
          break;

        case "circle":
          newDraft = {
            id,
            layerId: activeLayerId,
            type: "circle",
            strokeColor: activeTool === "eraser" ? "#ffffff" : activeColor,
            strokeWidth: 1,
            x: pos.x,
            y: pos.y,
            radius: 0,
            fillColor: activeColor,
          };
          break;

        default:
          // Fallback для неизвестных типов
          newDraft = {
            id,
            layerId: activeLayerId,
            type: "freePath",
            strokeColor: activeTool === "eraser" ? "#ffffff" : activeColor,
            strokeWidth: 5,
            points: [pos.x, pos.y],
          };
          break;
      }

      setDraft(newDraft);
    },
    [
      activeTool,
      activeColor,
      layersData,
      activeLayerId,
      activeLayer,
      addToHistory,
      mapToolToGraphicType,
    ]
  );
  const handleMouseMove = useCallback(
    (pos: { x: number; y: number }) => {
      if (!isDrawingRef.current || !draft) return;

      setDraft((prev) => {
        if (!prev) return null;
        if (prev.type === "freePath") {
          return {
            ...prev,
            points: [...(prev.points || []), pos.x, pos.y],
          };
        } else if (prev.type === "line") {
          return {
            ...prev,
            points: [prev.points[0], prev.points[1], pos.x, pos.y],
          };
        } else if (prev.type === "rect") {
          return {
            ...prev,
            width: pos.x - (prev.x || 0),
            height: pos.y - (prev.y || 0),
          };
        } else if (prev.type === "circle") {
          const dx = pos.x - (prev.x || 0);
          const dy = pos.y - (prev.y || 0);
          return {
            ...prev,
            radius: Math.sqrt(dx * dx + dy * dy),
          };
        }
        return prev;
      });
    },
    [draft]
  );

  const handleMouseUp = useCallback(() => {
    isDrawingRef.current = false;
    if (draft && activeLayer) {
      dispatch(addObject(draft));

      // Безопасное преобразование типа
      const currentLayerData = activeLayer.data as unknown as GraphicObject[];
      const updatedData = [
        ...(Array.isArray(currentLayerData) ? currentLayerData : []),
        draft,
      ];

      updateLayer({ id: activeLayer.id, data: { data: updatedData } });
    }
    setDraft(null);
  }, [draft, activeLayer, dispatch, updateLayer]);

  return (
    <Canvas
      width={window.innerWidth - 300}
      height={window.innerHeight}
      elements={visibleElements}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      activeTool={activeTool}
    />
  );
};
