import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Project, Layer, History } from "@/core/types/interfaces/entities";

interface ApiData {
  projects: Project[];
  layers: Layer[];
  history: History[];
}

export const apiMock = createApi({
  reducerPath: "apiMock",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://mocki.io/v1",
  }),
  endpoints: (builder) => ({
    getMock: builder.query<ApiData, void>({
      query: () => "/ad6123bb-ad62-4cb0-a435-0f51f3441e31",
    }),
  }),
});

export const { useGetMockQuery } = apiMock;
