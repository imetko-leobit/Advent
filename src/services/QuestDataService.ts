import Papa from "papaparse";
import { IRowData } from "../consts";
import { IQuestDataService, QuestDataServiceConfig } from "./types";

/**
 * Default polling interval: 3 minutes (180000ms)
 */
const DEFAULT_POLLING_INTERVAL_MS = 180000;

/**
 * Quest Data Service - Handles all data fetching, parsing, and polling
 * Abstracts the data source (mock CSV or Google Sheets) from consumers
 */
export class QuestDataService implements IQuestDataService {
  private config: QuestDataServiceConfig;
  private currentData: IRowData[] = [];
  private pollingIntervalId: number | null = null;
  private onDataUpdateCallback: ((data: IRowData[]) => void) | null = null;

  constructor(config: QuestDataServiceConfig) {
    this.config = {
      ...config,
      pollingIntervalMs:
        config.pollingIntervalMs || DEFAULT_POLLING_INTERVAL_MS,
    };
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
   * Fetch data from the configured data source
   */
  async fetchData(): Promise<IRowData[]> {
    const { dataSourceUrl } = this.config;

    if (!dataSourceUrl) {
      console.error("[QuestDataService] No data source URL available");
      return [];
    }

    try {
      const response = await fetch(dataSourceUrl);

      if (!response.ok) {
        console.error(
          `[QuestDataService] Error fetching CSV: HTTP ${response.status}`
        );
        return [];
      }

      const csvData = await response.text();
      return await this.parseCSV(csvData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("[QuestDataService] Error fetching CSV:", error.message);
      }
      return [];
    }
  }

  /**
   * Parse CSV data into structured objects
   */
  private parseCSV(csvData: string): Promise<IRowData[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          resolve(result.data as IRowData[]);
        },
        error: (error: Error) => {
          console.error("[QuestDataService] Error parsing CSV:", error.message);
          reject(error);
        },
      });
    });
  }

  /**
   * Start polling for data updates
   */
  startPolling(callback: (data: IRowData[]) => void): void {
    this.onDataUpdateCallback = callback;

    // Fetch initial data
    this.fetchData().then((data) => {
      this.currentData = data;
      this.onDataUpdateCallback?.(data);
    });

    // Set up polling interval
    this.pollingIntervalId = window.setInterval(() => {
      this.fetchData().then((data) => {
        this.currentData = data;
        this.onDataUpdateCallback?.(data);
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
