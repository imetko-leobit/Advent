/**
 * Quest Configuration
 * 
 * This file contains all configurable values for the Well Being Quest application.
 * Changing values here affects the behavior of the entire quest system.
 */

/**
 * Quest Structure Configuration
 */
export const QUEST_CONFIG = {
  /**
   * Total number of tasks in the quest (0-14)
   * Position 0 = Start, Positions 1-5 = Core tasks, Positions 6-14 = Extended tasks
   */
  TOTAL_POSITIONS: 15,

  /**
   * Number of core wellness tasks (before extended good deed tasks)
   */
  CORE_TASKS_COUNT: 5,

  /**
   * Task number where first finish screen should be shown
   * This represents completing all core tasks (5) + some extended tasks
   */
  FIRST_FINISH_THRESHOLD: 9,

  /**
   * Task number where final completion screen should be shown
   * This represents completing all tasks
   */
  FINAL_COMPLETION_THRESHOLD: 14,

  /**
   * Starting position (users who haven't completed any tasks)
   */
  START_POSITION: 0,
} as const;

/**
 * Data Fetching Configuration
 */
export const DATA_CONFIG = {
  /**
   * Interval for polling Google Sheets data (in milliseconds)
   * Default: 180000ms = 3 minutes
   */
  POLLING_INTERVAL_MS: 180000,

  /**
   * Google Sheets CSV URL (from environment variable)
   */
  GOOGLE_SHEET_URL: import.meta.env.VITE_GOOGLE_SHEET_URL as string,
} as const;

/**
 * External API Configuration
 */
export const API_CONFIG = {
  /**
   * Base URL for employee photo API
   */
  EMPLOYEE_PHOTO_BASE_URL: "https://api.employee.leobit.co/photos-small",

  /**
   * Photo file extension
   */
  PHOTO_FILE_EXTENSION: ".png",

  /**
   * Fallback avatar URL when employee photo is not available
   */
  FALLBACK_AVATAR_URL: "/fallback-avatar.png",
} as const;

/**
 * CSV Schema Configuration
 * Defines expected column names in Google Sheets CSV export
 */
export const CSV_SCHEMA = {
  /**
   * Required columns
   */
  REQUIRED_COLUMNS: {
    EMAIL: "Email Address",
    NAME: "Ім'я та прізвище",
  },

  /**
   * Optional columns
   */
  OPTIONAL_COLUMNS: {
    SOCIAL_NETWORK_POINTS: "Соц мережі відмітки",
  },

  /**
   * Task column pattern - task columns start with a digit followed by a period
   * Examples: "1. Список справ", "2. Пункт зі списку"
   */
  TASK_COLUMN_PATTERN: /^\d+\./,
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  /**
   * Maximum number of avatars to show before requiring modal
   */
  MAX_AVATARS_BEFORE_MODAL: 5,

  /**
   * Maximum number of avatars to show in tooltip
   */
  MAX_AVATARS_IN_TOOLTIP: 5,

  /**
   * Avatar stacking offset for less than 10 users (in pixels)
   */
  AVATAR_STACK_OFFSET_LARGE: 10,

  /**
   * Avatar stacking offset for 10 or more users (in pixels)
   */
  AVATAR_STACK_OFFSET_SMALL: 2,
} as const;

/**
 * Helper function to get employee photo URL
 */
export function getEmployeePhotoUrl(userId: string): string {
  return `${API_CONFIG.EMPLOYEE_PHOTO_BASE_URL}/${userId}${API_CONFIG.PHOTO_FILE_EXTENSION}`;
}

/**
 * Helper function to get fallback avatar URL
 */
export function getFallbackAvatarUrl(): string {
  return API_CONFIG.FALLBACK_AVATAR_URL;
}
