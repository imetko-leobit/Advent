import { IRowData } from "../consts";
import { IQuestDataService, QuestDataServiceConfig, QuestDataProvider } from "./types";
import { logger } from "../utils/logger";

/**
 * Default polling interval: 3 minutes (180000ms)
 */
const DEFAULT_POLLING_INTERVAL_MS = 180000;

/**
 * Quest Data Service - Handles all data fetching, parsing, and polling
 * Uses a QuestDataProvider abstraction to fetch data from various sources
 */
export class QuestDataService implements IQuestDataService {
  private config: QuestDataServiceConfig;
  private provider: QuestDataProvider;
  private currentData: IRowData[] = [];
  private pollingIntervalId: number | null = null;
  private onDataUpdateCallback: ((data: IRowData[]) => void) | null = null;

  constructor(config: QuestDataServiceConfig, provider: QuestDataProvider) {
    this.config = {
      ...config,
      pollingIntervalMs:
        config.pollingIntervalMs || DEFAULT_POLLING_INTERVAL_MS,
    };
    this.provider = provider;
    
    logger.info(
      "QuestDataService",
      `Initialized with ${config.dataSourceType} provider`
    );
  }

  /**
   * Get currently cached data
   */
  getData(): IRowData[] {
    return this.currentData;
  }

  /**
   * Get service configuration
   */
  getConfig(): QuestDataServiceConfig {
    return { ...this.config };
  }

  /**
   * Fetch data from the configured data source via the provider
   */
  async fetchData(): Promise<IRowData[]> {
    try {
      const data = await this.provider.fetchQuestData();
      
      if (!data || data.length === 0) {
        logger.warn("QuestDataService", "Provider returned empty dataset");
      }
      
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error("QuestDataService", "Error fetching data", error);
      }
      return [];
    }
  }

  /**
   * Start polling for data updates
   */
  startPolling(callback: (data: IRowData[]) => void): void {
    this.onDataUpdateCallback = callback;

    logger.info("QuestDataService", "Starting data polling");

    // Fetch initial data
    this.fetchData()
      .then((data) => {
        this.currentData = data;
        logger.info("QuestDataService", `Initial fetch complete: ${data.length} records`);
        this.onDataUpdateCallback?.(data);
      })
      .catch((error) => {
        logger.error("QuestDataService", "Error during initial fetch", error);
        // Still call callback with empty array to signal completion
        this.onDataUpdateCallback?.([]);
      });

    // Set up polling interval
    // Check if polling should be enabled (interval is defined and not set to disable value)
    // When pollingIntervalMs is Number.MAX_SAFE_INTEGER, polling is effectively disabled
    const isPollingEnabled = 
      this.config.pollingIntervalMs && 
      this.config.pollingIntervalMs < Number.MAX_SAFE_INTEGER;

    if (isPollingEnabled) {
      this.pollingIntervalId = window.setInterval(() => {
        this.fetchData()
          .then((data) => {
            this.currentData = data;
            logger.debug("QuestDataService", `Poll complete: ${data.length} records`);
            this.onDataUpdateCallback?.(data);
          })
          .catch((error) => {
            logger.error("QuestDataService", "Error during polling fetch", error);
            // Continue with cached data on error
          });
      }, this.config.pollingIntervalMs);
      
      logger.info(
        "QuestDataService",
        `Polling enabled: every ${this.config.pollingIntervalMs}ms`
      );
    } else {
      logger.info("QuestDataService", "Polling disabled");
    }
  }

  /**
   * Stop polling for data updates
   */
  stopPolling(): void {
    if (this.pollingIntervalId !== null) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
      logger.info("QuestDataService", "Polling stopped");
    }
    this.onDataUpdateCallback = null;
  }
}
