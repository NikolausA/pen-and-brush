import { type RouteObject, createBrowserRouter } from 'react-router';

import { Home } from '@/pages';

export const routes: RouteObject[] = [ 
  {
    path: '/',
    element: <Home/>,
  }
];

export const router = createBrowserRouter(routes);