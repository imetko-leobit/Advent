/**
 * Configuration Context
 * 
 * Provides centralized access to quest and UI configurations
 * Enables runtime configuration changes without code modifications
 * Supports dynamic config loading and switching
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { QuestConfig } from "../config/quest.config";
import { UIConfig } from "../config/uiConfig";
import {
  loadQuestConfigFromJSON,
  loadQuestConfigFromObject,
  loadUIConfigFromJSON,
  loadUIConfigFromObject,
  getDefaultQuestConfig,
  getDefaultUIConfig,
  ConfigLoadResult,
} from "../utils/configLoader";
import { logger } from "../utils/logger";

/**
 * Configuration context state
 */
interface ConfigContextState {
  questConfig: QuestConfig;
  uiConfig: UIConfig;
  isLoading: boolean;
  errors: string[];
  warnings: string[];
  
  // Actions
  loadQuestConfigFromJSON: (url: string) => Promise<ConfigLoadResult<QuestConfig>>;
  loadQuestConfigFromObject: (config: Partial<QuestConfig>) => ConfigLoadResult<QuestConfig>;
  loadUIConfigFromJSON: (url: string) => Promise<ConfigLoadResult<UIConfig>>;
  loadUIConfigFromObject: (config: Partial<UIConfig>) => ConfigLoadResult<UIConfig>;
  resetToDefaults: () => void;
}

/**
 * Configuration context
 */
const ConfigContext = createContext<ConfigContextState | undefined>(undefined);

/**
 * Configuration provider props
 */
interface ConfigProviderProps {
  children: ReactNode;
  initialQuestConfig?: QuestConfig;
  initialUIConfig?: UIConfig;
}

/**
 * Configuration provider component
 */
export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  children,
  initialQuestConfig,
  initialUIConfig,
}) => {
  const [questConfig, setQuestConfig] = useState<QuestConfig>(
    initialQuestConfig || getDefaultQuestConfig()
  );
  const [uiConfig, setUIConfig] = useState<UIConfig>(
    initialUIConfig || getDefaultUIConfig()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  /**
   * Load quest configuration from JSON file
   */
  const handleLoadQuestConfigFromJSON = useCallback(
    async (url: string): Promise<ConfigLoadResult<QuestConfig>> => {
      setIsLoading(true);
      setErrors([]);
      setWarnings([]);
      
      try {
        const result = await loadQuestConfigFromJSON(url);
        
        if (result.isValid) {
          setQuestConfig(result.config);
          logger.info("ConfigContext", "Quest config loaded from JSON successfully");
        } else {
          logger.error("ConfigContext", "Failed to load quest config from JSON", {
            errors: result.errors,
          });
        }
        
        setErrors(result.errors);
        setWarnings(result.warnings);
        
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Load quest configuration from custom object
   */
  const handleLoadQuestConfigFromObject = useCallback(
    (config: Partial<QuestConfig>): ConfigLoadResult<QuestConfig> => {
      setErrors([]);
      setWarnings([]);
      
      const result = loadQuestConfigFromObject(config);
      
      if (result.isValid) {
        setQuestConfig(result.config);
        logger.info("ConfigContext", "Quest config loaded from object successfully");
      } else {
        logger.error("ConfigContext", "Failed to load quest config from object", {
          errors: result.errors,
        });
      }
      
      setErrors(result.errors);
      setWarnings(result.warnings);
      
      return result;
    },
    []
  );

  /**
   * Load UI configuration from JSON file
   */
  const handleLoadUIConfigFromJSON = useCallback(
    async (url: string): Promise<ConfigLoadResult<UIConfig>> => {
      setIsLoading(true);
      setErrors([]);
      setWarnings([]);
      
      try {
        const result = await loadUIConfigFromJSON(url);
        
        if (result.isValid) {
          setUIConfig(result.config);
          logger.info("ConfigContext", "UI config loaded from JSON successfully");
        } else {
          logger.error("ConfigContext", "Failed to load UI config from JSON", {
            errors: result.errors,
          });
        }
        
        setErrors(result.errors);
        setWarnings(result.warnings);
        
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Load UI configuration from custom object
   */
  const handleLoadUIConfigFromObject = useCallback(
    (config: Partial<UIConfig>): ConfigLoadResult<UIConfig> => {
      setErrors([]);
      setWarnings([]);
      
      const result = loadUIConfigFromObject(config);
      
      if (result.isValid) {
        setUIConfig(result.config);
        logger.info("ConfigContext", "UI config loaded from object successfully");
      } else {
        logger.error("ConfigContext", "Failed to load UI config from object", {
          errors: result.errors,
        });
      }
      
      setErrors(result.errors);
      setWarnings(result.warnings);
      
      return result;
    },
    []
  );

  /**
   * Reset configurations to defaults
   */
  const resetToDefaults = useCallback(() => {
    setQuestConfig(getDefaultQuestConfig());
    setUIConfig(getDefaultUIConfig());
    setErrors([]);
    setWarnings([]);
    logger.info("ConfigContext", "Reset to default configurations");
  }, []);

  const value: ConfigContextState = {
    questConfig,
    uiConfig,
    isLoading,
    errors,
    warnings,
    loadQuestConfigFromJSON: handleLoadQuestConfigFromJSON,
    loadQuestConfigFromObject: handleLoadQuestConfigFromObject,
    loadUIConfigFromJSON: handleLoadUIConfigFromJSON,
    loadUIConfigFromObject: handleLoadUIConfigFromObject,
    resetToDefaults,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

/**
 * Hook to use configuration context
 * 
 * @returns ConfigContextState
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useConfig = (): ConfigContextState => {
  const context = useContext(ConfigContext);
  
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  
  return context;
};
