import {
  useState,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/core/store";
import { Canvas, type CanvasHandle } from "@/components/smart";
import type {
  GraphicObject,
  GraphicObjectType,
} from "@/core/types/interfaces/igraphic-objects.ts";
import { useGetLayersQuery, useUpdateLayerMutation } from "@/core/store/api";
import { useHistoryManager, useGraphicsData } from "@/core/hooks";
import type { Layer } from "@/core/types/interfaces/entities";

interface CanvasContainerProps {
  projectId: string;
  activeLayerId: string | null;
  layersData: Layer[] | undefined;
}

export interface CanvasContainerHandle {
  getCanvasRef: () => React.RefObject<CanvasHandle>;
}

const CanvasContainerWithRef = forwardRef<
  CanvasContainerHandle,
  CanvasContainerProps
>(({ projectId, activeLayerId }, ref) => {
  const activeTool = useSelector((state: RootState) => state.tool.activeTool);
  const activeColor = useSelector((state: RootState) => state.tool.strokeColor);
  const { data: layersData = [], refetch: refetchLayers } =
    useGetLayersQuery(projectId);

  const activeLayer =
    layersData.find((layer) => layer.id === activeLayerId) || null;

  const [draft, setDraft] = useState<GraphicObject | null>(null);
  const isDrawingRef = useRef(false);
  const nextId = useRef(0);
  const canvasRef = useRef<CanvasHandle>(null);

  // Предоставляем доступ к canvasRef родителю
  useImperativeHandle(ref, () => ({
    getCanvasRef: () => canvasRef,
  }));

  const { visibleElements } = useGraphicsData({
    layersData: layersData || [],
    draft,
    activeLayer,
  });

  const { addToHistory } = useHistoryManager(projectId);
  const [updateLayer] = useUpdateLayerMutation();

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
      if (!layersData || !activeLayerId || !activeLayer) {
        return;
      }

      isDrawingRef.current = true;
      const id = `element-${Date.now()}-${nextId.current++}`;
      const graphicType = mapToolToGraphicType(activeTool);

      let newDraft: GraphicObject;

      switch (graphicType) {
        case "freePath":
          newDraft = {
            id,
            layerId: activeLayerId,
            type: "freePath",
            strokeColor: activeTool === "eraser" ? "#ffffff" : activeColor,
            strokeWidth: activeTool === "eraser" ? 20 : 5,
            points: [pos.x, pos.y],
            opacity: 100,
          };
          break;

        case "line":
          newDraft = {
            id,
            layerId: activeLayerId,
            type: "line",
            strokeColor: activeColor,
            strokeWidth: 2,
            points: [pos.x, pos.y, pos.x, pos.y],
            opacity: 100,
          };
          break;

        case "rect":
          newDraft = {
            id,
            layerId: activeLayerId,
            type: "rect",
            strokeColor: activeColor,
            strokeWidth: 2,
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            fillColor: activeColor,
            opacity: 100,
          };
          break;

        case "circle":
          newDraft = {
            id,
            layerId: activeLayerId,
            type: "circle",
            strokeColor: activeColor,
            strokeWidth: 2,
            x: pos.x,
            y: pos.y,
            radius: 0,
            fillColor: activeColor,
            opacity: 100,
          };
          break;

        default:
          newDraft = {
            id,
            layerId: activeLayerId,
            type: "freePath",
            strokeColor: activeColor,
            strokeWidth: 5,
            points: [pos.x, pos.y],
            opacity: 100,
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
      mapToolToGraphicType,
    ]
  );

  // ИСПРАВЛЕНО: Обернули const в блоки для case
  const handleMouseMove = useCallback(
    (pos: { x: number; y: number }) => {
      if (!isDrawingRef.current || !draft) return;

      setDraft((prev) => {
        if (!prev) return null;

        let updatedDraft: GraphicObject;

        switch (prev.type) {
          case "freePath": {
            updatedDraft = {
              ...prev,
              points: [...(prev.points || []), pos.x, pos.y],
            };
            break;
          }

          case "line": {
            updatedDraft = {
              ...prev,
              points: [prev.points[0], prev.points[1], pos.x, pos.y],
            };
            break;
          }

          case "rect": {
            const startX = prev.x || 0;
            const startY = prev.y || 0;
            updatedDraft = {
              ...prev,
              x: Math.min(startX, pos.x),
              y: Math.min(startY, pos.y),
              width: Math.abs(pos.x - startX),
              height: Math.abs(pos.y - startY),
            };
            break;
          }

          case "circle": {
            const dx = pos.x - (prev.x || 0);
            const dy = pos.y - (prev.y || 0);
            updatedDraft = {
              ...prev,
              radius: Math.sqrt(dx * dx + dy * dy),
            };
            break;
          }

          default: {
            updatedDraft = prev;
            break;
          }
        }

        return updatedDraft;
      });
    },
    [draft]
  );

  const handleMouseUp = useCallback(async () => {
    if (!isDrawingRef.current || !draft || !activeLayer) {
      isDrawingRef.current = false;
      setDraft(null);
      return;
    }

    isDrawingRef.current = false;

    let isValid = true;
    if (
      draft.type === "freePath" &&
      (!draft.points || draft.points.length < 2)
    ) {
      isValid = false;
    } else if (
      draft.type === "line" &&
      (!draft.points || draft.points.length < 4)
    ) {
      isValid = false;
    } else if (
      draft.type === "rect" &&
      (draft.width === 0 || draft.height === 0)
    ) {
      isValid = false;
    } else if (draft.type === "circle" && draft.radius === 0) {
      isValid = false;
    }

    if (!isValid) {
      setDraft(null);
      return;
    }

    try {
      const currentLayerData = Array.isArray(activeLayer.data)
        ? (activeLayer.data as GraphicObject[])
        : [];

      const updatedData = [...currentLayerData, draft];

      await updateLayer({
        layerId: activeLayer.id,
        projectId: projectId,
        data: { data: updatedData },
      }).unwrap();

      await refetchLayers();
      const freshLayers = await refetchLayers().unwrap();

      addToHistory(`Добавлен элемент: ${draft.type}`, {
        layers: freshLayers,
      });
    } catch (error) {
      console.error("Error updating layer:", error);
    }

    setDraft(null);
  }, [draft, activeLayer, projectId, updateLayer, refetchLayers, addToHistory]);

  const layersForCanvas = layersData.map((layer) => ({
    id: layer.id,
    opacity: layer.opacity || 100,
    isVisible: layer.isVisible !== false,
    order: layer.order || 0,
  }));

  return (
    <Canvas
      ref={canvasRef}
      width={window.innerWidth - 300}
      height={window.innerHeight - 60}
      elements={visibleElements}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      activeTool={activeTool}
      layersData={layersForCanvas}
    />
  );
});

CanvasContainerWithRef.displayName = "CanvasContainer";

// Экспортируем компонент и типы
export { CanvasContainerWithRef as CanvasContainer };
