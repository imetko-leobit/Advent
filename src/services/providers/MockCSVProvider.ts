import { IRowData } from "../../consts";
import { QuestDataProvider } from "../types";
import { parseCSV } from "./csvParser";

/**
 * Mock CSV Data Provider
 * Fetches quest data from a local mock CSV file
 * Used for development and testing without external dependencies
 */
export class MockCSVProvider implements QuestDataProvider {
  private dataSourceUrl: string;

  constructor(dataSourceUrl: string) {
    this.dataSourceUrl = dataSourceUrl;
  }

  /**
   * Fetch quest data from local mock CSV
   */
  async fetchQuestData(): Promise<IRowData[]> {
    if (!this.dataSourceUrl) {
      console.error("[MockCSVProvider] No data source URL provided");
      return [];
    }

    try {
      const response = await fetch(this.dataSourceUrl);

      if (!response.ok) {
        console.error(
          `[MockCSVProvider] Error fetching CSV: HTTP ${response.status}`
        );
        return [];
      }

      const csvData = await response.text();
      return await parseCSV(csvData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("[MockCSVProvider] Error fetching CSV:", error.message);
      }
      return [];
    }
  }
}
