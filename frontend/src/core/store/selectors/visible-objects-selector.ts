import type { RootState } from "@/core/store";

export const selectVisibleObjects = (state: RootState) => {
  const layers = state.canvas.layers;
  const layerMap = new Map(layers.map((layer) => [layer.id, layer]));

  return state.canvas.present
    .filter((obj) => {
      const layer = layerMap.get(obj.layerId);
      return layer?.visible ?? false;
    })
    .map((obj) => {
      const layer = layerMap.get(obj.layerId);
      return {
        ...obj,
        opacity: layer?.opacity || 1,
      };
    });
};
