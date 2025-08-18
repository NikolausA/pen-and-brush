import { configureStore } from "@reduxjs/toolkit";
import canvasReducer from "@/core/store/slices/canvas-slice";

import { api } from "../api";

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
