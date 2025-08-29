import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type GraphicObject } from "@/core/types/interfaces/igraphic-objects";

interface GraphicObjectsState {
  entities: Record<string, GraphicObject>;
}

const initialState: GraphicObjectsState = {
  entities: {},
};

export const graphicObjectsSlice = createSlice({
  name: "graphicObjects",
  initialState,
  reducers: {
    setObjects(state, action: PayloadAction<GraphicObject[]>) {
      state.entities = {};
      for (const obj of action.payload) {
        state.entities[obj.id] = obj;
      }
    },
    addObject(state, action: PayloadAction<GraphicObject>) {
      state.entities[action.payload.id] = action.payload;
    },
    updateObject(state, action: PayloadAction<GraphicObject>) {
      state.entities[action.payload.id] = action.payload;
    },
    deleteObject(state, action: PayloadAction<string>) {
      delete state.entities[action.payload];
    },
    clearLayerObjects(state, action: PayloadAction<string>) {
      for (const id in state.entities) {
        if (state.entities[id].layerId === action.payload) {
          delete state.entities[id];
        }
      }
    },
  },
});

export const {
  setObjects,
  addObject,
  updateObject,
  deleteObject,
  clearLayerObjects,
} = graphicObjectsSlice.actions;

export default graphicObjectsSlice.reducer;
