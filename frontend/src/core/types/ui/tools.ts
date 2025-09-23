// import type { GraphicPrimitiveType, Color, StrokeWidth } from "../graphics";

// // UI инструменты (отличаются от графических примитивов)
// export type EditorTool =
//   | "brush"
//   | "eraser"
//   | "line"
//   | "rectangle"
//   | "circle"
//   | "select"
//   | "pan";

// // Маппинг UI инструментов в графические примитивы
// export const TOOL_TO_GRAPHIC_TYPE_MAP: Record<
//   EditorTool,
//   GraphicPrimitiveType | null
// > = {
//   brush: "freePath",
//   eraser: "freePath",
//   line: "line",
//   rectangle: "rect",
//   circle: "circle",
//   select: null,
//   pan: null,
// } as const;

// // Состояние инструментов
// export interface ToolState {
//   readonly activeTool: EditorTool;
//   readonly strokeWidth: StrokeWidth;
//   readonly strokeColor: Color;
//   readonly fillColor: Color;
//   readonly cursor: string;
// }

// // События инструментов
// export interface ToolSelectEvent {
//   readonly tool: EditorTool;
//   readonly timestamp: number;
// }

// export interface ColorSelectEvent {
//   readonly color: Color;
//   readonly isStroke: boolean; // true для stroke, false для fill
//   readonly timestamp: number;
// }

// // Валидация инструментов
// export const isDrawingTool = (
//   tool: EditorTool
// ): tool is "brush" | "eraser" | "line" | "rectangle" | "circle" => {
//   return TOOL_TO_GRAPHIC_TYPE_MAP[tool] !== null;
// };

// export const getGraphicTypeForTool = (
//   tool: EditorTool
// ): GraphicPrimitiveType | null => {
//   return TOOL_TO_GRAPHIC_TYPE_MAP[tool];
// };
