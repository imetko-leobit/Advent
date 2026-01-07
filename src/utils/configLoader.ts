/**
 * Dynamic Configuration Loader
 * 
 * Enables loading quest configurations dynamically at runtime
 * Supports both TypeScript config objects and JSON files
 * Provides validation, defaults, and error handling
 */

import { QuestConfig, questConfig as defaultQuestConfig } from "../config/quest.config";
import { UIConfig, uiConfig as defaultUIConfig } from "../config/uiConfig";
import { validateQuestConfig } from "./configValidator";
import { validateQuestConfigWithZod, validateQuestConfigManual } from "../services/configSchema";
import { logger } from "./logger";

/**
 * Configuration source type
 */
export type ConfigSource = "default" | "custom" | "file";

/**
 * Result of configuration loading
 */
export interface ConfigLoadResult<T> {
  config: T;
  source: ConfigSource;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Deep merge two objects, with source overwriting target
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        // Recursively merge objects
        result[key] = deepMerge(
          targetValue || {} as T[Extract<keyof T, string>],
          sourceValue as Partial<T[Extract<keyof T, string>]>
        );
      } else {
        // Overwrite primitives and arrays
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }
  
  return result;
}

/**
 * Apply default values to a partial quest configuration
 */
export function applyQuestConfigDefaults(partialConfig: Partial<QuestConfig>): QuestConfig {
  const merged = deepMerge(defaultQuestConfig, partialConfig);
  
  logger.info("ConfigLoader", "Applied defaults to quest configuration");
  
  return merged;
}

/**
 * Apply default values to a partial UI configuration
 */
export function applyUIConfigDefaults(partialConfig: Partial<UIConfig>): UIConfig {
  const merged = deepMerge(defaultUIConfig, partialConfig);
  
  logger.info("ConfigLoader", "Applied defaults to UI configuration");
  
  return merged;
}

/**
 * Load quest configuration from a JSON file URL
 * Now with Zod validation support
 */
export async function loadQuestConfigFromJSON(url: string): Promise<ConfigLoadResult<QuestConfig>> {
  try {
    logger.info("ConfigLoader", `Loading quest config from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const jsonData = await response.json();
    
    // Try Zod validation first
    const zodValidation = validateQuestConfigWithZod(jsonData);
    
    if (zodValidation.success && zodValidation.data) {
      const config = applyQuestConfigDefaults(zodValidation.data as Partial<QuestConfig>);
      const legacyValidation = validateQuestConfig(config);
      
      logger.info("ConfigLoader", "Successfully loaded and validated quest config from JSON with Zod");
      
      return {
        config,
        source: "file",
        isValid: true,
        errors: [],
        warnings: legacyValidation.warnings.map(w => w.message),
      };
    }
    
    // Fallback to manual validation
    logger.warn("ConfigLoader", "Zod validation failed, trying manual validation");
    
    const manualValidation = validateQuestConfigManual(jsonData);
    
    if (manualValidation.success && manualValidation.data) {
      const config = applyQuestConfigDefaults(manualValidation.data as Partial<QuestConfig>);
      const legacyValidation = validateQuestConfig(config);
      
      if (!legacyValidation.isValid) {
        logger.error("ConfigLoader", "Loaded config is invalid", { errors: legacyValidation.errors });
        return {
          config: defaultQuestConfig,
          source: "default",
          isValid: false,
          errors: legacyValidation.errors.map(e => e.message),
          warnings: legacyValidation.warnings.map(w => w.message),
        };
      }
      
      logger.info("ConfigLoader", "Successfully loaded and validated quest config from JSON with manual validation");
      
      return {
        config,
        source: "file",
        isValid: true,
        errors: [],
        warnings: legacyValidation.warnings.map(w => w.message),
      };
    }
    
    // Both validations failed
    const allErrors = [
      ...(zodValidation.errors || []),
      ...(manualValidation.errors || []),
    ];
    
    logger.error("ConfigLoader", "All validations failed", { errors: allErrors });
    
    return {
      config: defaultQuestConfig,
      source: "default",
      isValid: false,
      errors: allErrors,
      warnings: [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("ConfigLoader", `Failed to load quest config from ${url}`, error);
    
    return {
      config: defaultQuestConfig,
      source: "default",
      isValid: false,
      errors: [`Failed to load config: ${errorMessage}`],
      warnings: [],
    };
  }
}

/**
 * Load quest configuration from a custom config object
 */
export function loadQuestConfigFromObject(customConfig: Partial<QuestConfig>): ConfigLoadResult<QuestConfig> {
  try {
    logger.info("ConfigLoader", "Loading quest config from custom object");
    
    const config = applyQuestConfigDefaults(customConfig);
    const validation = validateQuestConfig(config);
    
    if (!validation.isValid) {
      logger.error("ConfigLoader", "Custom config is invalid", { errors: validation.errors });
      return {
        config: defaultQuestConfig,
        source: "default",
        isValid: false,
        errors: validation.errors.map(e => e.message),
        warnings: validation.warnings.map(w => w.message),
      };
    }
    
    logger.info("ConfigLoader", "Successfully loaded and validated custom quest config");
    
    return {
      config,
      source: "custom",
      isValid: true,
      errors: [],
      warnings: validation.warnings.map(w => w.message),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("ConfigLoader", "Failed to load custom quest config", error);
    
    return {
      config: defaultQuestConfig,
      source: "default",
      isValid: false,
      errors: [`Failed to load config: ${errorMessage}`],
      warnings: [],
    };
  }
}

/**
 * Load UI configuration from a JSON file URL
 */
export async function loadUIConfigFromJSON(url: string): Promise<ConfigLoadResult<UIConfig>> {
  try {
    logger.info("ConfigLoader", `Loading UI config from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const jsonData = await response.json();
    const config = applyUIConfigDefaults(jsonData);
    
    logger.info("ConfigLoader", "Successfully loaded UI config from JSON");
    
    return {
      config,
      source: "file",
      isValid: true,
      errors: [],
      warnings: [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("ConfigLoader", `Failed to load UI config from ${url}`, error);
    
    return {
      config: defaultUIConfig,
      source: "default",
      isValid: false,
      errors: [`Failed to load config: ${errorMessage}`],
      warnings: [],
    };
  }
}

/**
 * Load UI configuration from a custom config object
 */
export function loadUIConfigFromObject(customConfig: Partial<UIConfig>): ConfigLoadResult<UIConfig> {
  try {
    logger.info("ConfigLoader", "Loading UI config from custom object");
    
    const config = applyUIConfigDefaults(customConfig);
    
    logger.info("ConfigLoader", "Successfully loaded custom UI config");
    
    return {
      config,
      source: "custom",
      isValid: true,
      errors: [],
      warnings: [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("ConfigLoader", "Failed to load custom UI config", error);
    
    return {
      config: defaultUIConfig,
      source: "default",
      isValid: false,
      errors: [`Failed to load config: ${errorMessage}`],
      warnings: [],
    };
  }
}

/**
 * Get the default quest configuration
 */
export function getDefaultQuestConfig(): QuestConfig {
  return defaultQuestConfig;
}

/**
 * Get the default UI configuration
 */
export function getDefaultUIConfig(): UIConfig {
  return defaultUIConfig;
}
