import { nanoid } from "@reduxjs/toolkit";
import type {
  ToolType,
  GraphicObject,
  FreeDrawProps,
  Line,
  Circle,
  Rectangle,
} from "@/core/types/interfaces/igraphic-object";

// Утилита создания объекта
export const createGraphicObject = (
  tool: ToolType,
  color: string,
  start: { x: number; y: number },
  layerId: string
): GraphicObject => {
  const id = nanoid();

  const strokeWidth = 2; // Можно сделать параметром

  switch (tool) {
    case "brush": {
      const props: FreeDrawProps = {
        points: [start.x, start.y],
        stroke: color,
        strokeWidth,
      };
      return {
        id,
        type: "brush",
        props,
        layerId,
      };
    }

    case "eraser": {
      const props: FreeDrawProps = {
        points: [start.x, start.y],
        stroke: "#ffffff", // Белый цвет для ластика или фоновый
        strokeWidth: strokeWidth * 2, // Ластик обычно толще
      };
      return {
        id,
        type: "eraser",
        props,
        layerId,
      };
    }

    case "line": {
      const props: Line = {
        x1: start.x,
        y1: start.y,
        x2: start.x, // Начальная точка совпадает с конечной
        y2: start.y,
        stroke: color,
        strokeWidth,
      };
      return {
        id,
        type: "line",
        props,
        layerId,
      };
    }

    case "circle": {
      const props: Circle = {
        x: start.x,
        y: start.y,
        radius: 0, // Начальный радиус 0
        stroke: color,
        strokeWidth,
        fill: undefined, // Можно добавить параметр для заливки
      };
      return {
        id,
        type: "circle",
        props,
        layerId,
      };
    }

    case "rect": {
      const props: Rectangle = {
        x: start.x,
        y: start.y,
        width: 0, // Начальная ширина 0
        height: 0, // Начальная высота 0
        stroke: color,
        strokeWidth,
        fill: undefined, // Можно добавить параметр для заливки
      };
      return {
        id,
        type: "rect",
        props,
        layerId,
      };
    }

    case null:
    default:
      throw new Error(`Cannot create object for tool: ${tool}`);
  }
};
