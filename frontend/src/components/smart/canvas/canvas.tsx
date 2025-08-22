import { Stage, Layer } from "react-konva";
import type { GraphicObject } from "@/core/types/interfaces/igraphic-object";
import { renderGraphicObject } from "@/components/simple/render-graphic-object";

interface CanvasProps {
  width: number;
  height: number;
  elements: GraphicObject[];
  onMouseDown: (pos: { x: number; y: number }) => void;
  onMouseMove: (pos: { x: number; y: number }) => void;
  onMouseUp: () => void;
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
    const pointerPos = stage?.getPointerPosition();
    if (pointerPos) {
      handler(pointerPos);
    }
  };

  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={(e) => handleMouseEvent(e, onMouseDown)}
      onMouseMove={(e) => handleMouseEvent(e, onMouseMove)}
      onMouseUp={onMouseUp}
    >
      <Layer>{elements.map((element) => renderGraphicObject(element))}</Layer>
    </Stage>
  );
};
