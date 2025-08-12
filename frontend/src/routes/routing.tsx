import { Project } from "@/components/ordinary";
import { ProjectsList } from "@/components/smart";
import { Routes, Route } from "react-router-dom";

export const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<ProjectsList />}>
        <Route path="/projects/:projectId" element={<Project />} />
      </Route>
    </Routes>
  );
};
