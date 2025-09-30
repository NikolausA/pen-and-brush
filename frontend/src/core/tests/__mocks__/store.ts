import { configureStore, Store } from '@reduxjs/toolkit';

// Mock reducers
const mockToolReducer = {
  currentTool: 'pen',
  settings: {},
};

const mockGraphicObjectsReducer = {
  objects: [],
};

// Create mock store with explicit typing
export const mockStore: Store = configureStore({
  reducer: {
    tool: () => mockToolReducer,
    graphicObjects: () => mockGraphicObjectsReducer,
  },
});