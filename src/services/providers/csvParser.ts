import Papa from "papaparse";
import { IRowData } from "../../consts";

/**
 * Parse CSV data into structured objects
 * Shared utility for CSV-based providers
 */
export const parseCSV = (csvData: string): Promise<IRowData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        resolve(result.data as IRowData[]);
      },
      error: (error: Error) => {
        console.error("[CSVParser] Error parsing CSV:", error.message);
        reject(error);
      },
    });
  });
};
