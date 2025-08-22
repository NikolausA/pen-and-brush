import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  GraphicObject,
  Layer,
  ToolType,
  FreeDrawProps,
  Line,
  Circle,
  Rectangle,
} from "@/core/types/interfaces";
import { createGraphicObject, updateGraphicObject } from "@/core/utils";

interface CanvasState {
  past: GraphicObject[][];
  present: GraphicObject[];
  future: GraphicObject[][];
  layers: Layer[];
  layerCounter: number;
  activeLayerId: string | null;
  ui: {
    activeTool: ToolType;
    activeColor: string;
  };
}

const initialState: CanvasState = {
  past: [],
  present: [],
  future: [],
  layers: [
    {
      id: "layer-1",
      name: "Слой 1",
      opacity: 1,
      visible: true,
    },
  ],
  layerCounter: 1,
  activeLayerId: "layer-1",
  ui: {
    activeTool: null,
    activeColor: "#000000",
  },
};

export const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    // Создать объект из параметров
    createObject: (
      state,
      action: PayloadAction<{
        tool: ToolType;
        color: string;
        start: { x: number; y: number };
        layerId: string;
      }>
    ) => {
      if (!action.payload.tool) return;

      const object = createGraphicObject(
        action.payload.tool,
        action.payload.color,
        action.payload.start,
        action.payload.layerId
      );

      state.past.push([...state.present]);
      state.present.push(object);
      state.future = [];
    },

    // Обновить последний объект
    updateLastObject: (
      state,
      action: PayloadAction<{ to: { x: number; y: number } }>
    ) => {
      if (state.present.length === 0) return;

      const lastIndex = state.present.length - 1;
      const lastObject = state.present[lastIndex];
      const updatedObject = updateGraphicObject(lastObject, action.payload.to);

      state.present[lastIndex] = updatedObject;
    },

    // Добавить готовый объект
    addObject: (state, action: PayloadAction<GraphicObject>) => {
      if (!state.activeLayerId) return;
      state.past.push([...state.present]);
      state.present.push({
        ...action.payload,
        layerId: state.activeLayerId,
      });
      state.future = [];
    },

    updateObject: (
      state,
      action: PayloadAction<{
        id: string;
        // уже кусок props, НЕ объект с полем props
        updates: Partial<FreeDrawProps | Line | Circle | Rectangle>;
      }>
    ) => {
      state.past.push([...state.present]);
      const idx = state.present.findIndex((o) => o.id === action.payload.id);
      if (idx === -1) return;

      const obj = state.present[idx];

      switch (obj.type) {
        case "brush":
        case "eraser": {
          const upd = action.payload.updates as Partial<FreeDrawProps>;
          const prev = obj.props as FreeDrawProps;
          state.present[idx] = {
            ...obj,
            props: { ...prev, ...upd },
          };
          break;
        }
        case "line": {
          const upd = action.payload.updates as Partial<Line>;
          const prev = obj.props as Line;
          state.present[idx] = {
            ...obj,
            props: { ...prev, ...upd },
          };
          break;
        }
        case "circle": {
          const upd = action.payload.updates as Partial<Circle>;
          const prev = obj.props as Circle;
          state.present[idx] = {
            ...obj,
            props: { ...prev, ...upd },
          };
          break;
        }
        case "rect": {
          const upd = action.payload.updates as Partial<Rectangle>;
          const prev = obj.props as Rectangle;
          state.present[idx] = {
            ...obj,
            props: { ...prev, ...upd },
          };
          break;
        }
        default:
          // exhaustive check
          break;
      }

      state.future = [];
    },

    // Типобезопасное обновление с проверкой типа объекта
    updateObjectTypeSafe: (
      state,
      action: PayloadAction<{
        id: string;
        updates:
          | {
              type: "brush" | "eraser";
              props: Partial<import("@/core/types/interfaces").FreeDrawProps>;
            }
          | {
              type: "line";
              props: Partial<import("@/core/types/interfaces").Line>;
            }
          | {
              type: "circle";
              props: Partial<import("@/core/types/interfaces").Circle>;
            }
          | {
              type: "rect";
              props: Partial<import("@/core/types/interfaces").Rectangle>;
            };
      }>
    ) => {
      state.past.push([...state.present]);
      const idx = state.present.findIndex(
        (obj) => obj.id === action.payload.id
      );
      if (idx === -1) return;

      const current = state.present[idx];
      const { updates } = action.payload;

      switch (updates.type) {
        case "brush":
        case "eraser":
          if (current.type === updates.type) {
            state.present[idx] = {
              ...current,
              props: { ...(current.props as FreeDrawProps), ...updates.props },
            };
          }
          break;

        case "line":
          if (current.type === "line") {
            state.present[idx] = {
              ...current,
              props: { ...(current.props as Line), ...updates.props },
            };
          }
          break;

        case "circle":
          if (current.type === "circle") {
            state.present[idx] = {
              ...current,
              props: { ...(current.props as Circle), ...updates.props },
            };
          }
          break;

        case "rect":
          if (current.type === "rect") {
            state.present[idx] = {
              ...current,
              props: { ...(current.props as Rectangle), ...updates.props },
            };
          }
          break;
      }

      state.future = [];
    },

    deleteObject: (state, action: PayloadAction<string>) => {
      state.past.push([...state.present]);
      state.present = state.present.filter((obj) => obj.id !== action.payload);
      state.future = [];
    },

    undo: (state) => {
      if (state.past.length > 0) {
        const previous = state.past[state.past.length - 1];
        state.future.unshift(state.present);
        state.present = previous;
        state.past = state.past.slice(0, -1);
      }
    },

    redo: (state) => {
      if (state.future.length > 0) {
        const next = state.future[0];
        state.past.push(state.present);
        state.present = next;
        state.future = state.future.slice(1);
      }
    },

    resetCanvas: (state) => {
      state.past.push([...state.present]);
      state.present = [];
      state.future = [];
    },

    addLayer: (state) => {
      state.layerCounter += 1;
      const newLayer: Layer = {
        id: `layer-${state.layerCounter}`,
        name: `Слой ${state.layerCounter}`,
        opacity: 1,
        visible: true,
      };
      state.layers.push(newLayer);
      state.activeLayerId = newLayer.id;
    },

    setActiveLayer: (state, action: PayloadAction<string>) => {
      state.activeLayerId = action.payload;
    },

    renameLayer: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      const layer = state.layers.find((l) => l.id === action.payload.id);
      if (layer) {
        layer.name = action.payload.name;
      }
    },

    setLayerOpacity: (
      state,
      action: PayloadAction<{ id: string; opacity: number }>
    ) => {
      const layer = state.layers.find((l) => l.id === action.payload.id);
      if (layer) {
        layer.opacity = Math.min(1, Math.max(0, action.payload.opacity));
      }
    },

    toggleLayerVisibility: (state, action: PayloadAction<string>) => {
      const layer = state.layers.find((l) => l.id === action.payload);
      if (layer) {
        layer.visible = !layer.visible;
      }
    },

    deleteLayer: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.layers = state.layers.filter((l) => l.id !== id);
      state.present = state.present.filter((obj) => obj.layerId !== id);

      if (state.activeLayerId === id) {
        state.activeLayerId = state.layers.length
          ? state.layers[state.layers.length - 1].id
          : null;
      }
    },

    setActiveTool: (state, action: PayloadAction<ToolType>) => {
      state.ui.activeTool = action.payload;
    },

    setActiveColor: (state, action: PayloadAction<string>) => {
      state.ui.activeColor = action.payload;
    },
  },
});

// Экспорт actions
export const {
  createObject,
  updateLastObject,
  addObject,
  updateObject,
  updateObjectTypeSafe,
  deleteObject,
  undo,
  redo,
  resetCanvas,
  addLayer,
  setActiveLayer,
  renameLayer,
  setLayerOpacity,
  toggleLayerVisibility,
  deleteLayer,
  setActiveTool,
  setActiveColor,
} = canvasSlice.actions;

export default canvasSlice.reducer;
