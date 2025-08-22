import { Line, Rect, Circle } from "react-konva";
import type { GraphicObject } from "@/core/types/interfaces/igraphic-object";

export const renderGraphicObject = (element: GraphicObject) => {
  switch (element.type) {
    case "brush":
    case "eraser":
      return (
        <Line
          key={element.id}
          points={(element.props as any).points}
          stroke={(element.props as any).stroke}
          strokeWidth={(element.props as any).strokeWidth}
          lineCap="round"
          lineJoin="round"
          perfectDrawEnabled={false}
        />
      );

    case "line":
      return (
        <Line
          key={element.id}
          points={[
            (element.props as any).x1,
            (element.props as any).y1,
            (element.props as any).x2,
            (element.props as any).y2,
          ]}
          stroke={(element.props as any).stroke}
          strokeWidth={(element.props as any).strokeWidth}
          lineCap="round"
          lineJoin="round"
          perfectDrawEnabled={false}
        />
      );

    case "rect":
      return (
        <Rect
          key={element.id}
          x={(element.props as any).x}
          y={(element.props as any).y}
          width={(element.props as any).width}
          height={(element.props as any).height}
          stroke={(element.props as any).stroke}
          strokeWidth={(element.props as any).strokeWidth}
          fill={(element.props as any).fill}
        />
      );

    case "circle":
      return (
        <Circle
          key={element.id}
          x={(element.props as any).x}
          y={(element.props as any).y}
          radius={(element.props as any).radius}
          stroke={(element.props as any).stroke}
          strokeWidth={(element.props as any).strokeWidth}
          fill={(element.props as any).fill}
        />
      );

    default:
      return null;
  }
};
