import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { config } from '@/core/config/config'

interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  createdAt?: string;
  updatedAt?: string;
  layers?: Layer[];
}

interface Layer {
  id: string;
  projectId: string;
  name: string;
  order: number;
  isVisible?: boolean;
  opacity?: number;
  data?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

export const getProjects = createAsyncThunk<Project[], void, { rejectValue: string }>(
  'projects/getProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${config.url}/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const text = await response.text(); 
      console.log('Fetch Response:', response.status, text);
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
      }
      const data: Project[] = JSON.parse(text); 
      return data;
    } catch (error) {
      console.error('Fetch Error:', error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createProject = createAsyncThunk<
  Project,
  Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
  { rejectValue: string }
>('projects/createProject', async (newProject, { rejectWithValue }) => {
  try {
    const response = await fetch(`${config.url}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProject),
    });
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    const data: Project = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const updateProject = createAsyncThunk<
  Project,
  { projectId: string; updatedProject: Partial<Project> & { layers?: Layer[] } },
  { rejectValue: string }
>('projects/updateProject', async ({ projectId, updatedProject }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${config.url}/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProject),
    });
    if (!response.ok) {
      throw new Error('Failed to update project');
    }
    const data: Project = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const deleteProject = createAsyncThunk<string, string, { rejectValue: string }>(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${config.url}/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      return projectId;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      })
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
        state.currentProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      })
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      })
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter((p) => p.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      });
  },
});

export const { setCurrentProject, clearError } = projectsSlice.actions;
export default projectsSlice.reducer;