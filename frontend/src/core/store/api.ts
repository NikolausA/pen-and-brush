import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Project, Layer, History } from "@/core/types/interfaces/entities";
import { setObjects } from "@/core/store/slices/graphicObjectSlice";
import type { GraphicObject } from "@/core/types/interfaces/igraphic-objects";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "http://localhost:1221/api" // Исправлен порт с 1441 на 1221
  }),
  tagTypes: ["Project", "Layer", "History"],
  endpoints: (builder) => ({
    // PROJECTS =================
    getProjects: builder.query<Project[], void>({
      query: () => "/projects",
      providesTags: ["Project"],
    }),
    
    getProjectById: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: "Project", id }],
    }),
    
    createProject: builder.mutation<Project, Partial<Project>>({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Project"],
    }),
    
    updateProject: builder.mutation<Project, { id: string; data: Partial<Project> }>({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Project", id }],
    }),
    
    deleteProject: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),

    // LAYERS ================= (НОВАЯ СТРУКТУРА)
    getLayers: builder.query<Layer[], string>({
      query: (projectId) => ({
        url: `/layers`,
        params: { projectId } // Используем query параметры
      }),
      providesTags: ["Layer"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Собираем все graphicObjects из layer.data
          const objects: GraphicObject[] = [];
          for (const layer of data) {
            if (Array.isArray(layer.data)) {
              objects.push(...(layer.data as GraphicObject[]));
            }
          }
          dispatch(setObjects(objects));
        } catch {
          // ignore error
        }
      },
    }),
    
    createLayer: builder.mutation<
      Layer,
      { projectId: string; data: Partial<Layer> }
    >({
      query: ({ projectId, data }) => ({
        url: `/layers`,
        method: "POST",
        body: {
          ...data,
          projectId // projectId теперь в body
        },
      }),
      invalidatesTags: ["Layer"],
    }),
    
    updateLayer: builder.mutation<
      Layer, 
      { layerId: string; projectId: string; data: Partial<Layer> }
    >({
      query: ({ layerId, projectId, data }) => ({
        url: `/layers/${layerId}`,
        method: "PATCH",
        body: {
          ...data,
          projectId // projectId обязательно в body
        },
      }),
      invalidatesTags: (result, error, { layerId }) => [{ type: "Layer", id: layerId }],
    }),
    
    deleteLayer: builder.mutation<
      { message: string }, 
      { layerId: string; projectId: string }
    >({
      query: ({ layerId, projectId }) => ({
        url: `/layers/${layerId}`,
        method: "DELETE",
        body: { projectId } // projectId в body для DELETE
      }),
      invalidatesTags: ["Layer"],
    }),

    // HISTORY ================= (теперь полностью функциональный)
    getHistory: builder.query<History[], string>({
      query: (projectId) => ({
        url: `/history`,
        params: { projectId }
      }),
      providesTags: ["History"],
    }),
    
    addHistory: builder.mutation<
      History,
      { projectId: string; data: Partial<History> }
    >({
      query: ({ projectId, data }) => ({
        url: `/history`,
        method: "POST",
        body: {
          projectId,
          action: data.action,
          data: data.data || {},
          layerId: data.layerId || null
        },
      }),
      invalidatesTags: ["History"],
    }),
    
    deleteHistory: builder.mutation<
      { message: string }, 
      { historyId: string; projectId: string }
    >({
      query: ({ historyId, projectId }) => ({
        url: `/history/${historyId}`,
        method: "DELETE",
        body: { projectId }
      }),
      invalidatesTags: ["History"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetLayersQuery,
  useCreateLayerMutation,
  useUpdateLayerMutation,
  useDeleteLayerMutation,
  useGetHistoryQuery,
  useAddHistoryMutation,
  useDeleteHistoryMutation, // Добавлен новый хук
} = api;