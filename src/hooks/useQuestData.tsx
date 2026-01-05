import { useState, useEffect, useRef } from "react";
import { useLoading } from "../context/LoadingContext";
import { IRowData } from "../consts";
import { createQuestDataService } from "../services";
import { IQuestDataService } from "../services/types";

export const useQuestData = () => {
  const [jsonData, setJsonData] = useState<IRowData[]>([]);
  const { stopLoading, startLoading } = useLoading();
  const serviceRef = useRef<IQuestDataService | null>(null);

  useEffect(() => {
    // Create service instance on mount
    if (!serviceRef.current) {
      serviceRef.current = createQuestDataService();
    }

    const service = serviceRef.current;

    // Start loading and begin polling
    startLoading();

    service.startPolling((data: IRowData[]) => {
      setJsonData(data);
      stopLoading();
    });

    // Cleanup: stop polling on unmount
    return () => {
      service.stopPolling();
    };
  }, []);

  return { jsonData };
};
