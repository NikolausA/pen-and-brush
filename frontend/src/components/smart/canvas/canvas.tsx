import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Konva from "konva";
import { Pane } from "evergreen-ui";
import { Stage, Layer, Line, Rect, Circle } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
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

// Экспортируем методы для доступа к Stage
export interface CanvasHandle {
  getStage: () => Konva.Stage | null;
}

// Экспортируем Canvas с forwardRef
const CanvasWithRef = forwardRef<CanvasHandle, CanvasProps>(
  (
    {
      width,
      height,
      elements,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      activeTool,
      layersData = [],
    },
    ref
  ) => {
    // ИСПРАВЛЕНО: Правильная типизация stageRef
    const stageRef = useRef<Konva.Stage | null>(null);

    // Предоставляем доступ к Stage через ref
    useImperativeHandle(ref, () => ({
      getStage: () => stageRef.current,
    }));

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

    // ИСПРАВЛЕНО: Правильная типизация event handler
    const handleMouseEvent = (
      e: KonvaEventObject<MouseEvent>,
      handler: (pos: { x: number; y: number }) => void
    ) => {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      const pointerPos = stage?.getPointerPosition();

      if (pointerPos) {
        handler(pointerPos);
      }
    };

    const getLayerData = (layerId: string) => {
      return layersData.find((l) => l.id === layerId);
    };

    // ИСПРАВЛЕНО: Явная типизация возвращаемого значения
    interface SortedLayer {
      layerId: string;
      elements: GraphicObject[];
      order: number;
      opacity: number;
      isVisible: boolean;
    }

    const getSortedElements = (): SortedLayer[] => {
      const elementsByLayer = new Map<string, GraphicObject[]>();

      elements.forEach((element) => {
        const layerId = element.layerId || "default";
        if (!elementsByLayer.has(layerId)) {
          elementsByLayer.set(layerId, []);
        }
        elementsByLayer.get(layerId)!.push(element);
      });

      const sortedLayers = Array.from(elementsByLayer.entries())
        .map(([layerId, layerElements]): SortedLayer => {
          const layer = getLayerData(layerId);
          return {
            layerId,
            elements: layerElements,
            order: layer?.order ?? 0,
            opacity: layer?.opacity ?? 100,
            isVisible: layer?.isVisible ?? true,
          };
        })
        .sort((a, b) => a.order - b.order);

      return sortedLayers;
    };

    const renderElement = (
      element: GraphicObject,
      layerOpacity: number
    ): JSX.Element | null => {
      const key = element.id;
      const elementOpacity = element.opacity ?? 100;
      const finalOpacity = (layerOpacity / 100) * (elementOpacity / 100);

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
          onMouseUp={() => {
            onMouseUp();
          }}
          className={styles.stage}
        >
          <Layer>
            {getSortedElements().map((layerGroup) => {
              if (!layerGroup.isVisible) {
                return null;
              }

              return layerGroup.elements.map((element) =>
                renderElement(element, layerGroup.opacity)
              );
            })}
          </Layer>
        </Stage>
      </Pane>
    );
  }
);

CanvasWithRef.displayName = "Canvas";

// Экспортируем компонент и типы
export { CanvasWithRef as Canvas };
