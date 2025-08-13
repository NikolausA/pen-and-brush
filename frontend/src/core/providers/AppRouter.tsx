import { type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";

interface AppRouterProps {
  children: ReactNode;
}

export const AppRouter = ({ children }: AppRouterProps) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};
