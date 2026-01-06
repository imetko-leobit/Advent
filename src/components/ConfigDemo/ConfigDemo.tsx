/**
 * Configuration Demo Component
 * 
 * Demonstrates dynamic configuration and data source switching capabilities
 * This component is for development/demo purposes and can be imported in any page
 */

import React, { useState } from "react";
import { useConfig } from "../../context/ConfigContext";
import { useDataSource } from "../../hooks/useDataSource";
import { DataSourceType } from "../../services/types";

export const ConfigDemo: React.FC = () => {
  const {
    questConfig,
    isLoading: configLoading,
    errors: configErrors,
    warnings: configWarnings,
    loadQuestConfigFromJSON,
    resetToDefaults,
  } = useConfig();

  const {
    currentData,
    isLoading: dataLoading,
    error: dataError,
    currentSourceType,
    switchDataSource,
    refreshData,
  } = useDataSource();

  const [showDemo, setShowDemo] = useState(false);

  const handleLoadExampleConfig = async () => {
    await loadQuestConfigFromJSON("/example-quest-config.json");
  };

  const handleSwitchToMock = async () => {
    await switchDataSource({
      type: DataSourceType.MOCK_CSV,
      url: "/mock-quest-data.csv",
    });
  };

  const handleSwitchToGoogleSheets = async () => {
    const url = import.meta.env.VITE_GOOGLE_SHEET_URL;
    if (!url) {
      alert("VITE_GOOGLE_SHEET_URL not configured");
      return;
    }
    await switchDataSource({
      type: DataSourceType.GOOGLE_SHEETS,
      url,
    });
  };

  if (!showDemo) {
    return (
      <button
        onClick={() => setShowDemo(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          zIndex: 9999,
        }}
      >
        🎮 Show Config Demo
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "400px",
        maxHeight: "600px",
        overflowY: "auto",
        backgroundColor: "white",
        border: "2px solid #4CAF50",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        padding: "20px",
        zIndex: 9999,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h3 style={{ margin: 0 }}>🎮 Configuration Demo</h3>
        <button
          onClick={() => setShowDemo(false)}
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ marginTop: 0 }}>Quest Configuration</h4>
        <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
          <strong>Current Quest:</strong> {questConfig.name}
        </p>
        <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
          <strong>Task Count:</strong> {questConfig.taskCount}
        </p>
        {configLoading && (
          <p style={{ fontSize: "14px", color: "#2196F3" }}>Loading config...</p>
        )}
        {configErrors.length > 0 && (
          <div
            style={{
              backgroundColor: "#ffebee",
              padding: "10px",
              borderRadius: "4px",
              marginTop: "10px",
            }}
          >
            <strong style={{ color: "#c62828" }}>Errors:</strong>
            <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
              {configErrors.map((error, i) => (
                <li key={i} style={{ fontSize: "12px", color: "#c62828" }}>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
        {configWarnings.length > 0 && (
          <div
            style={{
              backgroundColor: "#fff3e0",
              padding: "10px",
              borderRadius: "4px",
              marginTop: "10px",
            }}
          >
            <strong style={{ color: "#ef6c00" }}>Warnings:</strong>
            <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
              {configWarnings.map((warning, i) => (
                <li key={i} style={{ fontSize: "12px", color: "#ef6c00" }}>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={handleLoadExampleConfig}
            disabled={configLoading}
            style={{
              padding: "8px 16px",
              marginRight: "10px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: configLoading ? "not-allowed" : "pointer",
              fontSize: "12px",
            }}
          >
            Load Example Config
          </button>
          <button
            onClick={resetToDefaults}
            style={{
              padding: "8px 16px",
              backgroundColor: "#9E9E9E",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ marginTop: 0 }}>Data Source</h4>
        <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
          <strong>Current Source:</strong> {currentSourceType || "None"}
        </p>
        <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
          <strong>Data Count:</strong> {currentData.length}
        </p>
        {dataLoading && (
          <p style={{ fontSize: "14px", color: "#2196F3" }}>Loading data...</p>
        )}
        {dataError && (
          <div
            style={{
              backgroundColor: "#ffebee",
              padding: "10px",
              borderRadius: "4px",
              marginTop: "10px",
            }}
          >
            <strong style={{ color: "#c62828" }}>Error:</strong>
            <p style={{ fontSize: "12px", color: "#c62828", margin: "5px 0" }}>
              {dataError}
            </p>
          </div>
        )}
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={handleSwitchToMock}
            disabled={dataLoading}
            style={{
              padding: "8px 16px",
              marginRight: "10px",
              marginBottom: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: dataLoading ? "not-allowed" : "pointer",
              fontSize: "12px",
            }}
          >
            Mock CSV
          </button>
          <button
            onClick={handleSwitchToGoogleSheets}
            disabled={dataLoading}
            style={{
              padding: "8px 16px",
              marginBottom: "10px",
              backgroundColor: "#FF9800",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: dataLoading ? "not-allowed" : "pointer",
              fontSize: "12px",
            }}
          >
            Google Sheets
          </button>
          <br />
          <button
            onClick={refreshData}
            disabled={dataLoading || !currentSourceType}
            style={{
              padding: "8px 16px",
              backgroundColor: "#9C27B0",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor:
                dataLoading || !currentSourceType ? "not-allowed" : "pointer",
              fontSize: "12px",
            }}
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#e3f2fd",
          padding: "10px",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#1565c0",
        }}
      >
        <strong>ℹ️ Demo Features:</strong>
        <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
          <li>Load custom quest configurations</li>
          <li>Switch between data sources</li>
          <li>View current configuration state</li>
          <li>Test error handling and fallbacks</li>
        </ul>
        <p style={{ margin: "5px 0" }}>
          See docs/DYNAMIC_CONFIGURATION.md for full documentation.
        </p>
      </div>
    </div>
  );
};
