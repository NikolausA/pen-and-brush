import { type RootState } from "../index";

export const selectFutureLength = (state: RootState) =>
  state.canvas.future.length;
