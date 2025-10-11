export type GraphicPrimitiveType = "line" | "freePath" | "rect" | "circle";

// Валидируемые типы
export type StrokeWidth = number; // TODO: добавить branded type для 1-50
export type Opacity = number; // TODO: добавить branded type для 0-100
export type Color = string; // TODO: добавить branded type для hex/rgb

// Координаты
export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Point, Size {}

// Базовый интерфейс для всех графических объектов
export interface BaseGraphicObject {
  readonly id: string;
  readonly layerId: string;
  readonly type: GraphicPrimitiveType;
  readonly strokeColor: Color;
  readonly strokeWidth: StrokeWidth;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

// Специализированные объекты
export interface LineObject extends BaseGraphicObject {
  readonly type: "line";
  readonly points: readonly [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface FreePathObject extends BaseGraphicObject {
  readonly type: "freePath";
  readonly points: readonly number[]; // неизменяемый массив координат
}

export interface RectObject extends BaseGraphicObject {
  readonly type: "rect";
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fillColor: Color;
}

export interface CircleObject extends BaseGraphicObject {
  readonly type: "circle";
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly fillColor: Color;
}

// Union тип всех графических объектов
export type GraphicObject =
  | LineObject
  | FreePathObject
  | RectObject
  | CircleObject;

// Утилитарные типы
export type GraphicObjectData<T extends GraphicPrimitiveType> = T extends "line"
  ? LineObject
  : T extends "freePath"
  ? FreePathObject
  : T extends "rect"
  ? RectObject
  : T extends "circle"
  ? CircleObject
  : never;

// Фабричные типы для создания объектов
export type CreateGraphicObjectInput<T extends GraphicPrimitiveType> = Omit<
  GraphicObjectData<T>,
  "id" | "createdAt" | "updatedAt"
>;
