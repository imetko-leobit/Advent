/**
 * Configuration Factory
 * 
 * Provides functions to load quest configurations from various sources
 * Replaces TypeScript module imports with dynamic JSON loading
 */

import { QuestConfig } from './quest.config';
import { validateQuestConfigWithZod, validateQuestConfigManual } from '../services/configSchema';
import { logger } from '../utils/logger';

/**
 * Configuration cache to avoid repeated fetches
 */
const configCache = new Map<string, QuestConfig>();

/**
 * Clear the configuration cache
 */
export function clearConfigCache(): void {
  configCache.clear();
  logger.info('ConfigFactory', 'Configuration cache cleared');
}

/**
 * Load quest configuration from /config-drops/{key}.json
 * 
 * @param key - Configuration key (e.g., 'default', 'extreme')
 * @param useCache - Whether to use cached configuration (default: true)
 * @returns Promise resolving to the quest configuration
 * @throws Error if configuration cannot be loaded or is invalid
 */
export async function loadQuestConfig(
  key: string = 'default',
  useCache: boolean = true
): Promise<QuestConfig> {
  // Check cache first
  if (useCache && configCache.has(key)) {
    logger.info('ConfigFactory', `Loading config '${key}' from cache`);
    return configCache.get(key)!;
  }

  try {
    logger.info('ConfigFactory', `Loading quest config from /config-drops/${key}.json`);
    
    const res = await fetch(`/config-drops/${key}.json`);
    
    if (!res.ok) {
      throw new Error(`Config ${key} not found (HTTP ${res.status})`);
    }
    
    const data = await res.json();
    
    // Try Zod validation first
    const zodValidation = validateQuestConfigWithZod(data);
    
    if (zodValidation.success && zodValidation.data) {
      const config = zodValidation.data as QuestConfig;
      
      // Cache the successful configuration
      configCache.set(key, config);
      
      logger.info('ConfigFactory', `Successfully loaded and validated config '${key}'`);
      
      return config;
    }
    
    // If Zod validation fails, try manual validation as fallback
    logger.warn('ConfigFactory', 'Zod validation failed, trying manual validation', {
      errors: zodValidation.errors,
    });
    
    const manualValidation = validateQuestConfigManual(data);
    
    if (manualValidation.success && manualValidation.data) {
      const config = manualValidation.data as QuestConfig;
      
      // Cache the successful configuration
      configCache.set(key, config);
      
      logger.info('ConfigFactory', `Successfully loaded and validated config '${key}' with fallback`);
      
      return config;
    }
    
    // Both validations failed
    throw new Error(
      `Configuration validation failed:\n${[
        ...(zodValidation.errors || []),
        ...(manualValidation.errors || []),
      ].join('\n')}`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('ConfigFactory', `Failed to load config '${key}'`, error);
    
    throw new Error(`Failed to load quest configuration '${key}': ${errorMessage}`);
  }
}

/**
 * Preload a configuration into the cache
 * Useful for prefetching configurations before they're needed
 * 
 * @param key - Configuration key to preload
 */
export async function preloadQuestConfig(key: string): Promise<void> {
  try {
    await loadQuestConfig(key, false);
    logger.info('ConfigFactory', `Preloaded config '${key}'`);
  } catch (error) {
    logger.error('ConfigFactory', `Failed to preload config '${key}'`, error);
  }
}

/**
 * Get available configuration keys by attempting to list config-drops directory
 * Note: This is a best-effort function and may not work in all environments
 * 
 * @returns Promise resolving to array of available configuration keys
 */
export async function getAvailableConfigs(): Promise<string[]> {
  // Since we can't list directory contents in a browser,
  // we return a known list of configurations
  // In the future, this could be provided by a backend API
  return ['default', 'extreme'];
}

/**
 * Check if a configuration exists
 * 
 * @param key - Configuration key to check
 * @returns Promise resolving to true if configuration exists
 */
export async function configExists(key: string): Promise<boolean> {
  try {
    const res = await fetch(`/config-drops/${key}.json`, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}
