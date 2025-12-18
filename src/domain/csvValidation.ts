/**
 * CSV Data Validation and Parsing
 * 
 * This module provides validation and safe parsing of Google Sheets CSV data.
 * It implements the data contract defined in QUEST_RULES.md.
 */

import { CSV_SCHEMA } from "../config/questConfig";
import { IRowData } from "../consts/interfaces";

/**
 * Validation result for a single row
 */
export interface RowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validation result for the entire CSV dataset
 */
export interface CsvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validRowCount: number;
  invalidRowCount: number;
}

/**
 * Validates that required columns exist in a row
 * 
 * @param row - The CSV row data
 * @returns Validation result
 */
export function validateRequiredColumns(row: IRowData): RowValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for email
  if (!row[CSV_SCHEMA.REQUIRED_COLUMNS.EMAIL]) {
    errors.push("Missing required field: Email Address");
  }

  // Check for name
  if (!row[CSV_SCHEMA.REQUIRED_COLUMNS.NAME]) {
    warnings.push("Missing name, will use email as fallback");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates email format
 * 
 * @param email - Email address to validate
 * @returns true if email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  // Basic email validation: contains @ and has parts before and after
  const parts = email.split("@");
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
}

/**
 * Extracts user ID from email address
 * 
 * @param email - Email address
 * @returns User ID (part before @) or null if invalid
 */
export function extractUserIdFromEmail(email: string): string | null {
  if (!isValidEmail(email)) {
    return null;
  }

  return email.split("@")[0];
}

/**
 * Extracts task column keys from a row
 * 
 * @param row - CSV row data
 * @returns Array of task column keys, sorted numerically
 */
export function extractTaskColumns(row: IRowData): string[] {
  return Object.keys(row)
    .filter((key) => CSV_SCHEMA.TASK_COLUMN_PATTERN.test(key))
    .sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      return numA - numB;
    });
}

/**
 * Safely parses social network points value
 * 
 * @param value - Raw value from CSV
 * @returns Number or 0 if invalid
 */
export function parseSocialNetworkPoints(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value >= 0 ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
  }

  return 0;
}

/**
 * Validates a single CSV row
 * 
 * @param row - CSV row data
 * @param rowIndex - Index of the row (for error reporting)
 * @returns Validation result
 */
export function validateRow(
  row: IRowData,
  rowIndex: number
): RowValidationResult {
  const result = validateRequiredColumns(row);

  // Additional validation for email format
  const email = row[CSV_SCHEMA.REQUIRED_COLUMNS.EMAIL];
  if (email && !isValidEmail(email)) {
    result.errors.push(`Invalid email format at row ${rowIndex}: ${email}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Validates entire CSV dataset
 * 
 * @param data - Array of CSV rows
 * @returns Validation result with aggregated errors and warnings
 */
export function validateCsvData(data: IRowData[]): CsvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let validRowCount = 0;
  let invalidRowCount = 0;

  if (!data || data.length === 0) {
    errors.push("CSV data is empty");
    return {
      isValid: false,
      errors,
      warnings,
      validRowCount: 0,
      invalidRowCount: 0,
    };
  }

  data.forEach((row, index) => {
    const rowResult = validateRow(row, index);

    if (rowResult.isValid) {
      validRowCount++;
    } else {
      invalidRowCount++;
    }

    errors.push(...rowResult.errors);
    warnings.push(...rowResult.warnings);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validRowCount,
    invalidRowCount,
  };
}

/**
 * Filters out invalid rows from CSV data
 * 
 * @param data - Array of CSV rows
 * @returns Array of valid rows only
 */
export function filterValidRows(data: IRowData[]): IRowData[] {
  return data.filter((row, index) => {
    const result = validateRow(row, index);
    return result.isValid;
  });
}

/**
 * Sanitizes a CSV row by providing defaults for missing optional fields
 * 
 * @param row - CSV row data
 * @returns Sanitized row data
 */
export function sanitizeRow(row: IRowData): IRowData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitized: any = { ...row };

  // Ensure social network points has a valid value
  const socialPointsKey = CSV_SCHEMA.OPTIONAL_COLUMNS.SOCIAL_NETWORK_POINTS;
  if (socialPointsKey in sanitized) {
    sanitized[socialPointsKey] = parseSocialNetworkPoints(
      sanitized[socialPointsKey]
    );
  } else {
    sanitized[socialPointsKey] = 0;
  }

  // Ensure name has a value (use email as fallback)
  const nameKey = CSV_SCHEMA.REQUIRED_COLUMNS.NAME;
  if (!sanitized[nameKey]) {
    sanitized[nameKey] = sanitized[CSV_SCHEMA.REQUIRED_COLUMNS.EMAIL];
  }

  return sanitized as IRowData;
}

/**
 * Processes CSV data: validates, filters invalid rows, and sanitizes valid rows
 * 
 * @param data - Raw CSV data
 * @returns Object containing processed data and validation results
 */
export function processCsvData(data: IRowData[]): {
  validData: IRowData[];
  validation: CsvValidationResult;
} {
  const validation = validateCsvData(data);
  const validRows = filterValidRows(data);
  const validData = validRows.map(sanitizeRow);

  return {
    validData,
    validation,
  };
}
