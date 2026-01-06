import Papa from "papaparse";
import { IRowData } from "../../consts";
import { QuestDataProvider } from "../types";

/**
 * Google Sheets Data Provider
 * Fetches quest data from a Google Sheets CSV export URL
 */
export class GoogleSheetsProvider implements QuestDataProvider {
  private dataSourceUrl: string;

  constructor(dataSourceUrl: string) {
    this.dataSourceUrl = dataSourceUrl;
  }

  /**
   * Fetch quest data from Google Sheets
   */
  async fetchQuestData(): Promise<IRowData[]> {
    if (!this.dataSourceUrl) {
      console.error("[GoogleSheetsProvider] No data source URL provided");
      return [];
    }

    try {
      const response = await fetch(this.dataSourceUrl);

      if (!response.ok) {
        console.error(
          `[GoogleSheetsProvider] Error fetching CSV: HTTP ${response.status}`
        );
        return [];
      }

      const csvData = await response.text();
      return await this.parseCSV(csvData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          "[GoogleSheetsProvider] Error fetching CSV:",
          error.message
        );
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
          console.error(
            "[GoogleSheetsProvider] Error parsing CSV:",
            error.message
          );
          reject(error);
        },
      });
    });
  }
}
