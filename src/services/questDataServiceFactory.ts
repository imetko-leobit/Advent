import { QuestDataService } from "./QuestDataService";
import { GoogleSheetsProvider, MockCSVProvider } from "./providers";
import { DataSourceType, QuestDataServiceConfig, QuestDataProvider } from "./types";

/**
 * Determines the appropriate data source URL based on environment
 * - If VITE_GOOGLE_SHEET_URL is set, use it (production)
 * - If in DEV mode and no URL is set, use local mock CSV
 * - Otherwise, throw error (production misconfiguration)
 */
const getDataSourceUrl = (): string => {
  const googleSheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;

  if (googleSheetUrl) {
    return googleSheetUrl;
  }

  if (import.meta.env.DEV) {
    console.log(
      "[QuestDataService] Using mock CSV data for local development"
    );
    return "/mock-quest-data.csv";
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
 */
export const createQuestDataService = (
  customConfig?: Partial<QuestDataServiceConfig>
): QuestDataService => {
  const config: QuestDataServiceConfig = {
    dataSourceType: getDataSourceType(),
    dataSourceUrl: getDataSourceUrl(),
    ...customConfig,
  };

  const provider = createDataProvider(config.dataSourceType, config.dataSourceUrl);

  return new QuestDataService(config, provider);
};
