import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://' }),
  endpoints: (builder) => ({
    getPosts: builder.query<string[], void>({
      query: () => 'posts'
    })
  })
})

export const { useGetPostsQuery } = api
