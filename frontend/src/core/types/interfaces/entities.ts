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
  opacity: number; // от 0 до 100
  data: Record<string, unknown>; // JSON из БД
  createdAt: string;
  updatedAt: string;
}

export interface History {
  id: string;
  projectId: string;
  layerId?: string | null;
  action: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type ToolType = "brush" | "eraser" | "line" | "rectangle" | "circle";

export interface Tool {
  activeTool: ToolType;
  lineWidth: number;
  strokeColor: string;
  fillColor?: string;
  cursor: string;
}
