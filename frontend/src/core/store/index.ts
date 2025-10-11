import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import toolReducer from "./slices/tool-slice";
import graphicObjectsReducer from "./slices/graphicObjectSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    tool: toolReducer,
    graphicObjects: graphicObjectsReducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
