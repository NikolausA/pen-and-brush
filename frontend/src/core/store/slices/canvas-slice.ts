import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type GraphicObject } from "@/core/types/interfaces";

interface CanvasState {
  past: GraphicObject[][];
  present: GraphicObject[];
  future: GraphicObject[][];
}

const initialState: CanvasState = {
  past: [],
  present: [],
  future: [],
};

export const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    addObject: (state, action: PayloadAction<GraphicObject>) => {
      state.past.push(state.present);
      state.present = [...state.present, action.payload];
      state.future = [];
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
    },
    deleteObject: (state, action: PayloadAction<string>) => {
      state.past.push(state.present);
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
      state.past.push(state.present);
      state.present = [];
      state.future = [];
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
} = canvasSlice.actions;

export default canvasSlice.reducer;
