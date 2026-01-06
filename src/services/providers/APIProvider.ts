import { IRowData } from "../../consts";
import { QuestDataProvider } from "../types";
import { logger } from "../../utils/logger";

/**
 * Default timeout for network requests (30 seconds)
 */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * API Data Provider
 * Fetches quest data from a REST API endpoint
 * Expects JSON response with array of IRowData objects
 */
export class APIProvider implements QuestDataProvider {
  private apiEndpoint: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(
    apiEndpoint: string,
    timeout: number = DEFAULT_TIMEOUT_MS,
    headers: Record<string, string> = {}
  ) {
    this.apiEndpoint = apiEndpoint;
    this.timeout = timeout;
    this.headers = {
      "Content-Type": "application/json",
      ...headers,
    };
  }

  /**
   * Fetch quest data from API endpoint with timeout support
   */
  async fetchQuestData(): Promise<IRowData[]> {
    if (!this.apiEndpoint) {
      logger.error("APIProvider", "No API endpoint provided");
      return [];
    }

    try {
      // Create an abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      logger.info("APIProvider", `Fetching data from: ${this.apiEndpoint}`);

      const response = await fetch(this.apiEndpoint, {
        method: "GET",
        headers: this.headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.error(
          "APIProvider",
          `HTTP error: ${response.status} ${response.statusText}`
        );
        return [];
      }

      const jsonData = await response.json();

      if (!jsonData || !Array.isArray(jsonData)) {
        logger.warn("APIProvider", "API response is not an array");
        return [];
      }

      // Validate that each item has required fields
      const validData = jsonData.filter((item) => {
        const isValid =
          item &&
          typeof item.email === "string" &&
          typeof item.name === "string" &&
          typeof item.picture === "string" &&
          typeof item.taskNumber === "number";

        if (!isValid) {
          logger.warn("APIProvider", "Invalid data item", item);
        }

        return isValid;
      });

      logger.info(
        "APIProvider",
        `Successfully fetched ${validData.length} records (${
          jsonData.length - validData.length
        } invalid items filtered)`
      );

      return validData;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          logger.error(
            "APIProvider",
            `Request timed out after ${this.timeout}ms`,
            error
          );
        } else {
          logger.error("APIProvider", "Error fetching data from API", error);
        }
      }
      return [];
    }
  }
}
