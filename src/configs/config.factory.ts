/**
 * Quest Configuration Factory
 * 
 * Dynamic configuration loader that supports multiple quest themes
 * Enables runtime switching between different quest configurations
 */

import { QuestConfig } from "../config/quest.config";
import { logger } from "../utils/logger";

/**
 * Available quest configuration types
 */
export type QuestConfigType = "default" | "extreme";

/**
 * Configuration factory map
 * Maps config type to dynamic import function
 * All config modules should export a QuestConfig as default
 */
const configFactoryMap: Record<QuestConfigType, () => Promise<{ default: QuestConfig }>> = {
  default: () => import("./quest-default"),
  extreme: () => import("./quest-extreme"),
};

/**
 * Load a quest configuration by type
 * 
 * @param type - The quest configuration type to load
 * @returns Promise that resolves to the quest configuration
 */
export async function loadQuestConfig(type: QuestConfigType): Promise<QuestConfig> {
  try {
    logger.info("ConfigFactory", `Loading quest config: ${type}`);
    
    const factory = configFactoryMap[type];
    
    if (!factory) {
      throw new Error(`Unknown quest config type: ${type}`);
    }
    
    const module = await factory();
    const config = module.default;
    
    if (!config) {
      throw new Error(`Config module for "${type}" did not export a default configuration`);
    }
    
    logger.info("ConfigFactory", `Successfully loaded ${type} quest config`);
    
    return config;
  } catch (error) {
    logger.error("ConfigFactory", `Failed to load quest config: ${type}`, error);
    throw error;
  }
}

/**
 * Get list of available quest configuration types
 * 
 * @returns Array of available quest config types
 */
export function getAvailableQuestConfigs(): QuestConfigType[] {
  return Object.keys(configFactoryMap) as QuestConfigType[];
}

/**
 * Check if a quest configuration type is valid
 * 
 * @param type - The type to check
 * @returns True if the type is valid
 */
export function isValidQuestConfigType(type: string): type is QuestConfigType {
  return type in configFactoryMap;
}
