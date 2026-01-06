/**
 * Configuration Fallback Handler
 * 
 * Handles configuration loading failures with graceful fallback to DEV mode
 * Ensures the application remains functional even with invalid configurations
 */

import { QuestConfig } from "../config/quest.config";
import { UIConfig } from "../config/uiConfig";
import { logger } from "./logger";
import { getDefaultQuestConfig, getDefaultUIConfig } from "./configLoader";

/**
 * Fallback mode types
 */
export type FallbackMode = "dev" | "production" | "none";

/**
 * Configuration fallback state
 */
export interface ConfigFallbackState {
  questConfig: QuestConfig;
  uiConfig: UIConfig;
  isFallback: boolean;
  fallbackMode: FallbackMode;
  errors: string[];
}

/**
 * Handle quest configuration failure with DEV mode fallback
 */
export function handleQuestConfigFailure(
  errors: string[],
  enableDevFallback: boolean = true
): ConfigFallbackState {
  const defaultQuestConfig = getDefaultQuestConfig();
  const defaultUIConfig = getDefaultUIConfig();

  if (!enableDevFallback) {
    logger.error(
      "ConfigFallback",
      "Quest config invalid and DEV fallback disabled",
      { errors }
    );
    
    return {
      questConfig: defaultQuestConfig,
      uiConfig: defaultUIConfig,
      isFallback: false,
      fallbackMode: "none",
      errors,
    };
  }

  logger.warn(
    "ConfigFallback",
    "Quest config invalid - falling back to DEV mode with default config",
    { errors }
  );

  // In DEV fallback mode, use default configurations
  return {
    questConfig: defaultQuestConfig,
    uiConfig: defaultUIConfig,
    isFallback: true,
    fallbackMode: "dev",
    errors,
  };
}

/**
 * Handle UI configuration failure with fallback
 */
export function handleUIConfigFailure(
  errors: string[],
  questConfig: QuestConfig,
  enableDevFallback: boolean = true
): ConfigFallbackState {
  const defaultUIConfig = getDefaultUIConfig();

  if (!enableDevFallback) {
    logger.error(
      "ConfigFallback",
      "UI config invalid and DEV fallback disabled",
      { errors }
    );
    
    return {
      questConfig,
      uiConfig: defaultUIConfig,
      isFallback: false,
      fallbackMode: "none",
      errors,
    };
  }

  logger.warn(
    "ConfigFallback",
    "UI config invalid - falling back to default UI config",
    { errors }
  );

  return {
    questConfig,
    uiConfig: defaultUIConfig,
    isFallback: true,
    fallbackMode: "dev",
    errors,
  };
}

/**
 * Format error messages for display
 * Returns a safe object that can be rendered by React components
 */
export interface FormattedConfigError {
  title: string;
  message: string;
  errors: string[];
  fallbackMode: FallbackMode;
  severity: "error" | "warning";
}

/**
 * Format configuration errors for display in React components
 */
export function formatConfigErrorForDisplay(
  errors: string[],
  fallbackMode: FallbackMode
): FormattedConfigError {
  if (fallbackMode === "dev") {
    return {
      title: "Configuration Warning",
      message: "The custom configuration could not be loaded. The application has fallen back to DEV mode with default settings.",
      errors,
      fallbackMode,
      severity: "warning",
    };
  }

  return {
    title: "Configuration Error",
    message: "The configuration is invalid and the application cannot start properly.",
    errors,
    fallbackMode,
    severity: "error",
  };
}
