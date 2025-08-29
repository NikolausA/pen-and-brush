export type GraphicObjectType = "line" | "freePath" | "rect" | "circle";

export interface BaseGraphicObject {
  id: string; // UUID
  layerId: string; // принадлежность слою
  type: GraphicObjectType;
  strokeColor: string;
  strokeWidth: number;
}

export interface LineObject extends BaseGraphicObject {
  type: "line";
  points: number[]; // [x1, y1, x2, y2]
}

export interface FreePathObject extends BaseGraphicObject {
  type: "freePath";
  points: number[]; // массив координат для Path (например, [x1, y1, x2, y2, ...])
}

export interface RectObject extends BaseGraphicObject {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
}

export interface CircleObject extends BaseGraphicObject {
  type: "circle";
  x: number;
  y: number;
  radius: number;
  fillColor: string;
}

export type GraphicObject =
  | LineObject
  | FreePathObject
  | RectObject
  | CircleObject;
