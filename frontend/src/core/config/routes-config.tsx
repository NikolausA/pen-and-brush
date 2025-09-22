import { type RouteObject, createBrowserRouter } from "react-router-dom";
import { Home, EditorPage, TempEditorPage, } from "@/pages";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
    errorElement: <div>Ошибка загрузки главной страницы</div>,
  },
  {
    path: "/projects/:projectId",
    element: <EditorPage />,
    errorElement: <div>Проект не найден</div>,
  },
  {
    path: "/temp-page",
    element: <TempEditorPage />,
    errorElement: <div>Проект не найден</div>,
  },
];

export const router = createBrowserRouter(routes);
