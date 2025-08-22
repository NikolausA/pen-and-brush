import type { RootState } from "@/core/store";

export const selectCanUndo = (state: RootState) => state.canvas.past.length > 0;
