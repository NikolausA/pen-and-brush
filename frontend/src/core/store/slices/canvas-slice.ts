import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type GraphicObject, type Layer } from "@/core/types/interfaces";

interface CanvasState {
  past: GraphicObject[][];
  present: GraphicObject[];
  future: GraphicObject[][];
  layers: Layer[];
  layerCounter: number;
}

const loadState = (): CanvasState | undefined => {
  try {
    const serialized = localStorage.getItem("canvasState");
    if (serialized) return JSON.parse(serialized) as CanvasState;
  } catch (err) {
    console.error("Ошибка загрузки состояния из localStorage", err);
  }
  return undefined;
};

const saveState = (state: CanvasState) => {
  try {
    localStorage.setItem("canvasState", JSON.stringify(state));
  } catch (err) {
    console.error("Ошибка сохранения состояния в localStorage", err);
  }
};

const initialState: CanvasState = loadState() || {
  past: [],
  present: [],
  future: [],
  layers: [],
  layerCounter: 1,
};

export const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    // ---------------- Графические объекты ----------------
    addObject: (state, action: PayloadAction<GraphicObject>) => {
      state.past.push(state.present);
      state.present = [...state.present, action.payload];
      state.future = [];
      saveState(state);
    },
    updateObject: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<GraphicObject["props"]>;
      }>
    ) => {
      state.past.push(state.present);
      state.present = state.present.map((obj) =>
        obj.id === action.payload.id
          ? { ...obj, props: { ...obj.props, ...action.payload.updates } }
          : obj
      );
      state.future = [];
      saveState(state);
    },
    deleteObject: (state, action: PayloadAction<string>) => {
      state.past.push(state.present);
      state.present = state.present.filter((obj) => obj.id !== action.payload);
      state.future = [];
      saveState(state);
    },

    // ---------------- Undo/Redo ----------------
    undo: (state) => {
      if (state.past.length > 0) {
        const previous = state.past[state.past.length - 1];
        state.future.unshift(state.present);
        state.present = previous;
        state.past = state.past.slice(0, -1);
        saveState(state);
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        const next = state.future[0];
        state.past.push(state.present);
        state.present = next;
        state.future = state.future.slice(1);
        saveState(state);
      }
    },
    resetCanvas: (state) => {
      state.past.push(state.present);
      state.present = [];
      state.future = [];
      saveState(state);
    },

    // ---------------- Слои ----------------
    addLayer: (state) => {
      state.layerCounter += 1;
      const newLayer: Layer = {
        id: `layer-${state.layerCounter}`,
        name: `Слой ${state.layerCounter}`,
        opacity: 0,
        visible: true,
      };
      state.layers.push(newLayer);
      saveState(state);
    },
    renameLayer: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      const layer = state.layers.find((l) => l.id === action.payload.id);
      if (layer) {
        layer.name = action.payload.name;
        saveState(state);
      }
    },
    setLayerOpacity: (
      state,
      action: PayloadAction<{ id: string; opacity: number }>
    ) => {
      const layer = state.layers.find((l) => l.id === action.payload.id);
      if (layer) {
        layer.opacity = Math.min(1, Math.max(0, action.payload.opacity));
        saveState(state);
      }
    },
    toggleLayerVisibility: (state, action: PayloadAction<string>) => {
      const layer = state.layers.find((l) => l.id === action.payload);
      if (layer) {
        layer.visible = !layer.visible;
        saveState(state);
      }
    },
    deleteLayer: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.layers = state.layers.filter((l) => l.id !== id);
      state.present = state.present.filter((obj) => obj.layerId !== id);
      saveState(state);
    },
  },
});

export const {
  addObject,
  updateObject,
  deleteObject,
  undo,
  redo,
  resetCanvas,
  addLayer,
  renameLayer,
  setLayerOpacity,
  toggleLayerVisibility,
  deleteLayer,
} = canvasSlice.actions;

export default canvasSlice.reducer;
