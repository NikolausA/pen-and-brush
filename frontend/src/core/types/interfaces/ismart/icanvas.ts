import type { KonvaEventObject } from "konva/lib/Node";

export interface ICanvasProps {
  width: number;
  height: number;
  getCursor?: () => string;
  handleMouseDown: (e: KonvaEventObject<MouseEvent>) => void;
  handleMouseMove: (e: KonvaEventObject<MouseEvent>) => void;
  handleMouseUp: (e: KonvaEventObject<MouseEvent>) => void;
  children?: React.ReactNode; 
}
