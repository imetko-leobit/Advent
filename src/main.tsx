import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./auth/auth-provider.tsx";
import { LoadingProvider } from "./context/LoadingContext.tsx";
import { assertValidConfig } from "./utils/configValidator";
import { logStartupInfo } from "./utils/logger";
import { questConfig } from "./config/quest.config";
import { isDevMode } from "./auth/authConfig";
import { getDataSourceType } from "./services/questDataServiceFactory";

// Validate configuration at startup
try {
  assertValidConfig(questConfig);
} catch (error) {
  // Show error to user and stop application
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h1 style="color: #d32f2f;">❌ Configuration Error</h1>
        <p style="color: #666;">The application configuration is invalid and cannot start.</p>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto;">${
          error instanceof Error ? error.message : String(error)
        }</pre>
        <p style="color: #666; margin-top: 20px;">
          Please check the configuration in <code>src/config/quest.config.ts</code> and fix the errors above.
        </p>
      </div>
    `;
  }
  throw error;
}

// Log startup information
logStartupInfo({
  mode: isDevMode() ? "DEV" : "PROD",
  dataProvider: getDataSourceType(),
  questName: questConfig.name,
  taskCount: questConfig.taskCount,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </AuthProvider>
  </React.StrictMode>
);
