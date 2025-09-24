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
  const activeLayer = layersData?.find((layer) => layer.id === activeLayerId) || null;

  const { visibleElements } = useGraphicsData({
    layersData,
    draft,
    activeLayer,
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
      console.log('Mouse down at:', pos, 'Active layer:', activeLayerId, 'Tool:', activeTool);
      
      if (!layersData || !activeLayerId || !activeLayer) {
        console.warn('Missing required data:', { layersData: !!layersData, activeLayerId, activeLayer: !!activeLayer });
        return;
      }

      // Добавляем в историю
      addToHistory(`Добавлен элемент: ${activeTool}`, {
        layers: layersData ?? [],
      });

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
          };
          break;
      }

      console.log('Created draft:', newDraft);
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
          const startX = prev.x || 0;
          const startY = prev.y || 0;
          return {
            ...prev,
            x: Math.min(startX, pos.x),
            y: Math.min(startY, pos.y),
            width: Math.abs(pos.x - startX),
            height: Math.abs(pos.y - startY),
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

  const handleMouseUp = useCallback(async () => {
    console.log('Mouse up, isDrawing:', isDrawingRef.current, 'draft:', draft);
    
    isDrawingRef.current = false;
    if (draft && activeLayer) {
      console.log('Finalizing draft:', draft);
      
      // Добавляем объект в Redux store
      dispatch(addObject(draft));

      try {
        // Получаем текущие данные слоя
        const currentLayerData = Array.isArray(activeLayer.data) 
          ? activeLayer.data as GraphicObject[]
          : [];
        
        // Добавляем новый объект
        const updatedData = [...currentLayerData, draft];
        
        console.log('Updating layer with data:', updatedData);
        
        // Обновляем слой с правильной структурой для нового API
        await updateLayer({ 
          layerId: activeLayer.id, 
          projectId: projectId,
          data: { data: updatedData } 
        }).unwrap();
        
        console.log('Layer updated successfully');
      } catch (error) {
        console.error('Error updating layer:', error);
      }
    }
    setDraft(null);
  }, [draft, activeLayer, projectId, dispatch, updateLayer]);

  return (
    <Canvas
      width={window.innerWidth - 300}
      height={window.innerHeight - 60} // Учитываем высоту топ-меню
      elements={visibleElements}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      activeTool={activeTool}
    />
  );
};