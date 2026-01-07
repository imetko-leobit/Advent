/**
 * UI Configuration Context
 * 
 * Provides UI configuration state to the entire application
 * Supports runtime UI config switching without page reload
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { logger } from "../utils/logger";
import {
  loadUIConfig,
  getUIConfigKey,
  setUIConfigKey,
  convertUIConfigJSON,
} from "../services/uiConfigLoader";
import { UIConfigJSON } from "../services/uiConfigSchema";

interface UIConfigContextType {
  uiConfig: ReturnType<typeof convertUIConfigJSON> | null;
  uiConfigRaw: UIConfigJSON | null;
  isLoading: boolean;
  error: string | null;
  configKey: string;
  switchConfig: (newConfigKey: string) => Promise<void>;
  reloadConfig: () => Promise<void>;
}

const UIConfigContext = createContext<UIConfigContextType | undefined>(undefined);

interface UIConfigProviderProps {
  children: ReactNode;
}

export const UIConfigProvider: React.FC<UIConfigProviderProps> = ({ children }) => {
  const [uiConfig, setUIConfig] = useState<ReturnType<typeof convertUIConfigJSON> | null>(null);
  const [uiConfigRaw, setUIConfigRaw] = useState<UIConfigJSON | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configKey, setConfigKey] = useState<string>(getUIConfigKey());

  const loadConfig = async (key: string) => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info("UIConfigContext", `Loading UI config: ${key}`);
      const result = await loadUIConfig(key);

      if (!result.isValid || !result.config) {
        const errorMsg = result.errors.join(", ") || "UI config is invalid";
        setError(errorMsg);
        logger.error("UIConfigContext", `Failed to load UI config: ${errorMsg}`);
        setIsLoading(false);
        return;
      }

      setUIConfigRaw(result.config);
      setUIConfig(convertUIConfigJSON(result.config));
      setConfigKey(key);
      setError(null);
      logger.info("UIConfigContext", `Successfully loaded UI config: ${key}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error loading UI config";
      setError(errorMsg);
      logger.error("UIConfigContext", `Error loading UI config: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const switchConfig = async (newConfigKey: string) => {
    logger.info("UIConfigContext", `Switching UI config to: ${newConfigKey}`);
    setUIConfigKey(newConfigKey, true);
    await loadConfig(newConfigKey);
  };

  const reloadConfig = async () => {
    logger.info("UIConfigContext", "Reloading current UI config");
    await loadConfig(configKey);
  };

  // Load initial config on mount
  useEffect(() => {
    loadConfig(configKey);
  }, []);

  const value: UIConfigContextType = {
    uiConfig,
    uiConfigRaw,
    isLoading,
    error,
    configKey,
    switchConfig,
    reloadConfig,
  };

  return (
    <UIConfigContext.Provider value={value}>
      {children}
    </UIConfigContext.Provider>
  );
};

/**
 * Hook to access UI config context
 */
export const useUIConfig = (): UIConfigContextType => {
  const context = useContext(UIConfigContext);
  if (context === undefined) {
    throw new Error("useUIConfig must be used within a UIConfigProvider");
  }
  return context;
};
