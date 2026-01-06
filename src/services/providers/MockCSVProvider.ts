import Papa from "papaparse";
import { IRowData } from "../../consts";
import { QuestDataProvider } from "../types";

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
      return await this.parseCSV(csvData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("[MockCSVProvider] Error fetching CSV:", error.message);
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
          console.error("[MockCSVProvider] Error parsing CSV:", error.message);
          reject(error);
        },
      });
    });
  }
}
