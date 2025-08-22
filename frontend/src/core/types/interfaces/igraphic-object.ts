export interface Layer {
  id: string;
  name: string;
  opacity: number;
  visible: boolean;
}

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

export interface BrushObject {
  id: string;
  type: "brush";
  props: FreeDrawProps;
  layerId: Layer["id"];
}

export interface EraserObject {
  id: string;
  type: "eraser";
  props: FreeDrawProps;
  layerId: Layer["id"];
}

export interface LineObject {
  id: string;
  type: "line";
  props: Line;
  layerId: Layer["id"];
}

export interface CircleObject {
  id: string;
  type: "circle";
  props: Circle;
  layerId: Layer["id"];
}

export interface RectObject {
  id: string;
  type: "rect";
  props: Rectangle;
  layerId: Layer["id"];
}

export type GraphicObject =
  | BrushObject
  | EraserObject
  | LineObject
  | CircleObject
  | RectObject;

// export interface GraphicObject {
//   id: string;
//   type: ToolType;
//   props: GraphicProps;
//   layerId: Layer["id"];
// }
