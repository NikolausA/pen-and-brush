import type { RootState } from "@/core/store";

export const selectCanRedo = (state: RootState) =>
  state.canvas.future.length > 0;
