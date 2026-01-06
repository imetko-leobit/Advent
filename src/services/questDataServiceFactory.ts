import { QuestDataService } from "./QuestDataService";
import { GoogleSheetsProvider, MockCSVProvider } from "./providers";
import { DataSourceType, QuestDataServiceConfig, QuestDataProvider } from "./types";
import { isDevMode } from "../auth/authConfig";
import { logger } from "../utils/logger";

/**
 * Polling disabled constant - used to effectively disable polling in DEV mode
 * By setting an extremely high interval, polling will not occur during normal usage
 */
const POLLING_DISABLED = Number.MAX_SAFE_INTEGER;

/**
 * Determines the appropriate data source URL based on environment
 * - If VITE_DEV_MODE=true, use local mock CSV
 * - If VITE_GOOGLE_SHEET_URL is set, use it (production)
 * - Otherwise, throw error (production misconfiguration)
 */
const getDataSourceUrl = (): string => {
  // In DEV mode, always use mock data
  if (isDevMode()) {
    logger.info("QuestDataServiceFactory", "DEV mode - using mock CSV data");
    return "/mock-quest-data.csv";
  }

  const googleSheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;

  if (googleSheetUrl) {
    return googleSheetUrl;
  }

  // Production error - environment variable is required
  throw new Error(
    "VITE_GOOGLE_SHEET_URL must be configured in production mode"
  );
};

/**
 * Determines the data source type based on environment
 * Exported for logging purposes
 */
export const getDataSourceType = (): DataSourceType => {
  // In DEV mode, always use mock CSV
  if (isDevMode()) {
    return DataSourceType.MOCK_CSV;
  }

  const googleSheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;

  if (googleSheetUrl) {
    return DataSourceType.GOOGLE_SHEETS;
  }

  return DataSourceType.MOCK_CSV;
};

/**
 * Creates the appropriate data provider based on data source type
 */
const createDataProvider = (
  dataSourceType: DataSourceType,
  dataSourceUrl: string
): QuestDataProvider => {
  switch (dataSourceType) {
    case DataSourceType.GOOGLE_SHEETS:
      return new GoogleSheetsProvider(dataSourceUrl);
    case DataSourceType.MOCK_CSV:
      return new MockCSVProvider(dataSourceUrl);
    default:
      throw new Error(`Unsupported data source type: ${dataSourceType}`);
  }
};

/**
 * Factory function to create a configured QuestDataService instance
 * Automatically detects the appropriate data source based on environment variables
 * In DEV mode, polling is disabled (interval set to POLLING_DISABLED constant)
 */
export const createQuestDataService = (
  customConfig?: Partial<QuestDataServiceConfig>
): QuestDataService => {
  const config: QuestDataServiceConfig = {
    dataSourceType: getDataSourceType(),
    dataSourceUrl: getDataSourceUrl(),
    // Disable polling in DEV mode - mock data doesn't change during development
    // Setting to POLLING_DISABLED (Number.MAX_SAFE_INTEGER) prevents any polling
    // In production, undefined will use the default interval (3 minutes)
    pollingIntervalMs: isDevMode() ? POLLING_DISABLED : undefined,
    ...customConfig,
  };

  const provider = createDataProvider(config.dataSourceType, config.dataSourceUrl);

  if (isDevMode()) {
    logger.info("QuestDataServiceFactory", "DEV mode - polling disabled");
  }

  return new QuestDataService(config, provider);
};
