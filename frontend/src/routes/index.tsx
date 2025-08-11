import { RouterProvider } from "react-router/dom";

import { router } from "@/core/config/routes-config";


export const AppRouter = () => <RouterProvider router={router}/>;