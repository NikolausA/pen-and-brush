import type { RootState } from "@/core/store";

export const selectLayerObjects = (
  state: RootState,
  layerId: string | null
) => {
  if (!layerId) return [];
  return state.canvas.present.filter((obj) => obj.layerId === layerId);
};
