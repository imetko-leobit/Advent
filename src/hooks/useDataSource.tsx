/**
 * Dynamic Data Source Hook
 * 
 * Enables runtime switching between different data sources
 * Supports Mock CSV, Google Sheets, and API providers
 */

import { useState, useCallback, useRef } from "react";
import { IRowData } from "../consts";
import { DataSourceType, QuestDataProvider } from "../services/types";
import { MockCSVProvider, GoogleSheetsProvider, APIProvider } from "../services/providers";
import { createQuestDataServiceWithProvider } from "../services/questDataServiceFactory";
import { IQuestDataService } from "../services/types";
import { logger } from "../utils/logger";

/**
 * Data source configuration
 */
export interface DataSourceConfig {
  type: DataSourceType;
  url: string;
  headers?: Record<string, string>; // For API provider
  pollingIntervalMs?: number;
}

/**
 * Hook for dynamic data source management
 */
export const useDataSource = () => {
  const [currentData, setCurrentData] = useState<IRowData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSourceType, setCurrentSourceType] = useState<DataSourceType | null>(null);
  
  const serviceRef = useRef<IQuestDataService | null>(null);

  /**
   * Create a provider based on configuration
   */
  const createProvider = useCallback((config: DataSourceConfig): QuestDataProvider => {
    switch (config.type) {
      case DataSourceType.MOCK_CSV:
        return new MockCSVProvider(config.url);
      case DataSourceType.GOOGLE_SHEETS:
        return new GoogleSheetsProvider(config.url);
      case DataSourceType.API:
        return new APIProvider(config.url, {
          headers: config.headers,
          timeout: config.pollingIntervalMs,
        });
      default:
        throw new Error(`Unsupported data source type: ${config.type}`);
    }
  }, []);

  /**
   * Switch to a new data source
   */
  const switchDataSource = useCallback(
    async (config: DataSourceConfig): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        // Stop existing service if any
        if (serviceRef.current) {
          serviceRef.current.stopPolling();
        }

        logger.info("useDataSource", `Switching to ${config.type} data source`);

        // Create new provider and service
        const provider = createProvider(config);
        const service = createQuestDataServiceWithProvider(provider, {
          pollingIntervalMs: config.pollingIntervalMs,
        });

        serviceRef.current = service;
        setCurrentSourceType(config.type);

        // Start polling with the new service
        service.startPolling((data: IRowData[]) => {
          setCurrentData(data);
          setIsLoading(false);
          logger.info("useDataSource", `Data updated: ${data.length} records`);
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setIsLoading(false);
        logger.error("useDataSource", "Failed to switch data source", err);
      }
    },
    [createProvider]
  );

  /**
   * Manually refresh data from current source
   */
  const refreshData = useCallback(async (): Promise<void> => {
    if (!serviceRef.current) {
      logger.warn("useDataSource", "No active data source to refresh");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await serviceRef.current.fetchData();
      setCurrentData(data);
      logger.info("useDataSource", `Data refreshed: ${data.length} records`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      logger.error("useDataSource", "Failed to refresh data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Stop current data source polling
   */
  const stopPolling = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stopPolling();
      logger.info("useDataSource", "Polling stopped");
    }
  }, []);

  return {
    currentData,
    isLoading,
    error,
    currentSourceType,
    switchDataSource,
    refreshData,
    stopPolling,
  };
};
