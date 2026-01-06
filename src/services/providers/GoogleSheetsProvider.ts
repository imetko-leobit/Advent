import { IRowData } from "../../consts";
import { QuestDataProvider } from "../types";
import { parseCSV } from "./csvParser";

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
      return await parseCSV(csvData);
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
}
