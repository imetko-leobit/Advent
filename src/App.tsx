import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export const App: React.FC = () => (
  <>
    <RouterProvider router={router} />
  </>
);
