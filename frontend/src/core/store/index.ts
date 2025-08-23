import { configureStore } from "@reduxjs/toolkit";
import canvasReducer from "@/core/store/slices/canvas-slice";
import projectsReducer from "@/core/store/slices/projects-slice";

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    projects: projectsReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;