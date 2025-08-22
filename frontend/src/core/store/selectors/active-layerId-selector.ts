import { type RootState } from "../index";

export const selectActiveLayerId = (state: RootState) =>
  state.canvas.activeLayerId;
