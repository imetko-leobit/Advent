import { QuestDataService } from "./QuestDataService";
import { GoogleSheetsProvider, MockCSVProvider } from "./providers";
import { DataSourceType, QuestDataServiceConfig, QuestDataProvider } from "./types";
import { isDevMode } from "../auth/authConfig";

/**
 * Determines the appropriate data source URL based on environment
 * - If VITE_DEV_MODE=true, use local mock CSV
 * - If VITE_GOOGLE_SHEET_URL is set, use it (production)
 * - Otherwise, throw error (production misconfiguration)
 */
const getDataSourceUrl = (): string => {
  // In DEV mode, always use mock data
  if (isDevMode()) {
    console.log(
      "[QuestDataService] DEV mode - using mock CSV data"
    );
    return "/mock-quest-data.csv";
  }

  const googleSheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;

  if (googleSheetUrl) {
    return googleSheetUrl;
  }

  // Production error - environment variable is required
  throw new Error(
    "[QuestDataService] VITE_GOOGLE_SHEET_URL must be configured in production"
  );
};

/**
 * Determines the data source type based on environment
 */
const getDataSourceType = (): DataSourceType => {
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
 * In DEV mode, polling is disabled (interval set to effectively infinite)
 */
export const createQuestDataService = (
  customConfig?: Partial<QuestDataServiceConfig>
): QuestDataService => {
  const config: QuestDataServiceConfig = {
    dataSourceType: getDataSourceType(),
    dataSourceUrl: getDataSourceUrl(),
    // Disable polling in DEV mode by setting a very high interval
    // In production, use default (or custom) polling interval
    pollingIntervalMs: isDevMode() ? Number.MAX_SAFE_INTEGER : undefined,
    ...customConfig,
  };

  const provider = createDataProvider(config.dataSourceType, config.dataSourceUrl);

  if (isDevMode()) {
    console.log("[QuestDataService] DEV mode - polling disabled");
  }

  return new QuestDataService(config, provider);
};
