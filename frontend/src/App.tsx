import { Routing } from "@/routes/routing";
import { AppRouter } from "@/core/providers/AppRouter";

export const App = () => {
  return (
    <AppRouter>
      <Routing />
    </AppRouter>
  );
};
