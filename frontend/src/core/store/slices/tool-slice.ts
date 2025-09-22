// src/store/toolSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Tool, ToolType } from "@/core/types/domain/entities";

const initialState: Tool = {
  activeTool: "brush",
  lineWidth: 2,
  strokeColor: "#000000",
  fillColor: "#ffffff",
  cursor: "default",
};

export const toolSlice = createSlice({
  name: "tool",
  initialState,
  reducers: {
    setActiveTool(state, action: PayloadAction<ToolType>) {
      state.activeTool = action.payload;
    },
    setLineWidth(state, action: PayloadAction<number>) {
      state.lineWidth = action.payload;
    },
    setStrokeColor(state, action: PayloadAction<string>) {
      state.strokeColor = action.payload;
    },
    setFillColor(state, action: PayloadAction<string>) {
      state.fillColor = action.payload;
    },
    setCursor(state, action: PayloadAction<string>) {
      state.cursor = action.payload;
    },
  },
});

export const {
  setActiveTool,
  setLineWidth,
  setStrokeColor,
  setFillColor,
  setCursor,
} = toolSlice.actions;

export default toolSlice.reducer;
