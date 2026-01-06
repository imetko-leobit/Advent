import { IRowData } from "../../consts";
import { QuestDataProvider } from "../types";
import { parseCSV } from "./csvParser";
import { logger } from "../../utils/logger";

/**
 * Default timeout for network requests (30 seconds)
 */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Google Sheets Data Provider
 * Fetches quest data from a Google Sheets CSV export URL
 */
export class GoogleSheetsProvider implements QuestDataProvider {
  private dataSourceUrl: string;
  private timeout: number;

  constructor(dataSourceUrl: string, timeout: number = DEFAULT_TIMEOUT_MS) {
    this.dataSourceUrl = dataSourceUrl;
    this.timeout = timeout;
  }

  /**
   * Fetch quest data from Google Sheets with timeout support
   */
  async fetchQuestData(): Promise<IRowData[]> {
    if (!this.dataSourceUrl) {
      logger.error("GoogleSheetsProvider", "No data source URL provided");
      return [];
    }

    try {
      // Create an abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      logger.info("GoogleSheetsProvider", `Fetching data from: ${this.dataSourceUrl}`);

      const response = await fetch(this.dataSourceUrl, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.error(
          "GoogleSheetsProvider",
          `HTTP error: ${response.status} ${response.statusText}`
        );
        return [];
      }

      const csvData = await response.text();

      if (!csvData || csvData.trim().length === 0) {
        logger.warn("GoogleSheetsProvider", "Received empty CSV data");
        return [];
      }

      const parsedData = await parseCSV(csvData);
      logger.info("GoogleSheetsProvider", `Successfully fetched ${parsedData.length} records`);
      
      return parsedData;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          logger.error(
            "GoogleSheetsProvider",
            `Request timed out after ${this.timeout}ms`,
            error
          );
        } else {
          logger.error("GoogleSheetsProvider", "Error fetching CSV", error);
        }
      }
      return [];
    }
  }
}
