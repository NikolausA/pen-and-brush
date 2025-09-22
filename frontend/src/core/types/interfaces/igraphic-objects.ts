export type GraphicObjectType = "line" | "freePath" | "rect" | "circle";

// Расширенные типы для Canvas рендеринга
export type CanvasRenderType =
  | "brush"
  | "eraser"
  | "line"
  | "rectangle"
  | "circle";

export interface BaseGraphicObject {
  id: string; // UUID
  layerId: string; // принадлежность слою
  type: GraphicObjectType;
  strokeColor: string;
  strokeWidth: number;

  // Дополнительные свойства для рендеринга (опциональные)
  opacity?: number; // 0-1, для слоя
  layerOrder?: number; // порядок слоя для сортировки
  isDraft?: boolean; // является ли объект черновиком
}

export interface LineObject extends BaseGraphicObject {
  type: "line";
  points: number[];
}

export interface FreePathObject extends BaseGraphicObject {
  type: "freePath";
  points: number[];
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

  // Дополнительные свойства для Canvas рендеринга (опциональные)
  centerX?: number;
  centerY?: number;
  width?: number;
  height?: number;
}

export type GraphicObject =
  | LineObject
  | FreePathObject
  | RectObject
  | CircleObject;

// Утилитарные типы для работы с объектами
export type GraphicObjectForCanvas<T extends GraphicObjectType> =
  T extends "line"
    ? LineObject
    : T extends "freePath"
    ? FreePathObject
    : T extends "rect"
    ? RectObject
    : T extends "circle"
    ? CircleObject
    : never;

// Типы для создания объектов (без служебных полей)
export type CreateGraphicObjectInput<T extends GraphicObjectType> = Omit<
  GraphicObjectForCanvas<T>,
  "opacity" | "layerOrder" | "isDraft"
>;

// Type guards для проверки типов объектов
export const isLineObject = (obj: GraphicObject): obj is LineObject =>
  obj.type === "line";

export const isFreePathObject = (obj: GraphicObject): obj is FreePathObject =>
  obj.type === "freePath";

export const isRectObject = (obj: GraphicObject): obj is RectObject =>
  obj.type === "rect";

export const isCircleObject = (obj: GraphicObject): obj is CircleObject =>
  obj.type === "circle";

// Проверка наличия points у объекта
export const hasPoints = (
  obj: GraphicObject
): obj is LineObject | FreePathObject =>
  obj.type === "line" || obj.type === "freePath";

// Проверка наличия координат и размеров
export const hasPosition = (
  obj: GraphicObject
): obj is RectObject | CircleObject =>
  obj.type === "rect" || obj.type === "circle";

// Маппинг типов объектов в типы Canvas рендеринга
export const GRAPHIC_TYPE_TO_CANVAS_TYPE: Record<
  GraphicObjectType,
  CanvasRenderType | ((obj: GraphicObject) => CanvasRenderType)
> = {
  line: "line",
  freePath: (obj: GraphicObject) =>
    obj.strokeColor === "#ffffff" ? "eraser" : "brush",
  rect: "rectangle",
  circle: "circle",
} as const;

// Функция для получения Canvas типа из GraphicObject
export const getCanvasRenderType = (obj: GraphicObject): CanvasRenderType => {
  const mapping = GRAPHIC_TYPE_TO_CANVAS_TYPE[obj.type];
  return typeof mapping === "function" ? mapping(obj) : mapping;
};

// Проверка является ли объект фигурой с заливкой
export const hasShapeFill = (
  obj: GraphicObject
): obj is RectObject | CircleObject => {
  return obj.type === "rect" || obj.type === "circle";
};

// Проверка является ли объект путем (линия или свободный путь)
export const isPathObject = (
  obj: GraphicObject
): obj is LineObject | FreePathObject => {
  return obj.type === "line" || obj.type === "freePath";
};

// Валидация объекта
export const isValidGraphicObject = (obj: GraphicObject) => {
  if (!obj || typeof obj !== "object") return false;

  const { id, layerId, type, strokeColor, strokeWidth } = obj;

  // Проверка базовых полей
  if (
    typeof id !== "string" ||
    typeof layerId !== "string" ||
    typeof type !== "string" ||
    typeof strokeColor !== "string" ||
    typeof strokeWidth !== "number"
  ) {
    return false;
  }

  // Проверка допустимого типа
  if (!["line", "freePath", "rect", "circle"].includes(type)) {
    return false;
  }

  // Специфичные проверки для каждого типа
  switch (type) {
    case "line":
    case "freePath":
      return Array.isArray(obj.points);
    case "rect":
      return (
        typeof obj.x === "number" &&
        typeof obj.y === "number" &&
        typeof obj.width === "number" &&
        typeof obj.height === "number" &&
        typeof obj.fillColor === "string"
      );
    case "circle":
      return (
        typeof obj.x === "number" &&
        typeof obj.y === "number" &&
        typeof obj.radius === "number" &&
        typeof obj.fillColor === "string"
      );
    default:
      return false;
  }
};

// Фабричные функции для создания объектов
export const createLineObject = (
  id: string,
  layerId: string,
  points: number[],
  strokeColor: string,
  strokeWidth: number = 1
): LineObject => ({
  id,
  layerId,
  type: "line",
  points,
  strokeColor,
  strokeWidth,
});

export const createFreePathObject = (
  id: string,
  layerId: string,
  points: number[],
  strokeColor: string,
  strokeWidth: number = 5
): FreePathObject => ({
  id,
  layerId,
  type: "freePath",
  points,
  strokeColor,
  strokeWidth,
});

export const createRectObject = (
  id: string,
  layerId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeColor: string,
  fillColor: string,
  strokeWidth: number = 1
): RectObject => ({
  id,
  layerId,
  type: "rect",
  x,
  y,
  width,
  height,
  strokeColor,
  strokeWidth,
  fillColor,
});

export const createCircleObject = (
  id: string,
  layerId: string,
  x: number,
  y: number,
  radius: number,
  strokeColor: string,
  fillColor: string,
  strokeWidth: number = 1
): CircleObject => ({
  id,
  layerId,
  type: "circle",
  x,
  y,
  radius,
  strokeColor,
  strokeWidth,
  fillColor,
});
