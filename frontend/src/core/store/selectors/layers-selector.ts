import { type RootState } from "../index";

export const selectLayers = (state: RootState) => state.canvas.layers;
