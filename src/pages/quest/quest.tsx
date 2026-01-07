import { useState, useEffect } from "react";
import { GameButton } from "../../components/GameButton/GameButton";
import { SVGMap } from "../../components/Map";
import { ConfigDemo } from "../../components/ConfigDemo/ConfigDemo";
import { IMapTaskPosition } from "../../consts";
import { useLoading } from "../../context/LoadingContext";
import { useUIConfig } from "../../context/UIConfigContext";
import { usersDataMapper } from "../../helpers/userDataMapper";
import { useQuestData } from "../../hooks/useQuestData";
import { useAuthContext } from "../../auth/AuthContext";

export const Quest = () => {
  const { user } = useAuthContext();
  const { jsonData } = useQuestData();
  const { uiConfig, isLoading: uiConfigLoading, error: uiConfigError } = useUIConfig();

  const [mappedData, setMappedData] = useState<IMapTaskPosition[]>();

  const [isGameButtonVisible, setIsGameButtonVisible] = useState(true);
  const { loading } = useLoading();

  // Authentication is now handled by ProtectedRoute wrapper
  // No need for auth redirect logic here

  useEffect(() => {
    if (jsonData && user?.profile && uiConfig) {
      const mapped = usersDataMapper(jsonData, user?.profile, uiConfig.steps.positions);
      setMappedData(mapped);
    } else if (jsonData && jsonData.length === 0) {
      // Set to empty array when jsonData is explicitly empty
      setMappedData([]);
    }
  }, [jsonData, user?.profile, uiConfig]);

  // Show error if UI config failed to load
  if (uiConfigError) {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1 style={{ color: "#d32f2f" }}>❌ UI Configuration Error</h1>
        <p style={{ color: "#666" }}>The UI configuration failed to load.</p>
        <pre style={{ background: "#f5f5f5", padding: "15px", borderRadius: "4px", overflow: "auto" }}>
          {uiConfigError}
        </pre>
        <p style={{ color: "#666", marginTop: "20px" }}>
          Please check the UI configuration in <code>/ui-configs/</code> and ensure it is valid.
        </p>
      </div>
    );
  }

  // Show loading while UI config is loading
  if (uiConfigLoading || !uiConfig) {
    return <div>Loading UI configuration...</div>;
  }

  return (
    <div>
      <img
        src={uiConfig.map.background}
        style={{
          height: "100%",
          width: "100%",
        }}
      />

      {isGameButtonVisible && <GameButton />}
      <SVGMap
        tableData={mappedData}
        loading={loading}
        setIsGameButtonVisible={setIsGameButtonVisible}
      />
      <ConfigDemo />
    </div>
  );
};
