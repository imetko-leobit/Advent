/**
 * UI Configuration Loader Service
 * 
 * Handles loading UI configurations from JSON files
 * Provides validation, error handling, and fallback to default config
 */

import { logger } from "../utils/logger";
import {
  UIConfigJSON,
  validateUIConfig,
  logValidationResults,
} from "./uiConfigSchema";

/**
 * Result of UI config loading
 */
export interface UIConfigLoadResult {
  config: UIConfigJSON | null;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  source: "file" | "default" | "error";
}

/**
 * Loads a UI configuration by config key
 * 
 * @param configKey - The name of the config (e.g., "default", "winter")
 * @returns Promise resolving to load result
 */
export async function loadUIConfig(configKey: string): Promise<UIConfigLoadResult> {
  try {
    const configUrl = `/ui-configs/${configKey}.json`;
    logger.info("UIConfigLoader", `Loading UI config from: ${configUrl}`);

    const response = await fetch(configUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const jsonData = await response.json();
    const validation = validateUIConfig(jsonData);
    
    logValidationResults(validation, configKey);

    if (!validation.isValid) {
      logger.error("UIConfigLoader", `Loaded config "${configKey}" is invalid, falling back to default`);
      
      // Try to load default config as fallback
      if (configKey !== "default") {
        return await loadDefaultUIConfig();
      }

      return {
        config: null,
        isValid: false,
        errors: validation.errors.map((e) => e.message),
        warnings: validation.warnings.map((w) => w.message),
        source: "error",
      };
    }

    logger.info("UIConfigLoader", `Successfully loaded UI config: ${configKey}`);

    return {
      config: jsonData as UIConfigJSON,
      isValid: true,
      errors: [],
      warnings: validation.warnings.map((w) => w.message),
      source: "file",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("UIConfigLoader", `Failed to load UI config "${configKey}": ${errorMessage}`);

    // Try to load default config as fallback
    if (configKey !== "default") {
      logger.info("UIConfigLoader", "Attempting to load default config as fallback");
      return await loadDefaultUIConfig();
    }

    return {
      config: null,
      isValid: false,
      errors: [`Failed to load config: ${errorMessage}`],
      warnings: [],
      source: "error",
    };
  }
}

/**
 * Loads the default UI configuration
 */
export async function loadDefaultUIConfig(): Promise<UIConfigLoadResult> {
  return await loadUIConfig("default");
}

/**
 * Gets the UI config key from URL params or localStorage
 * 
 * Priority:
 * 1. URL query parameter (?ui=winter)
 * 2. localStorage (key: "uiConfig")
 * 3. Default ("default")
 */
export function getUIConfigKey(): string {
  // Check URL params
  const urlParams = new URLSearchParams(window.location.search);
  const urlConfigKey = urlParams.get("ui");
  
  if (urlConfigKey) {
    logger.info("UIConfigLoader", `UI config key from URL: ${urlConfigKey}`);
    // Save to localStorage for persistence
    localStorage.setItem("uiConfig", urlConfigKey);
    return urlConfigKey;
  }

  // Check localStorage
  const storedConfigKey = localStorage.getItem("uiConfig");
  if (storedConfigKey) {
    logger.info("UIConfigLoader", `UI config key from localStorage: ${storedConfigKey}`);
    return storedConfigKey;
  }

  // Default
  logger.info("UIConfigLoader", "Using default UI config key");
  return "default";
}

/**
 * Sets the UI config key in localStorage and optionally updates URL
 * 
 * @param configKey - The config key to set
 * @param updateUrl - Whether to update the URL query parameter
 */
export function setUIConfigKey(configKey: string, updateUrl: boolean = false): void {
  localStorage.setItem("uiConfig", configKey);
  logger.info("UIConfigLoader", `Set UI config key to: ${configKey}`);

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("ui", configKey);
    window.history.replaceState({}, "", url.toString());
    logger.info("UIConfigLoader", `Updated URL with UI config key: ${configKey}`);
  }
}

/**
 * Converts a loaded UI config JSON to the internal UIConfig format
 * This handles asset path resolution and format conversion
 */
export function convertUIConfigJSON(json: UIConfigJSON) {
  // Import assets dynamically based on paths
  // For now, we'll use the paths directly as Vite handles them
  
  return {
    name: json.name,
    map: {
      background: json.map.background,
      mapSvg: json.map.mapSvg,
      width: json.map.width || "100%",
      height: json.map.height || "100%",
    },
    steps: {
      images: json.steps.map((step) => step.icon),
      positions: json.steps.map((step) => ({
        taskNumber: step.taskNumber,
        cxPointers: step.cxPointers,
        cyPointers: step.cyPointers,
        cxStep: step.cxStep,
        cyStep: step.cyStep,
      })),
      shadow: {
        green: json.theme.stepShadow.green,
        purple: json.theme.stepShadow.purple,
        greenThreshold: json.theme.stepShadow.greenThreshold,
      },
    },
    theme: {
      palette: json.theme.palette,
    },
    pointers: {
      maxVisibleInTooltip: json.theme.pointerStyle.maxVisibleInTooltip,
      maxBeforeModal: json.theme.pointerStyle.maxBeforeModal,
      colors: json.theme.pointerStyle.colors,
    },
    animations: json.animations || {
      stars: [],
      clouds: [],
      character: null,
    },
    finishScreens: json.finishScreens,
  };
}
