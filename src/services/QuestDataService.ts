import { IRowData } from "../consts";
import { IQuestDataService, QuestDataServiceConfig, QuestDataProvider } from "./types";

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
      return await this.provider.fetchQuestData();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("[QuestDataService] Error fetching data:", error.message);
      }
      return [];
    }
  }

  /**
   * Start polling for data updates
   */
  startPolling(callback: (data: IRowData[]) => void): void {
    this.onDataUpdateCallback = callback;

    // Fetch initial data
    this.fetchData()
      .then((data) => {
        this.currentData = data;
        this.onDataUpdateCallback?.(data);
      })
      .catch((error) => {
        console.error("[QuestDataService] Error during initial fetch:", error);
        // Still call callback with empty array to signal completion
        this.onDataUpdateCallback?.([]);
      });

    // Set up polling interval
    this.pollingIntervalId = window.setInterval(() => {
      this.fetchData()
        .then((data) => {
          this.currentData = data;
          this.onDataUpdateCallback?.(data);
        })
        .catch((error) => {
          console.error("[QuestDataService] Error during polling fetch:", error);
          // Continue with cached data on error
        });
    }, this.config.pollingIntervalMs);
  }

  /**
   * Stop polling for data updates
   */
  stopPolling(): void {
    if (this.pollingIntervalId !== null) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
    this.onDataUpdateCallback = null;
  }
}
