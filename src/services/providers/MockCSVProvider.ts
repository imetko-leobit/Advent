import { IRowData } from "../../consts";
import { QuestDataProvider } from "../types";
import { parseCSV } from "./csvParser";
import { logger } from "../../utils/logger";

/**
 * Default timeout for network requests (30 seconds)
 */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Mock CSV Data Provider
 * Fetches quest data from a local mock CSV file
 * Used for development and testing without external dependencies
 */
export class MockCSVProvider implements QuestDataProvider {
  private dataSourceUrl: string;
  private timeout: number;

  constructor(dataSourceUrl: string, timeout: number = DEFAULT_TIMEOUT_MS) {
    this.dataSourceUrl = dataSourceUrl;
    this.timeout = timeout;
  }

  /**
   * Fetch quest data from local mock CSV with timeout support
   */
  async fetchQuestData(): Promise<IRowData[]> {
    if (!this.dataSourceUrl) {
      logger.error("MockCSVProvider", "No data source URL provided");
      return [];
    }

    try {
      // Create an abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      logger.info("MockCSVProvider", `Fetching mock data from: ${this.dataSourceUrl}`);

      const response = await fetch(this.dataSourceUrl, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.error(
          "MockCSVProvider",
          `HTTP error: ${response.status} ${response.statusText}`
        );
        return [];
      }

      const csvData = await response.text();

      if (!csvData || csvData.trim().length === 0) {
        logger.warn("MockCSVProvider", "Received empty CSV data");
        return [];
      }

      const parsedData = await parseCSV(csvData);
      logger.info("MockCSVProvider", `Successfully fetched ${parsedData.length} records`);
      
      return parsedData;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          logger.error(
            "MockCSVProvider",
            `Request timed out after ${this.timeout}ms`,
            error
          );
        } else {
          logger.error("MockCSVProvider", "Error fetching CSV", error);
        }
      }
      return [];
    }
  }
}
