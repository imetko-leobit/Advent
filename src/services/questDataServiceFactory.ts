import { QuestDataService } from "./QuestDataService";
import { DataSourceType, QuestDataServiceConfig } from "./types";

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

  return new QuestDataService(config);
};
