/**
 * UI Theme Discovery Service
 * 
 * Automatically discovers available UI theme configurations from /ui-configs
 * Uses Vite's import.meta.glob for dynamic file discovery
 */

import { logger } from "../utils/logger";

export interface UIThemeInfo {
  name: string;           // e.g., "default", "space-adventure"
  displayTitle: string;   // e.g., "Default Well Being Quest"
  path: string;          // e.g., "/ui-configs/default.json"
}

/**
 * Discovers all available UI themes from the ui-configs directory
 * Uses Vite's import.meta.glob to find all JSON files
 * 
 * @returns Array of discovered theme information
 */
export function discoverAvailableUIThemes(): UIThemeInfo[] {
  // Use Vite's import.meta.glob to discover all JSON files in ui-configs
  // The `eager: true` option loads them synchronously
  const configModules = import.meta.glob('/ui-configs/*.json', { eager: true, import: 'default' });
  
  const themes: UIThemeInfo[] = [];

  for (const [path, module] of Object.entries(configModules)) {
    try {
      // Extract the filename without extension
      const filename = path.split('/').pop()?.replace('.json', '') || '';
      
      // Skip README files
      if (filename.toLowerCase() === 'readme') {
        continue;
      }

      // Get display title from the loaded config
      const config = module as { name?: string };
      const displayTitle = config.name || filename;

      themes.push({
        name: filename,
        displayTitle,
        path: `/ui-configs/${filename}.json`,
      });

      logger.info("UIThemeDiscovery", `Discovered theme: ${filename} (${displayTitle})`);
    } catch (error) {
      logger.warn("UIThemeDiscovery", `Failed to process config at ${path}:`, error);
    }
  }

  // Sort themes alphabetically, but keep 'default' first
  themes.sort((a, b) => {
    if (a.name === 'default') return -1;
    if (b.name === 'default') return 1;
    return a.displayTitle.localeCompare(b.displayTitle);
  });

  logger.info("UIThemeDiscovery", `Discovered ${themes.length} UI themes`);

  return themes;
}

/**
 * Gets a specific theme by name
 */
export function getThemeByName(name: string, themes?: UIThemeInfo[]): UIThemeInfo | undefined {
  const availableThemes = themes || discoverAvailableUIThemes();
  return availableThemes.find(theme => theme.name === name);
}

/**
 * Validates if a theme name exists
 */
export function isValidThemeName(name: string, themes?: UIThemeInfo[]): boolean {
  const availableThemes = themes || discoverAvailableUIThemes();
  return availableThemes.some(theme => theme.name === name);
}
