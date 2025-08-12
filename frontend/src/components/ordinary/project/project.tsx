import { useParams } from "react-router-dom";

export const Project = () => {
  const { projectId } = useParams();
  return <div>Project {projectId}</div>;
};
