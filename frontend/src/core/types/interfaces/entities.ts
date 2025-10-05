import type { GraphicObject, GraphicObjectType } from "./igraphic-objects";

export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface Layer {
  id: string;
  projectId: string;
  name: string;
  order: number;
  isVisible: boolean;
  opacity: number;
  data: GraphicObject[];
  createdAt: string;
  updatedAt: string;
}

// Исправленный интерфейс History с правильной структурой
export interface History {
  id: string;
  projectId: string;
  action: string;
  layerId?: string | null;
  data: {
    layers: Layer[];
    timestamp?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

// Типы для инструментов (согласованы с GraphicObjectType)
export type ToolType = "brush" | "eraser" | "line" | "rectangle" | "circle";

export interface Tool {
  activeTool: ToolType;
  lineWidth: number;
  strokeColor: string;
  fillColor?: string;
  cursor: string;
}

// Утилитарные типы для работы с сущностями
export type CreateProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateProjectInput = Partial<
  Pick<Project, "name" | "width" | "height">
>;

export type CreateLayerInput = Omit<Layer, "id" | "createdAt" | "updatedAt">;
export type UpdateLayerInput = Partial<
  Pick<Layer, "name" | "order" | "isVisible" | "opacity" | "data">
>;

// Маппинг UI инструментов в типы графических объектов
export const TOOL_TO_GRAPHIC_TYPE_MAP: Record<
  ToolType,
  GraphicObjectType | null
> = {
  brush: "freePath",
  eraser: "freePath",
  line: "line",
  rectangle: "rect",
  circle: "circle",
} as const;

// Функция для получения типа графического объекта по инструменту
export const getGraphicTypeForTool = (
  tool: ToolType
): GraphicObjectType | null => {
  return TOOL_TO_GRAPHIC_TYPE_MAP[tool];
};

// Валидация слоя
export const isValidLayer = (obj: Layer) => {
  if (!obj || typeof obj !== "object") return false;

  const { id, projectId, name, order, isVisible, opacity, data } = obj;

  return (
    typeof id === "string" &&
    typeof projectId === "string" &&
    typeof name === "string" &&
    typeof order === "number" &&
    typeof isVisible === "boolean" &&
    typeof opacity === "number" &&
    Array.isArray(data)
  );
};
