import type { GraphicObject, Color, StrokeWidth } from "./objects";

// Типы для Canvas рендеринга (отличаются от доменных объектов)
export type CanvasElementType =
  | "brush"
  | "eraser"
  | "line"
  | "rectangle"
  | "circle";

export interface BaseCanvasElement {
  readonly id: string;
  readonly type: CanvasElementType;
  readonly color: Color;
  readonly opacity?: number;
}

export interface BrushElement extends BaseCanvasElement {
  readonly type: "brush" | "eraser";
  readonly points: readonly number[];
  readonly strokeWidth?: StrokeWidth;
}

export interface LineElement extends BaseCanvasElement {
  readonly type: "line";
  readonly points: readonly [number, number, number, number];
  readonly strokeWidth?: StrokeWidth;
}

export interface RectangleElement extends BaseCanvasElement {
  readonly type: "rectangle";
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface CircleElement extends BaseCanvasElement {
  readonly type: "circle";
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type CanvasElement =
  | BrushElement
  | LineElement
  | RectangleElement
  | CircleElement;

// Функция преобразования доменного объекта в Canvas элемент
export type GraphicObjectToCanvasElement = (
  obj: GraphicObject
) => CanvasElement;
