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
}

export const Canvas = ({
  width,
  height,
  elements,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  activeTool,
}: CanvasProps) => {
  const stageRef = useRef<any>(null);

  // Устанавливаем курсор в зависимости от активного инструмента
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
      // console.log('Canvas event:', pointerPos);
      handler(pointerPos);
    }
  };

  const renderElement = (element: GraphicObject, index: number) => {
    const key = `${element.id}-${index}`;

    // console.log('Rendering element:', element);

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
            perfectDrawEnabled={false}
            listening={false}
            globalCompositeOperation={
              element.strokeColor === "#ffffff"
                ? "destination-out"
                : "source-over"
            }
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
            perfectDrawEnabled={false}
            listening={false}
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
            listening={false}
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
            listening={false}
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
          // console.log('Stage mouse down');
          handleMouseEvent(e, onMouseDown);
        }}
        onMouseMove={(e) => {
          handleMouseEvent(e, onMouseMove);
        }}
        onMouseUp={(e) => {
          // console.log('Stage mouse up');
          onMouseUp();
        }}
        className={styles.stage}
      >
        <Layer>
          {elements.map((element, index) => renderElement(element, index))}
        </Layer>
      </Stage>
    </Pane>
  );
};
