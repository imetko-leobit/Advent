/**
 * Configuration Demo Component
 * 
 * Demonstrates dynamic configuration and data source switching capabilities
 * This component is for development/demo purposes and can be imported in any page
 */

import React, { useState, useMemo } from "react";
import { useConfig } from "../../context/ConfigContext";
import { useDataSource } from "../../hooks/useDataSource";
import { useUIConfig } from "../../context/UIConfigContext";
import { DataSourceType } from "../../services/types";
import { discoverAvailableUIThemes } from "../../services/uiThemeDiscovery";
import { UIConfigJSON } from "../../services/uiConfigSchema";

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

  const {
    uiConfig,
    uiConfigRaw,
    isLoading: uiLoading,
    error: uiError,
    configKey: currentUITheme,
    switchConfig: switchUITheme,
    reloadConfig,
  } = useUIConfig();

  const [showDemo, setShowDemo] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["theme"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [localConfig, setLocalConfig] = useState<UIConfigJSON | null>(null);

  // Discover available UI themes
  const availableThemes = useMemo(() => discoverAvailableUIThemes(), []);

  // Initialize local config when uiConfigRaw changes
  React.useEffect(() => {
    if (uiConfigRaw) {
      setLocalConfig(JSON.parse(JSON.stringify(uiConfigRaw)));
    }
  }, [uiConfigRaw]);

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

  const handleUIThemeChange = async (themeName: string) => {
    await switchUITheme(themeName);
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleConfigChange = (path: string[], value: any) => {
    if (!localConfig) return;

    const newConfig = JSON.parse(JSON.stringify(localConfig));
    let current: any = newConfig;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    setLocalConfig(newConfig);
  };

  const handleApplyChanges = async () => {
    // In a real implementation, this would persist the changes
    // For now, we just reload the config
    await reloadConfig();
    alert("Changes applied! Note: In-place editing requires backend support to persist changes.");
  };

  const handleResetConfig = () => {
    if (uiConfigRaw) {
      setLocalConfig(JSON.parse(JSON.stringify(uiConfigRaw)));
    }
  };

  const filteredConfigKeys = useMemo(() => {
    if (!localConfig || !searchQuery) return [];
    const query = searchQuery.toLowerCase();
    const keys: string[] = [];

    const search = (obj: any, prefix: string = "") => {
      for (const key in obj) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (path.toLowerCase().includes(query)) {
          keys.push(path);
        }
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          search(obj[key], path);
        }
      }
    };

    search(localConfig);
    return keys;
  }, [localConfig, searchQuery]);

  if (!showDemo) {
    return (
      <button
        onClick={() => setShowDemo(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 20px",
          backgroundColor: "#f5f5f5",
          color: "#333",
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: "pointer",
          zIndex: 9999,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "14px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e0e0e0";
          e.currentTarget.style.boxShadow = "0 3px 6px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#f5f5f5";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        }}
      >
        Configuration
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "450px",
        maxHeight: "80vh",
        overflowY: "auto",
        backgroundColor: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: "4px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 9999,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#fafafa",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#333" }}>
          Configuration Manager
        </h3>
        <button
          onClick={() => setShowDemo(false)}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "#666",
            padding: "4px 8px",
            borderRadius: "4px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e0e0e0"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          ×
        </button>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Search/Filter */}
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Search configuration items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: "13px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#999"}
            onBlur={(e) => e.currentTarget.style.borderColor = "#ddd"}
          />
          {searchQuery && filteredConfigKeys.length > 0 && (
            <div style={{
              marginTop: "8px",
              padding: "8px",
              backgroundColor: "#f9f9f9",
              borderRadius: "4px",
              fontSize: "12px",
              maxHeight: "150px",
              overflowY: "auto",
            }}>
              <div style={{ fontWeight: 600, marginBottom: "4px", color: "#666" }}>
                Found {filteredConfigKeys.length} matches:
              </div>
              {filteredConfigKeys.slice(0, 10).map((key, i) => (
                <div key={i} style={{ padding: "2px 0", color: "#333" }}>
                  {key}
                </div>
              ))}
              {filteredConfigKeys.length > 10 && (
                <div style={{ color: "#999", marginTop: "4px" }}>
                  ... and {filteredConfigKeys.length - 10} more
                </div>
              )}
            </div>
          )}
        </div>

        {/* UI Theme Section */}
        <ConfigSection
          title="UI Theme"
          isExpanded={expandedSections.has("theme")}
          onToggle={() => toggleSection("theme")}
        >
          <div style={{ marginBottom: "12px" }}>
            <Label>Current Theme</Label>
            <select
              value={currentUITheme}
              onChange={(e) => handleUIThemeChange(e.target.value)}
              disabled={uiLoading}
              style={selectStyle(uiLoading)}
            >
              {availableThemes.map((theme) => (
                <option key={theme.name} value={theme.name}>
                  {theme.displayTitle}
                </option>
              ))}
            </select>
          </div>

          {localConfig && (
            <>
              <div style={{ marginBottom: "12px" }}>
                <Label>Primary Color</Label>
                <ColorInput
                  value={localConfig.theme?.palette?.primary || "#6366F1"}
                  onChange={(val) => handleConfigChange(["theme", "palette", "primary"], val)}
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <Label>Secondary Color</Label>
                <ColorInput
                  value={localConfig.theme?.palette?.secondary || "#8B5CF6"}
                  onChange={(val) => handleConfigChange(["theme", "palette", "secondary"], val)}
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <Label>Accent Color</Label>
                <ColorInput
                  value={localConfig.theme?.palette?.accent || "#EC4899"}
                  onChange={(val) => handleConfigChange(["theme", "palette", "accent"], val)}
                />
              </div>
            </>
          )}

          {uiLoading && <StatusText color="#666">Loading theme...</StatusText>}
          {uiError && <ErrorBox>{uiError}</ErrorBox>}
        </ConfigSection>

        {/* Animations Section */}
        {localConfig?.animations && (
          <ConfigSection
            title="Animations"
            isExpanded={expandedSections.has("animations")}
            onToggle={() => toggleSection("animations")}
          >
            <div style={{ marginBottom: "12px" }}>
              <Label>Character Animation</Label>
              <Toggle
                checked={localConfig.animations.character?.enabled || false}
                onChange={(val) => handleConfigChange(["animations", "character", "enabled"], val)}
                label="Enabled"
              />
            </div>
            {localConfig.animations.stars && (
              <div style={{ marginBottom: "8px", fontSize: "13px", color: "#666" }}>
                Stars: {localConfig.animations.stars.length} configured
              </div>
            )}
            {localConfig.animations.clouds && (
              <div style={{ marginBottom: "8px", fontSize: "13px", color: "#666" }}>
                Clouds: {localConfig.animations.clouds.length} configured
              </div>
            )}
          </ConfigSection>
        )}

        {/* Quest Configuration Section */}
        <ConfigSection
          title="Quest Configuration"
          isExpanded={expandedSections.has("quest")}
          onToggle={() => toggleSection("quest")}
        >
          <InfoRow label="Quest Name" value={questConfig.name} />
          <InfoRow label="Task Count" value={questConfig.taskCount.toString()} />
          
          {configLoading && <StatusText color="#666">Loading config...</StatusText>}
          
          {configErrors.length > 0 && (
            <ErrorBox>
              <strong>Errors:</strong>
              <ul style={{ margin: "4px 0", paddingLeft: "20px", fontSize: "12px" }}>
                {configErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </ErrorBox>
          )}
          
          {configWarnings.length > 0 && (
            <WarningBox>
              <strong>Warnings:</strong>
              <ul style={{ margin: "4px 0", paddingLeft: "20px", fontSize: "12px" }}>
                {configWarnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </WarningBox>
          )}

          <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Button onClick={handleLoadExampleConfig} disabled={configLoading}>
              Load Example
            </Button>
            <Button onClick={resetToDefaults} variant="secondary">
              Reset
            </Button>
          </div>
        </ConfigSection>

        {/* Data Source Section */}
        <ConfigSection
          title="Data Source"
          isExpanded={expandedSections.has("datasource")}
          onToggle={() => toggleSection("datasource")}
        >
          <InfoRow label="Current Source" value={currentSourceType || "None"} />
          <InfoRow label="Data Count" value={currentData.length.toString()} />
          
          {dataLoading && <StatusText color="#666">Loading data...</StatusText>}
          {dataError && <ErrorBox>{dataError}</ErrorBox>}

          <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Button onClick={handleSwitchToMock} disabled={dataLoading}>
              Mock CSV
            </Button>
            <Button onClick={handleSwitchToGoogleSheets} disabled={dataLoading}>
              Google Sheets
            </Button>
            <Button 
              onClick={refreshData} 
              disabled={dataLoading || !currentSourceType}
              variant="secondary"
            >
              Refresh
            </Button>
          </div>
        </ConfigSection>

        {/* Action Buttons */}
        <div style={{
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: "1px solid #e0e0e0",
          display: "flex",
          gap: "8px",
        }}>
          <Button onClick={handleApplyChanges} style={{ flex: 1 }}>
            Apply Changes
          </Button>
          <Button onClick={handleResetConfig} variant="secondary" style={{ flex: 1 }}>
            Reset to Current
          </Button>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const ConfigSection: React.FC<{
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, isExpanded, onToggle, children }) => (
  <div style={{
    marginBottom: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    overflow: "hidden",
  }}>
    <button
      onClick={onToggle}
      style={{
        width: "100%",
        padding: "12px",
        backgroundColor: "#fafafa",
        border: "none",
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "14px",
        fontWeight: 600,
        color: "#333",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fafafa"}
    >
      <span>{title}</span>
      <span style={{ fontSize: "12px", color: "#666" }}>
        {isExpanded ? "▼" : "▶"}
      </span>
    </button>
    {isExpanded && (
      <div style={{ padding: "12px", backgroundColor: "#fff" }}>
        {children}
      </div>
    )}
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{
    display: "block",
    fontSize: "12px",
    fontWeight: 500,
    color: "#666",
    marginBottom: "4px",
  }}>
    {children}
  </label>
);

const selectStyle = (disabled: boolean = false) => ({
  width: "100%",
  padding: "8px",
  fontSize: "13px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  backgroundColor: disabled ? "#f5f5f5" : "white",
  cursor: disabled ? "not-allowed" : "pointer",
  outline: "none",
  transition: "border-color 0.2s",
});

const ColorInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "40px",
        height: "32px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        flex: 1,
        padding: "6px 8px",
        fontSize: "13px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        outline: "none",
      }}
    />
  </div>
);

const Toggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}> = ({ checked, onChange, label }) => (
  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: "40px",
        height: "20px",
        backgroundColor: checked ? "#4CAF50" : "#ccc",
        borderRadius: "10px",
        position: "relative",
        transition: "background-color 0.2s",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: "16px",
          height: "16px",
          backgroundColor: "white",
          borderRadius: "50%",
          position: "absolute",
          top: "2px",
          left: checked ? "22px" : "2px",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </div>
    <span style={{ fontSize: "13px", color: "#333" }}>{label}</span>
  </label>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ marginBottom: "8px", fontSize: "13px" }}>
    <span style={{ color: "#666", fontWeight: 500 }}>{label}:</span>{" "}
    <span style={{ color: "#333" }}>{value}</span>
  </div>
);

const StatusText: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <p style={{ fontSize: "13px", color, margin: "8px 0" }}>{children}</p>
);

const ErrorBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    padding: "8px",
    borderRadius: "4px",
    marginTop: "8px",
    fontSize: "12px",
    color: "#991b1b",
  }}>
    {children}
  </div>
);

const WarningBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    backgroundColor: "#fffbeb",
    border: "1px solid #fef3c7",
    padding: "8px",
    borderRadius: "4px",
    marginTop: "8px",
    fontSize: "12px",
    color: "#92400e",
  }}>
    {children}
  </div>
);

const Button: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ onClick, disabled = false, variant = "primary", children, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "8px 12px",
      fontSize: "13px",
      border: variant === "primary" ? "none" : "1px solid #ddd",
      borderRadius: "4px",
      backgroundColor: disabled 
        ? "#f5f5f5" 
        : variant === "primary" 
          ? "#333" 
          : "white",
      color: disabled 
        ? "#999" 
        : variant === "primary" 
          ? "white" 
          : "#333",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s",
      fontWeight: 500,
      ...style,
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = variant === "primary" ? "#555" : "#f5f5f5";
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = variant === "primary" ? "#333" : "white";
      }
    }}
  >
    {children}
  </button>
);
