// ./store/slices/layers-slice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

// Assuming the base URL for the backend API. Replace with your actual deployed URL.
// For example: const BASE_URL = 'https://your-server.com';
const BASE_URL = "/api"; // Or use environment variable like process.env.REACT_APP_API_URL

// Define the Layer type based on the provided table schema
interface Layer {
  id: string; // UUID
  projectId: string;
  name: string;
  order: number;
  isVisible?: boolean; // Default true
  opacity?: number; // Default 100.0
  data?: Record<string, any>; // JSON, default {}
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

// State interface
interface LayersState {
  layers: Layer[];
  currentLayer: Layer | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: LayersState = {
  layers: [],
  currentLayer: null,
  loading: false,
  error: null,
};

// Async thunk to get all layers for a project
export const getLayers = createAsyncThunk<
  Layer[],
  string,
  { rejectValue: string }
>("layers/getLayers", async (projectId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/projects/${projectId}/layers`);
    if (!response.ok) {
      throw new Error("Failed to fetch layers");
    }
    const data: Layer[] = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

// Async thunk to create a new layer in a project
export const createLayer = createAsyncThunk<
  Layer,
  {
    projectId: string;
    newLayer: Omit<Layer, "id" | "projectId" | "createdAt" | "updatedAt">;
  },
  { rejectValue: string }
>(
  "layers/createLayer",
  async ({ projectId, newLayer }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/projects/${projectId}/layers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLayer),
      });
      if (!response.ok) {
        throw new Error("Failed to create layer");
      }
      const data: Layer = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk to update an existing layer
export const updateLayer = createAsyncThunk<
  Layer,
  { projectId: string; layerId: string; updatedLayer: Partial<Layer> },
  { rejectValue: string }
>(
  "layers/updateLayer",
  async ({ projectId, layerId, updatedLayer }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL}/projects/${projectId}/layers/${layerId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedLayer),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update layer");
      }
      const data: Layer = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk to delete a layer
export const deleteLayer = createAsyncThunk<
  string,
  { projectId: string; layerId: string },
  { rejectValue: string }
>("layers/deleteLayer", async ({ projectId, layerId }, { rejectWithValue }) => {
  try {
    const response = await fetch(
      `${BASE_URL}/projects/${projectId}/layers/${layerId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete layer");
    }
    return layerId;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

// Layers slice
const layersSlice = createSlice({
  name: "layers",
  initialState,
  reducers: {
    setCurrentLayer: (state, action: PayloadAction<Layer | null>) => {
      state.currentLayer = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearLayers: (state) => {
      state.layers = [];
      state.currentLayer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getLayers
      .addCase(getLayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLayers.fulfilled, (state, action) => {
        state.loading = false;
        state.layers = action.payload.sort((a, b) => a.order - b.order); // Sort by order
      })
      .addCase(getLayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      })
      // createLayer
      .addCase(createLayer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLayer.fulfilled, (state, action) => {
        state.loading = false;
        state.layers.push(action.payload);
        state.layers.sort((a, b) => a.order - b.order); // Re-sort after add
        state.currentLayer = action.payload; // Optionally set as current
      })
      .addCase(createLayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      })
      // updateLayer
      .addCase(updateLayer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLayer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.layers.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.layers[index] = action.payload;
          state.layers.sort((a, b) => a.order - b.order); // Re-sort if order changed
        }
        if (state.currentLayer?.id === action.payload.id) {
          state.currentLayer = action.payload;
        }
      })
      .addCase(updateLayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      })
      // deleteLayer
      .addCase(deleteLayer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLayer.fulfilled, (state, action) => {
        state.loading = false;
        state.layers = state.layers.filter((l) => l.id !== action.payload);
        if (state.currentLayer?.id === action.payload) {
          state.currentLayer = null;
        }
      })
      .addCase(deleteLayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      });
  },
});

export const { setCurrentLayer, clearError, clearLayers } = layersSlice.actions;

export default layersSlice.reducer;
