import { useState, useEffect } from "react";
import Papa from "papaparse";
import { useLoading } from "../context/LoadingContext";
import { IRowData } from "../consts";

// DEV-ONLY: Determine the data source URL
// In DEV mode without VITE_GOOGLE_SHEET_URL, use local mock CSV
const getDataSourceUrl = () => {
  const googleSheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;
  
  if (googleSheetUrl) {
    return googleSheetUrl;
  }
  
  if (import.meta.env.DEV) {
    console.log("[DEV] Using mock CSV data for local development");
    return "/mock-quest-data.csv";
  }
  
  // Production fallback - should not happen in normal operation
  console.error("VITE_GOOGLE_SHEET_URL is not configured");
  return "";
};

export const useQuestData = () => {
  const [jsonData, setJsonData] = useState<IRowData[]>([]);
  const { stopLoading, startLoading } = useLoading();

  const fetchData = async () => {
    const dataUrl = getDataSourceUrl();
    
    if (!dataUrl) {
      console.error("No data source URL available");
      stopLoading();
      return;
    }
    
    const response = await fetch(dataUrl);
    try {
      const csvData = await response.text();
      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          setJsonData(result.data as IRowData[]);
          stopLoading();
        },
        error: (error: Error) => {
          console.error("Error parsing CSV:", error.message);
          stopLoading();
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching CSV:", error.message);
      }
      stopLoading();
    }
  };

  useEffect(() => {
    startLoading();
    fetchData();

    const intervalId = setInterval(() => {
      startLoading();
      fetchData();
    }, 180000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return { jsonData };
};
