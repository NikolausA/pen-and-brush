import type { RootState } from "@/core/store";

export const selectAllObjects = (state: RootState) => state.canvas.present;
