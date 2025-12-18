import { useState, useEffect } from "react";
import Papa from "papaparse";
import { useLoading } from "../context/LoadingContext";
import { IRowData } from "../consts";

export const useQuestData = () => {
  const [jsonData, setJsonData] = useState<IRowData[]>([]);
  const { stopLoading, startLoading } = useLoading();

  const fetchData = async () => {
    const response = await fetch(import.meta.env.VITE_GOOGLE_SHEET_URL);
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
