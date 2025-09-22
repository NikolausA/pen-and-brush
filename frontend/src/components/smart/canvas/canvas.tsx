//@ts-nocheck
import { Pane } from "evergreen-ui";
import { Stage, Layer, Line, Rect, Circle, RegularPolygon } from "react-konva";

import styles from "./canvas.module.scss";
import type { DrawingElement } from "@/components/smart/editor/editor";

interface CanvasProps {
  width: number;
  height: number;
  elements: DrawingElement[];
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
}: CanvasProps) => {
  const handleMouseEvent = (
    e: any,
    handler: (pos: { x: number; y: number }) => void
  ) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    handler(pointerPos);
  };

  const renderElement = (element: DrawingElement) => {
    switch (element.type) {
      case "brush":
        return (
          <Line
            key={element.id}
            points={element.points}
            stroke={element.color}
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
            tension={0.5}
            perfectDrawEnabled={false}
            listening={false}
          />
        );
      case "eraser":
        return (
          <Line
            key={element.id}
            points={element.points}
            stroke="#ffffff"
            strokeWidth={20}
            lineCap="round"
            lineJoin="round"
            tension={0.5}
            perfectDrawEnabled={false}
            listening={false}
            globalCompositeOperation="destination-out"
          />
        );
      case "rectangle":
        return (
          <Rect
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill={element.color}
            stroke="black"
            strokeWidth={1}
            listening={false}
          />
        );
      case "circle":
        return (
          <Circle
            key={element.id}
            x={(element.x || 0) + (element.width || 0) / 2}
            y={(element.y || 0) + (element.height || 0) / 2}
            radius={Math.max(element.width || 0, element.height || 0) / 2}
            fill={element.color}
            stroke="black"
            strokeWidth={1}
            listening={false}
          />
        );
      case "triangle":
        return (
          <RegularPolygon
            key={element.id}
            x={(element.x || 0) + (element.width || 0) / 2}
            y={(element.y || 0) + (element.height || 0) / 2}
            sides={3}
            radius={Math.max(element.width || 0, element.height || 0) / 2}
            fill={element.color}
            stroke="black"
            strokeWidth={1}
            listening={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Pane className={styles.container}>
      <Stage
        width={width}
        height={height}
        onMouseDown={(e) => handleMouseEvent(e, onMouseDown)}
        onMouseMove={(e) => handleMouseEvent(e, onMouseMove)}
        onMouseUp={onMouseUp}
        className={styles.stage}
      >
        <Layer>{elements.map(renderElement)}</Layer>
      </Stage>
    </Pane>
  );
};
