import { type RouteObject, createBrowserRouter } from "react-router-dom";
import { Home, Editor } from "@/pages";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
    errorElement: <div>Ошибка загрузки главной страницы</div>,
  },
  {
    path: "/projects/:id",
    element: <Editor />,
    errorElement: <div>Проект не найден</div>,
  },
];

export const router = createBrowserRouter(routes);
