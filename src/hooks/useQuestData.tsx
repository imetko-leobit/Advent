import { useState, useEffect } from "react";
import Papa from "papaparse";
import { useLoading } from "../context/LoadingContext";
import { IRowData } from "../consts";
import { DATA_CONFIG } from "../config/questConfig";
import { processCsvData } from "../domain/csvValidation";

export const useQuestData = () => {
  const [jsonData, setJsonData] = useState<IRowData[]>([]);
  const { stopLoading, startLoading } = useLoading();

  const fetchData = async () => {
    try {
      const response = await fetch(DATA_CONFIG.GOOGLE_SHEET_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvData = await response.text();
      
      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          // Validate and process CSV data
          const { validData, validation } = processCsvData(result.data as IRowData[]);
          
          // Log validation warnings and errors
          if (validation.warnings.length > 0) {
            console.warn("CSV validation warnings:", validation.warnings);
          }
          
          if (validation.errors.length > 0) {
            console.error("CSV validation errors:", validation.errors);
          }
          
          // Use valid data even if there are some errors
          // This ensures the app continues to work with partial data
          setJsonData(validData);
          stopLoading();
        },
        error: (error: Error) => {
          console.error("Error parsing CSV:", error.message);
          // Don't clear existing data on error - keep showing last valid data
          stopLoading();
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching CSV:", error.message);
      } else {
        console.error("Unknown error fetching CSV");
      }
      // Don't clear existing data on error - keep showing last valid data
      stopLoading();
    }
  };

  useEffect(() => {
    startLoading();
    fetchData();

    const intervalId = setInterval(() => {
      startLoading();
      fetchData();
    }, DATA_CONFIG.POLLING_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return { jsonData };
};
