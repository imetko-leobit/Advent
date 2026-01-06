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
 * Display user-friendly error message for configuration failures
 */
export function displayConfigErrorMessage(
  errors: string[],
  fallbackMode: FallbackMode
): void {
  const root = document.getElementById("config-error-container");
  
  if (!root) {
    // If container doesn't exist, log to console
    console.error("[ConfigFallback] Configuration errors:", errors);
    return;
  }

  const errorList = errors.map((error) => `<li>${error}</li>`).join("");
  
  const message = fallbackMode === "dev"
    ? `
      <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 15px; margin: 20px; font-family: sans-serif;">
        <h3 style="color: #856404; margin-top: 0;">⚠️ Configuration Warning</h3>
        <p style="color: #856404;">
          The custom configuration could not be loaded. The application has fallen back to DEV mode with default settings.
        </p>
        <details style="margin-top: 10px;">
          <summary style="cursor: pointer; color: #856404; font-weight: bold;">View Errors</summary>
          <ul style="color: #856404; margin-top: 10px;">
            ${errorList}
          </ul>
        </details>
        <p style="color: #856404; margin-top: 10px; font-size: 0.9em;">
          The application is running with default configuration. All features should work normally.
        </p>
      </div>
    `
    : `
      <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 15px; margin: 20px; font-family: sans-serif;">
        <h3 style="color: #721c24; margin-top: 0;">❌ Configuration Error</h3>
        <p style="color: #721c24;">
          The configuration is invalid and the application cannot start properly.
        </p>
        <ul style="color: #721c24;">
          ${errorList}
        </ul>
        <p style="color: #721c24; margin-top: 10px;">
          Please fix the configuration errors or enable DEV mode fallback.
        </p>
      </div>
    `;

  root.innerHTML = message;
}

/**
 * Clear configuration error message
 */
export function clearConfigErrorMessage(): void {
  const root = document.getElementById("config-error-container");
  
  if (root) {
    root.innerHTML = "";
  }
}
