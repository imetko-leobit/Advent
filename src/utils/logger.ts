/**
 * Structured Logger Utility
 * Provides consistent, grouped logging across the application
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LoggerOptions {
  enabled?: boolean;
  minLevel?: LogLevel;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

class Logger {
  private enabled: boolean;
  private minLevel: LogLevel;

  constructor(options: LoggerOptions = {}) {
    this.enabled = options.enabled ?? true;
    this.minLevel = options.minLevel ?? LogLevel.INFO;
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  /**
   * Format a log message with timestamp and level
   */
  private formatMessage(level: LogLevel, context: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${context}] ${message}`;
  }

  /**
   * Log a debug message
   */
  debug(context: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, context, message), ...args);
    }
  }

  /**
   * Log an info message
   */
  info(context: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, context, message), ...args);
    }
  }

  /**
   * Log a warning message
   */
  warn(context: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, context, message), ...args);
    }
  }

  /**
   * Log an error message
   */
  error(context: string, message: string, error?: Error | unknown, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(this.formatMessage(LogLevel.ERROR, context, message), errorMessage, ...args);
      if (error instanceof Error && error.stack) {
        console.error("Stack trace:", error.stack);
      }
    }
  }

  /**
   * Start a console group for related logs
   */
  group(label: string): void {
    if (this.enabled) {
      console.group(label);
    }
  }

  /**
   * Start a collapsed console group
   */
  groupCollapsed(label: string): void {
    if (this.enabled) {
      console.groupCollapsed(label);
    }
  }

  /**
   * End the current console group
   */
  groupEnd(): void {
    if (this.enabled) {
      console.groupEnd();
    }
  }

  /**
   * Set the minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const logger = new Logger({
  enabled: true,
  minLevel: LogLevel.INFO,
});

/**
 * Log application startup information
 */
export function logStartupInfo(config: {
  mode: "DEV" | "PROD";
  dataProvider: string;
  questName: string;
  taskCount: number;
}): void {
  logger.group("🚀 Application Startup");
  logger.info("Startup", `Mode: ${config.mode}`);
  logger.info("Startup", `Data Provider: ${config.dataProvider}`);
  logger.info("Startup", `Quest: ${config.questName}`);
  logger.info("Startup", `Task Count: ${config.taskCount}`);
  logger.groupEnd();
}
