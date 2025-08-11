import { configureStore } from '@reduxjs/toolkit'
import testReducer from '@/core/store/slices/test-slice'

import { api } from '../api'

export const store = configureStore({
  reducer: {
    test: testReducer,
    [api.reducerPath]: api.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
