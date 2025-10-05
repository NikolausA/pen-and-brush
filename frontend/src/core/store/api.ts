import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Project, Layer, History } from "@/core/types/interfaces/entities";
import { setObjects } from "@/core/store/slices/graphicObjectSlice";
import type { GraphicObject } from "@/core/types/interfaces/igraphic-objects";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:1221/api",
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

    updateProject: builder.mutation<
      Project,
      { id: string; data: Partial<Project> }
    >({
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

    // LAYERS ================= (ИСПРАВЛЕНО)
    getLayers: builder.query<Layer[], string>({
      query: (projectId) => ({
        url: `/layers`,
        params: { projectId },
      }),
      // ИСПРАВЛЕНО: Правильные теги с ID проекта
      providesTags: (result, error, projectId) => [
        { type: "Layer", id: `PROJECT_${projectId}` },
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
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
          projectId,
        },
      }),
      // ИСПРАВЛЕНО: Инвалидируем кэш конкретного проекта
      invalidatesTags: (result, error, { projectId }) => [
        { type: "Layer", id: `PROJECT_${projectId}` },
      ],
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
          projectId,
        },
      }),
      // КРИТИЧНО: Оптимистическое обновление кэша
      async onQueryStarted(
        { layerId, projectId, data },
        { dispatch, queryFulfilled }
      ) {
        console.log(
          "🔄 [RTK Query] Starting optimistic update for layer:",
          layerId
        );

        // Оптимистически обновляем кэш
        const patchResult = dispatch(
          api.util.updateQueryData("getLayers", projectId, (draft) => {
            const layerIndex = draft.findIndex((l) => l.id === layerId);
            if (layerIndex !== -1) {
              // Обновляем данные слоя
              if (data.data !== undefined) {
                draft[layerIndex].data = data.data;
              }
              if (data.isVisible !== undefined) {
                draft[layerIndex].isVisible = data.isVisible;
              }
              if (data.opacity !== undefined) {
                draft[layerIndex].opacity = data.opacity;
              }
              if (data.name !== undefined) {
                draft[layerIndex].name = data.name;
              }
              if (data.order !== undefined) {
                draft[layerIndex].order = data.order;
              }
              console.log("✅ [RTK Query] Cache updated optimistically");
            } else {
              console.warn("⚠️ [RTK Query] Layer not found in cache:", layerId);
            }
          })
        );

        try {
          const result = await queryFulfilled;
          console.log("✅ [RTK Query] Server confirmed update:", result);

          // Дополнительно обновляем Redux store для синхронизации
          if (result.data.data && Array.isArray(result.data.data)) {
            dispatch(setObjects(result.data.data as GraphicObject[]));
          }
        } catch (error) {
          console.error("❌ [RTK Query] Update failed, rolling back:", error);
          patchResult.undo();
        }
      },
      // ИСПРАВЛЕНО: Инвалидируем кэш конкретного проекта
      invalidatesTags: (result, error, { projectId }) => [
        { type: "Layer", id: `PROJECT_${projectId}` },
      ],
    }),

    deleteLayer: builder.mutation<
      { message: string },
      { layerId: string; projectId: string }
    >({
      query: ({ layerId, projectId }) => ({
        url: `/layers/${layerId}`,
        method: "DELETE",
        body: { projectId },
      }),
      // ИСПРАВЛЕНО: Инвалидируем кэш конкретного проекта
      invalidatesTags: (result, error, { projectId }) => [
        { type: "Layer", id: `PROJECT_${projectId}` },
      ],
    }),

    // HISTORY =================
    // Фрагмент из api.ts - только история и связанные endpoints

    // HISTORY =================
    getHistory: builder.query<History[], string>({
      query: (projectId) => ({
        url: `/history`,
        params: { projectId },
      }),
      providesTags: (result, error, projectId) => [
        { type: "History", id: `PROJECT_${projectId}` },
      ],
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
          // ✅ ИСПРАВЛЕНО: data как объект { layers: [...] } для JSONB бэкенда
          data: data.data || { layers: [] },
          layerId: data.layerId || null,
        },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "History", id: `PROJECT_${projectId}` },
      ],
    }),

    deleteHistory: builder.mutation<
      { message: string },
      { historyId: string; projectId: string }
    >({
      query: ({ historyId, projectId }) => ({
        url: `/history/${historyId}`,
        method: "DELETE",
        body: { projectId },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "History", id: `PROJECT_${projectId}` },
      ],
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
  useDeleteHistoryMutation,
} = api;
