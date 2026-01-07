/**
 * Configuration Context
 * 
 * Provides centralized access to quest and UI configurations
 * Enables runtime configuration changes without code modifications
 * Supports dynamic config loading and switching
 * Includes URL parameter and localStorage support
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
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
import { loadQuestConfig } from "../config/config.factory";
import { logger } from "../utils/logger";

/**
 * localStorage key for storing the last selected config
 */
const CONFIG_STORAGE_KEY = 'wellbeing-quest-config';

/**
 * Configuration context state
 */
interface ConfigContextState {
  questConfig: QuestConfig;
  uiConfig: UIConfig;
  isLoading: boolean;
  errors: string[];
  warnings: string[];
  currentConfigKey: string | null;
  
  // Actions
  loadQuestConfigFromJSON: (url: string) => Promise<ConfigLoadResult<QuestConfig>>;
  loadQuestConfigFromObject: (config: Partial<QuestConfig>) => ConfigLoadResult<QuestConfig>;
  loadUIConfigFromJSON: (url: string) => Promise<ConfigLoadResult<UIConfig>>;
  loadUIConfigFromObject: (config: Partial<UIConfig>) => ConfigLoadResult<UIConfig>;
  loadQuestConfigByKey: (key: string) => Promise<boolean>;
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
  const [currentConfigKey, setCurrentConfigKey] = useState<string | null>(null);

  /**
   * Load quest configuration from config-drops by key
   */
  const handleLoadQuestConfigByKey = useCallback(
    async (key: string): Promise<boolean> => {
      setIsLoading(true);
      setErrors([]);
      setWarnings([]);
      
      try {
        const config = await loadQuestConfig(key);
        setQuestConfig(config);
        setCurrentConfigKey(key);
        
        // Save to localStorage
        try {
          localStorage.setItem(CONFIG_STORAGE_KEY, key);
        } catch (e) {
          logger.warn("ConfigContext", "Failed to save config key to localStorage", e);
        }
        
        logger.info("ConfigContext", `Quest config '${key}' loaded successfully`);
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("ConfigContext", `Failed to load quest config '${key}'`, error);
        setErrors([errorMessage]);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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
    setCurrentConfigKey(null);
    setErrors([]);
    setWarnings([]);
    
    // Clear localStorage
    try {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
    } catch (e) {
      logger.warn("ConfigContext", "Failed to clear config key from localStorage", e);
    }
    
    logger.info("ConfigContext", "Reset to default configurations");
  }, []);

  /**
   * Load configuration from URL parameter or localStorage on mount
   */
  useEffect(() => {
    const loadInitialConfig = async () => {
      // Check URL parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const questParam = urlParams.get('quest');
      
      if (questParam) {
        logger.info("ConfigContext", `Loading config from URL parameter: ${questParam}`);
        await handleLoadQuestConfigByKey(questParam);
        return;
      }
      
      // Check localStorage
      try {
        const savedConfigKey = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (savedConfigKey) {
          logger.info("ConfigContext", `Loading config from localStorage: ${savedConfigKey}`);
          await handleLoadQuestConfigByKey(savedConfigKey);
        }
      } catch (e) {
        logger.warn("ConfigContext", "Failed to load config from localStorage", e);
      }
    };
    
    loadInitialConfig();
  }, [handleLoadQuestConfigByKey]);

  const value: ConfigContextState = {
    questConfig,
    uiConfig,
    isLoading,
    errors,
    warnings,
    currentConfigKey,
    loadQuestConfigFromJSON: handleLoadQuestConfigFromJSON,
    loadQuestConfigFromObject: handleLoadQuestConfigFromObject,
    loadUIConfigFromJSON: handleLoadUIConfigFromJSON,
    loadUIConfigFromObject: handleLoadUIConfigFromObject,
    loadQuestConfigByKey: handleLoadQuestConfigByKey,
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
