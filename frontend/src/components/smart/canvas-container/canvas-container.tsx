import { useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/core/store";
import { Canvas } from "@/components/smart";
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

export const CanvasContainer = ({
  projectId,
  activeLayerId,
}: CanvasContainerProps) => {
  const activeTool = useSelector((state: RootState) => state.tool.activeTool);
  const activeColor = useSelector((state: RootState) => state.tool.strokeColor);
  const { data: layersData = [], refetch: refetchLayers } =
    useGetLayersQuery(projectId);

  const activeLayer =
    layersData.find((layer) => layer.id === activeLayerId) || null;

  const [draft, setDraft] = useState<GraphicObject | null>(null);
  const isDrawingRef = useRef(false);
  const nextId = useRef(0);

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
      console.log(
        "Mouse down at:",
        pos,
        "Active layer:",
        activeLayerId,
        "Tool:",
        activeTool
      );

      if (!layersData || !activeLayerId || !activeLayer) {
        console.warn("Missing required data:", {
          layersData: !!layersData,
          activeLayerId,
          activeLayer: !!activeLayer,
        });
        return;
      }

      isDrawingRef.current = true;
      const id = `element-${Date.now()}-${nextId.current++}`;
      const graphicType = mapToolToGraphicType(activeTool);

      // Получаем прозрачность активного слоя для нового объекта
      const layerOpacity = activeLayer.opacity || 100;

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
            opacity: 100, // Объект по умолчанию непрозрачный
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

      console.log("Created draft:", newDraft, "Layer opacity:", layerOpacity);
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

  const handleMouseMove = useCallback(
    (pos: { x: number; y: number }) => {
      if (!isDrawingRef.current || !draft) return;

      setDraft((prev) => {
        if (!prev) return null;

        let updatedDraft: GraphicObject;

        switch (prev.type) {
          case "freePath":
            updatedDraft = {
              ...prev,
              points: [...(prev.points || []), pos.x, pos.y],
            };
            break;

          case "line":
            updatedDraft = {
              ...prev,
              points: [prev.points[0], prev.points[1], pos.x, pos.y],
            };
            break;

          case "rect":
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

          case "circle":
            const dx = pos.x - (prev.x || 0);
            const dy = pos.y - (prev.y || 0);
            updatedDraft = {
              ...prev,
              radius: Math.sqrt(dx * dx + dy * dy),
            };
            break;

          default:
            updatedDraft = prev;
            break;
        }

        return updatedDraft;
      });
    },
    [draft]
  );

  const handleMouseUp = useCallback(async () => {
    console.log("Mouse up, isDrawing:", isDrawingRef.current, "draft:", draft);

    if (!isDrawingRef.current || !draft || !activeLayer) {
      isDrawingRef.current = false;
      setDraft(null);
      return;
    }

    isDrawingRef.current = false;

    // Валидация
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
      console.warn("Invalid draft, skipping save:", draft);
      setDraft(null);
      return;
    }

    console.log("Finalizing draft:", draft);

    try {
      const currentLayerData = Array.isArray(activeLayer.data)
        ? (activeLayer.data as GraphicObject[])
        : [];

      const updatedData = [...currentLayerData, draft];

      console.log("Updating layer with data:", updatedData);

      // Обновляем слой
      await updateLayer({
        layerId: activeLayer.id,
        projectId: projectId,
        data: { data: updatedData },
      }).unwrap();

      // Рефетчим для гарантии актуальности
      await refetchLayers();

      const freshLayers = await refetchLayers().unwrap();

      console.log(
        "🔍 [MOUSEUP] Layer updated, object IDs:",
        freshLayers[0]?.data?.map((o: any) => o.id) || "No data"
      );

      console.log("💾 [HISTORY] Saving snapshot AFTER object creation");
      addToHistory(`Добавлен элемент: ${draft.type}`, {
        layers: freshLayers,
      });

      console.log("Layer updated and history saved successfully");
    } catch (error) {
      console.error("Error updating layer:", error);
    }

    setDraft(null);
  }, [draft, activeLayer, projectId, updateLayer, refetchLayers, addToHistory]);

  console.log("Visible elements:", visibleElements);
  console.log("Layers data with opacity:", layersData);

  // Подготавливаем данные слоев для Canvas
  const layersForCanvas = layersData.map((layer) => ({
    id: layer.id,
    opacity: layer.opacity || 100,
    isVisible: layer.isVisible !== false,
    order: layer.order || 0,
  }));

  return (
    <Canvas
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
};
