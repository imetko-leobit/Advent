import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { ConfigProvider } from "./context/ConfigContext";

export const App: React.FC = () => (
  <ErrorBoundary>
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  </ErrorBoundary>
);
