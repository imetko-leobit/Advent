import { IRowData } from "../consts";

/**
 * Represents a data source for quest data
 */
export enum DataSourceType {
  MOCK_CSV = "MOCK_CSV",
  GOOGLE_SHEETS = "GOOGLE_SHEETS",
  API = "API",
}

/**
 * Quest Data Provider Interface
 * Abstraction for fetching quest data from various sources
 */
export interface QuestDataProvider {
  /**
   * Fetch quest data from the data source
   * @returns Promise resolving to array of quest data rows
   */
  fetchQuestData(): Promise<IRowData[]>;
}

/**
 * Configuration for the quest data service
 */
export interface QuestDataServiceConfig {
  dataSourceType: DataSourceType;
  dataSourceUrl: string;
  pollingIntervalMs?: number;
}

/**
 * Minimal configuration for custom provider scenarios
 * Used when provider is already instantiated
 */
export interface CustomProviderConfig {
  pollingIntervalMs?: number;
}

/**
 * Interface for quest data fetching and management
 */
export interface IQuestDataService {
  /**
   * Get all raw quest data
   */
  getData(): IRowData[];

  /**
   * Start polling for data updates
   */
  startPolling(callback: (data: IRowData[]) => void): void;

  /**
   * Stop polling for data updates
   */
  stopPolling(): void;

  /**
   * Manually fetch fresh data
   */
  fetchData(): Promise<IRowData[]>;

  /**
   * Get current configuration
   */
  getConfig(): QuestDataServiceConfig;
}
