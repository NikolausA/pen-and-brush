import { useGetMockQuery } from "@/core/store/api-mock";

export const MockProjects = () => {
  const { data, isLoading, error } = useGetMockQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading mock data</div>;

  return (
    <div>
      <h3>Projects</h3>
      <pre>{JSON.stringify(data.projects, null, 2)}</pre>
      <h3>Layers</h3>
      <pre>{JSON.stringify(data.layers, null, 2)}</pre>
      <h3>History</h3>
      <pre>{JSON.stringify(data.history, null, 2)}</pre>
    </div>
  );
};
