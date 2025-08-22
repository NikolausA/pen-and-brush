import { type RootState } from "../index";

export const selectActiveColor = (state: RootState) =>
  state.canvas.ui.activeColor;
