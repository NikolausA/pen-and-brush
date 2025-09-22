import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Project, Layer } from "@/core/types/interfaces/entities";
import { setObjects } from "@/core/store/slices/graphicObjectSlice";
import type { GraphicObject } from "@/core/types/interfaces/igraphic-objects";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:1221/api" }),
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
    deleteProject: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),

    // LAYERS =================
    getLayers: builder.query<Layer[], string>({
      query: (projectId) => `/projects/${projectId}/layers`,
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
          // ignore
        }
      },
    }),
    createLayer: builder.mutation<
      Layer,
      { projectId: string; data: Partial<Layer> }
    >({
      query: ({ projectId, data }) => ({
        url: `/projects/${projectId}/layers`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Layer"],
    }),
    updateLayer: builder.mutation<Layer, { id: string; data: Partial<Layer> }>({
      query: ({ id, data }) => ({
        url: `/layers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Layer", id }],
    }),
    deleteLayer: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/layers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Layer"],
    }),

    // HISTORY =================
    getHistory: builder.query<History[], string>({
      query: (projectId) => `/projects/${projectId}/history`,
      providesTags: ["History"],
    }),
    addHistory: builder.mutation<
      History,
      { projectId: string; data: Partial<History> }
    >({
      query: ({ projectId, data }) => ({
        url: `/projects/${projectId}/history`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["History"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetLayersQuery,
  useCreateLayerMutation,
  useUpdateLayerMutation,
  useDeleteLayerMutation,
  useGetHistoryQuery,
  useAddHistoryMutation,
} = api;
