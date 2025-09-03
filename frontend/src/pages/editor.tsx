// frontend/src/pages/editor.tsx
import { Pane } from "evergreen-ui";
import { TopMenu } from "@/components/ui/top-menu/top-menu";
import { Canvas } from "@/components/smart";
import { ToolsPanel } from "@/components/smart";
import { useState, useCallback, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  LayerCreator,
  LayersList,
  OpacityControl,
  HistoryList,
} from "@/components/smart";
import type { DrawingElement } from "@/core/types/interfaces/ipages/ieditor";
import type {
  GraphicObject,
  GraphicObjectType,
} from "@/core/types/interfaces/igraphic-objects";
import type { Layer as BackendLayer } from "@/core/types/interfaces/entities";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/core/store";
import { setActiveTool, setStrokeColor } from "@/core/store/slices/tool-slice";
import {
  addObject,
  clearLayerObjects,
} from "@/core/store/slices/graphicObjectSlice";
import {
  useGetLayersQuery,
  useCreateLayerMutation,
  useUpdateLayerMutation,
  useDeleteLayerMutation,
  useGetHistoryQuery,
  useAddHistoryMutation,
} from "@/core/store/api";

export const Editor = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const activeTool = useSelector((state: RootState) => state.tool.activeTool);
  const activeColor = useSelector((state: RootState) => state.tool.strokeColor);
  const { data: layersData, isLoading: layersLoading } = useGetLayersQuery(
    projectId!,
    { skip: !projectId }
  );
  const { data: historyData } = useGetHistoryQuery(projectId!, {
    skip: !projectId,
  });
  const [createLayer] = useCreateLayerMutation();
  const [updateLayer] = useUpdateLayerMutation();
  const [deleteLayer] = useDeleteLayerMutation();
  const [addHistory] = useAddHistoryMutation();

  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<
    number | null
  >(null);
  const [draft, setDraft] = useState<GraphicObject | null>(null);
  const isDrawingRef = useRef(false);
  const nextId = useRef(0);

  const activeLayer =
    layersData?.find((layer) => layer.id === activeLayerId) || layersData?.[0];

  // Set initial active layer
  useEffect(() => {
    if (layersData && layersData.length > 0 && activeLayerId === null) {
      setActiveLayerId(layersData[0].id);
    }
  }, [layersData, activeLayerId]);

  // Update active layer if the current one is deleted
  useEffect(() => {
    if (
      layersData &&
      activeLayerId &&
      !layersData.some((layer) => layer.id === activeLayerId)
    ) {
      setActiveLayerId(layersData[0]?.id || null);
    }
  }, [layersData, activeLayerId]);

  const mapToolToGraphicType = (tool: string): GraphicObjectType => {
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
  };

  const handleToolSelect = useCallback(
    (tool: string) => {
      dispatch(
        setActiveTool(
          tool as "brush" | "eraser" | "line" | "rectangle" | "circle"
        )
      );
    },
    [dispatch]
  );

  const handleColorSelect = useCallback(
    (color: string) => {
      dispatch(setStrokeColor(color));
    },
    [dispatch]
  );

  const handleMouseDown = useCallback(
    (pos: { x: number; y: number }) => {
      if (!layersData || !activeLayerId) return;

      addHistory({
        projectId: projectId!,
        data: {
          action: `Добавлен элемент: ${activeTool}`,
          data: { layers: layersData },
        },
      });

      isDrawingRef.current = true;
      const id = `element-${nextId.current++}`;
      const graphicType = mapToolToGraphicType(activeTool); // Use the function here

      const newDraft: GraphicObject = {
        id,
        layerId: activeLayerId,
        type: graphicType,
        strokeColor: activeTool === "eraser" ? "#ffffff" : activeColor,
        strokeWidth: graphicType === "freePath" ? 5 : 1,
        ...(graphicType === "freePath" || graphicType === "line"
          ? {
              points:
                graphicType === "line"
                  ? [pos.x, pos.y, pos.x, pos.y]
                  : [pos.x, pos.y],
            }
          : graphicType === "rect"
          ? { x: pos.x, y: pos.y, width: 0, height: 0, fillColor: activeColor }
          : { x: pos.x, y: pos.y, radius: 0, fillColor: activeColor }),
      };

      setDraft(newDraft);
    },
    [activeTool, activeColor, layersData, activeLayerId, addHistory, projectId]
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
      const updatedData = [
        ...((activeLayer.data as GraphicObject[]) || []),
        draft,
      ];
      updateLayer({ id: activeLayer.id, data: { data: updatedData } });
    }
    setDraft(null);
  }, [draft, activeLayer, dispatch, updateLayer]);

  const handleCreateLayer = useCallback(() => {
    if (!layersData || !projectId) return;
    const name = `Слой ${layersData.length + 1}`;
    addHistory({
      projectId: projectId,
      data: {
        action: `Создан слой ${name}`,
        data: { layers: layersData },
      },
    });
    createLayer({
      projectId: projectId,
      data: { name, isVisible: true, opacity: 100, data: [] },
    })
      .unwrap()
      .then((newLayer) => setActiveLayerId(newLayer.id));
  }, [layersData, projectId, addHistory, createLayer]);

  const handleLayerSelect = useCallback((layerId: string) => {
    setActiveLayerId(layerId);
  }, []);

  const handleToggleLayerVisibility = useCallback(
    (layerId: string) => {
      if (!layersData) return;
      addHistory({
        projectId: projectId!,
        data: {
          action: `Изменена видимость слоя`,
          data: { layers: layersData },
        },
      });
      const layer = layersData.find((l) => l.id === layerId);
      if (layer) {
        updateLayer({ id: layerId, data: { isVisible: !layer.isVisible } });
      }
    },
    [layersData, projectId, addHistory, updateLayer]
  );

  const handleDeleteLayer = useCallback(
    (layerId: string) => {
      if (!layersData || layersData.length <= 1) return;
      addHistory({
        projectId: projectId!,
        data: {
          action: `Удален слой`,
          data: { layers: layersData },
        },
      });
      dispatch(clearLayerObjects(layerId));
      deleteLayer(layerId);
    },
    [layersData, projectId, addHistory, dispatch, deleteLayer]
  );

  const handleOpacityChange = useCallback(
    (value: number) => {
      if (activeLayerId) {
        updateLayer({ id: activeLayerId, data: { opacity: value } });
      }
    },
    [activeLayerId, updateLayer]
  );

  const handleRenameLayer = useCallback(
    (layerId: string, newName: string) => {
      if (!layersData || !projectId) return;
      addHistory({
        projectId: projectId,
        data: {
          action: `Переименован слой`,
          data: { layers: layersData },
        },
      });
      updateLayer({ id: layerId, data: { name: newName } });
    },
    [layersData, projectId, addHistory, updateLayer]
  );

  const handleHistoryItemClick = useCallback(
    (index: number) => {
      const selectedHistory = historyData?.[index];
      if (selectedHistory && selectedHistory.data.layers) {
        const selectedState = selectedHistory.data.layers as BackendLayer[];
        Promise.all(
          selectedState.map((layer: BackendLayer) =>
            updateLayer({ id: layer.id, data: layer }).unwrap()
          )
        );
        setSelectedHistoryIndex(index);
      }
    },
    [historyData, updateLayer]
  );

  const mapGraphicObjectToDrawingElement = (
    obj: GraphicObject
  ): DrawingElement => {
    switch (obj.type) {
      case "freePath":
        return {
          id: obj.id,
          type: obj.strokeColor === "#ffffff" ? "eraser" : "brush",
          points: obj.points,
          color: obj.strokeColor,
        };
      case "line":
        return {
          id: obj.id,
          type: "brush", // Rendered as a brush stroke for simplicity
          points: obj.points,
          color: obj.strokeColor,
        };
      case "rect":
        return {
          id: obj.id,
          type: "rectangle",
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          color: obj.fillColor || obj.strokeColor,
        };
      case "circle":
        return {
          id: obj.id,
          type: "circle",
          x: obj.x - (obj.radius || 0),
          y: obj.y - (obj.radius || 0),
          width: (obj.radius || 0) * 2,
          height: (obj.radius || 0) * 2,
          color: obj.fillColor || obj.strokeColor,
        };
      default:
        return {
          id: obj.id,
          type: "brush",
          points: [],
          color: obj.strokeColor,
        };
    }
  };

  const getAllVisibleElements = useCallback((): DrawingElement[] => {
    const visibleElements: DrawingElement[] = (layersData || []).flatMap(
      (layer) =>
        layer.isVisible
          ? ((layer.data as GraphicObject[]) || []).map((obj) => ({
              ...mapGraphicObjectToDrawingElement(obj),
              opacity: layer.opacity / 100,
            }))
          : []
    );
    if (draft && activeLayer?.isVisible) {
      visibleElements.push({
        ...mapGraphicObjectToDrawingElement(draft),
        opacity: activeLayer.opacity / 100,
      });
    }
    return visibleElements;
  }, [layersData, draft, activeLayer]);

  if (layersLoading || !projectId) {
    return <Pane>Loading...</Pane>;
  }

  return (
    <Pane
      display="flex"
      flexDirection="column"
      height="100vh"
      position="relative"
    >
      <TopMenu />
      <DndProvider backend={HTML5Backend}>
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
        <Pane display="flex" flex={1}>
          <Canvas
            width={window.innerWidth - 300}
            height={window.innerHeight}
            elements={getAllVisibleElements()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            activeTool={activeTool}
          />
          <Pane
            width={300}
            height="100%"
            background="white"
            borderLeft="1px solid #E4E7EB"
            display="flex"
            flexDirection="column"
          >
            <LayerCreator onCreateLayer={handleCreateLayer} />
            <LayersList
              layers={layersData || []}
              activeLayerId={activeLayerId}
              onLayerSelect={handleLayerSelect}
              onToggleVisibility={handleToggleLayerVisibility}
              onDeleteLayer={handleDeleteLayer}
              onRenameLayer={handleRenameLayer}
            />
            <OpacityControl
              opacity={activeLayer?.opacity ?? 100}
              onOpacityChange={handleOpacityChange}
            />
            <HistoryList
              history={historyData || []}
              selectedIndex={selectedHistoryIndex}
              onHistoryClick={handleHistoryItemClick}
            />
          </Pane>
        </Pane>
      </DndProvider>
    </Pane>
  );
};
