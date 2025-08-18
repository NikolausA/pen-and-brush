export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
  fill?: string;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
  stroke: string;
  strokeWidth: number;
  fill?: string;
}

export interface FreeDrawProps {
  points: number[];
  stroke: string;
  strokeWidth: number;
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
}

export type ToolType = "brush" | "eraser" | "line" | "circle" | "rect";

export type GraphicProps = FreeDrawProps | Line | Circle | Rectangle;

export interface GraphicObject {
  id: string;
  type: ToolType;
  props: GraphicProps;
}
