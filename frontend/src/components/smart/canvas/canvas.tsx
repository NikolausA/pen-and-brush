// @ts-nocheck
import { useRef, useEffect } from "react";
import { Pane } from "evergreen-ui";
import { Stage, Layer, Line, Rect, Circle } from "react-konva";
import type { GraphicObject } from "@/core/types/interfaces/igraphic-objects";

import styles from "./canvas.module.scss";

interface CanvasProps {
  width: number;
  height: number;
  elements: GraphicObject[];
  onMouseDown: (pos: { x: number; y: number }) => void;
  onMouseMove: (pos: { x: number; y: number }) => void;
  onMouseUp: () => void;
  activeTool: string;
  layersData?: Array<{
    id: string;
    opacity: number;
    isVisible: boolean;
    order: number;
  }>;
}

export const Canvas = ({
  width,
  height,
  elements,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  activeTool,
  layersData = [],
}: CanvasProps) => {
  const stageRef = useRef<any>(null);

  useEffect(() => {
    if (stageRef.current) {
      const container = stageRef.current.container();
      let cursor = "default";

      switch (activeTool) {
        case "brush":
          cursor = "crosshair";
          break;
        case "eraser":
          cursor = "grab";
          break;
        case "line":
        case "rectangle":
        case "circle":
          cursor = "crosshair";
          break;
        default:
          cursor = "default";
      }

      container.style.cursor = cursor;
    }
  }, [activeTool]);

  const handleMouseEvent = (
    e: any,
    handler: (pos: { x: number; y: number }) => void
  ) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    if (pointerPos) {
      handler(pointerPos);
    }
  };

  // Получить данные слоя по ID
  const getLayerData = (layerId: string) => {
    return layersData.find((l) => l.id === layerId);
  };

  // Группировка и сортировка элементов по слоям
  const getSortedElements = () => {
    console.log("🔍 Canvas received elements:", elements.length);
    console.log("🔍 Canvas received layersData:", layersData);

    // Группируем элементы по layerId
    const elementsByLayer = new Map<string, GraphicObject[]>();

    elements.forEach((element) => {
      const layerId = element.layerId || "default";
      if (!elementsByLayer.has(layerId)) {
        elementsByLayer.set(layerId, []);
      }
      elementsByLayer.get(layerId)!.push(element);
    });

    console.log(
      "🔍 Elements grouped by layer:",
      Array.from(elementsByLayer.entries()).map(([id, els]) => ({
        layerId: id,
        count: els.length,
        elements: els.map((e) => ({ type: e.type, id: e.id })),
      }))
    );

    // Создаем массив [layerId, elements[]] и сортируем по order
    const sortedLayers = Array.from(elementsByLayer.entries())
      .map(([layerId, layerElements]) => {
        const layer = getLayerData(layerId);
        return {
          layerId,
          elements: layerElements,
          order: layer?.order ?? 0,
          opacity: layer?.opacity ?? 100,
          isVisible: layer?.isVisible ?? true,
        };
      })
      // КРИТИЧНО: Сортируем по возрастанию order (меньше = ниже, больше = выше)
      .sort((a, b) => a.order - b.order);

    console.log(
      "✅ Sorted layers for rendering:",
      sortedLayers.map((l) => ({
        layerId: l.layerId.substring(0, 8),
        order: l.order,
        opacity: l.opacity,
        isVisible: l.isVisible,
        count: l.elements.length,
      }))
    );

    return sortedLayers;
  };

  const renderElement = (element: GraphicObject, layerOpacity: number) => {
    const key = element.id;

    // Вычисляем итоговую прозрачность
    const elementOpacity = element.opacity ?? 100;
    const finalOpacity = (layerOpacity / 100) * (elementOpacity / 100);

    console.log(`📍 Rendering ${element.type} ${element.id}:`, {
      layerOpacity,
      elementOpacity,
      finalOpacity,
    });

    const commonProps = {
      opacity: finalOpacity,
      listening: false,
      perfectDrawEnabled: false,
    };

    switch (element.type) {
      case "freePath":
        if (!element.points || element.points.length < 2) return null;
        return (
          <Line
            key={key}
            points={element.points}
            stroke={element.strokeColor || "#000000"}
            strokeWidth={element.strokeWidth || 5}
            lineCap="round"
            lineJoin="round"
            tension={0.5}
            globalCompositeOperation={
              element.strokeColor === "#ffffff"
                ? "destination-out"
                : "source-over"
            }
            {...commonProps}
          />
        );

      case "line":
        if (!element.points || element.points.length < 4) return null;
        return (
          <Line
            key={key}
            points={element.points}
            stroke={element.strokeColor || "#000000"}
            strokeWidth={element.strokeWidth || 2}
            lineCap="round"
            {...commonProps}
          />
        );

      case "rect":
        return (
          <Rect
            key={key}
            x={element.x || 0}
            y={element.y || 0}
            width={Math.abs(element.width || 0)}
            height={Math.abs(element.height || 0)}
            fill={element.fillColor || "transparent"}
            stroke={element.strokeColor || "#000000"}
            strokeWidth={element.strokeWidth || 2}
            {...commonProps}
          />
        );

      case "circle":
        return (
          <Circle
            key={key}
            x={element.x || 0}
            y={element.y || 0}
            radius={Math.abs(element.radius || 0)}
            fill={element.fillColor || "transparent"}
            stroke={element.strokeColor || "#000000"}
            strokeWidth={element.strokeWidth || 2}
            {...commonProps}
          />
        );

      default:
        console.warn("Unknown element type:", element.type);
        return null;
    }
  };

  return (
    <Pane className={styles.container}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={(e) => {
          handleMouseEvent(e, onMouseDown);
        }}
        onMouseMove={(e) => {
          handleMouseEvent(e, onMouseMove);
        }}
        onMouseUp={(e) => {
          onMouseUp();
        }}
        className={styles.stage}
      >
        <Layer>
          {/* Рендерим элементы послойно, от нижнего к верхнему */}
          {getSortedElements().map((layerGroup) => {
            // Пропускаем невидимые слои
            if (!layerGroup.isVisible) {
              console.log(`⚠️ Skipping invisible layer: ${layerGroup.layerId}`);
              return null;
            }

            console.log(
              `🎨 Rendering layer ${layerGroup.layerId} (order: ${layerGroup.order}, opacity: ${layerGroup.opacity})`
            );

            // Рендерим элементы слоя
            return layerGroup.elements.map((element) =>
              renderElement(element, layerGroup.opacity)
            );
          })}
        </Layer>
      </Stage>
    </Pane>
  );
};
