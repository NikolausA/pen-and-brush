import { type RouteObject, createBrowserRouter } from 'react-router';

import { Dashboard } from '@/pages/dashboard/dashboard';

export const routes: RouteObject[] = [ 
  {
    path: '/dashboard',
    element: <Dashboard/>,
  }
];

export const router = createBrowserRouter(routes);