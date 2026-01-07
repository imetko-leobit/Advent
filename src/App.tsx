import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { ConfigProvider } from "./context/ConfigContext";
import { UIConfigProvider } from "./context/UIConfigContext";

export const App: React.FC = () => (
  <ErrorBoundary>
    <UIConfigProvider>
      <ConfigProvider>
        <RouterProvider router={router} />
      </ConfigProvider>
    </UIConfigProvider>
  </ErrorBoundary>
);
