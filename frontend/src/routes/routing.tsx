import { ProjectsList } from "@/components/smart";
import { Routes, Route } from "react-router-dom";

export const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<ProjectsList />}>
        <Route path="/projects/:projectId" element={<h1>Project</h1>} />
      </Route>
    </Routes>
  );
};
