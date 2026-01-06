import Papa from "papaparse";
import { IRowData } from "../../consts";
import { logger } from "../../utils/logger";

/**
 * Required field for valid quest data row
 */
const REQUIRED_EMAIL_FIELD = "Email Address";

/**
 * Validates a single row of data
 * Returns true if the row has at least an email field
 */
function isValidRow(row: unknown): row is IRowData {
  if (!row || typeof row !== "object") {
    return false;
  }

  const rowData = row as Partial<IRowData>;
  
  // A valid row must have an email address field
  // Other fields can be optional/null
  return (
    REQUIRED_EMAIL_FIELD in rowData &&
    typeof rowData[REQUIRED_EMAIL_FIELD] === "string" &&
    rowData[REQUIRED_EMAIL_FIELD].length > 0
  );
}

/**
 * Sanitizes parsed data by filtering out invalid rows
 */
function sanitizeData(data: unknown[]): IRowData[] {
  const validRows: IRowData[] = [];
  let invalidRowCount = 0;

  data.forEach((row, index) => {
    if (isValidRow(row)) {
      validRows.push(row);
    } else {
      invalidRowCount++;
      logger.debug("CSVParser", `Skipping invalid row at index ${index}`, row);
    }
  });

  if (invalidRowCount > 0) {
    logger.warn("CSVParser", `Filtered out ${invalidRowCount} invalid/empty rows`);
  }

  return validRows;
}

/**
 * Parse CSV data into structured objects
 * Shared utility for CSV-based providers
 * Validates and sanitizes the parsed data
 */
export const parseCSV = (csvData: string): Promise<IRowData[]> => {
  return new Promise((resolve, reject) => {
    if (!csvData || csvData.trim().length === 0) {
      logger.warn("CSVParser", "Empty CSV data provided");
      resolve([]);
      return;
    }

    Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors && result.errors.length > 0) {
          logger.warn("CSVParser", `Parse warnings: ${result.errors.length} issues found`);
          result.errors.forEach((error) => {
            logger.debug("CSVParser", `Parse error at row ${error.row}: ${error.message}`);
          });
        }

        const sanitizedData = sanitizeData(result.data);
        logger.info("CSVParser", `Parsed ${sanitizedData.length} valid rows from CSV`);
        resolve(sanitizedData);
      },
      error: (error: Error) => {
        logger.error("CSVParser", "Error parsing CSV", error);
        reject(error);
      },
    });
  });
};
