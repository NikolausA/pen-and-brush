import { type RootState } from "../index";

export const selectPastLength = (state: RootState) => state.canvas.past.length;
