import { type RootState } from "../index";

export const selectActiveTool = (state: RootState) =>
  state.canvas.ui.activeTool;
