import { useState, useEffect } from "react";
import { uiConfig } from "../../config";
import { GameButton } from "../../components/GameButton/GameButton";
import { SVGMap } from "../../components/Map";
import { IMapTaskPosition } from "../../consts";
import { useLoading } from "../../context/LoadingContext";
import { usersDataMapper } from "../../helpers/userDataMapper";
import { useQuestData } from "../../hooks/useQuestData";
import { useAuthContext } from "../../auth/AuthContext";
import { ConfigDemo } from "../../components/ConfigDemo/ConfigDemo";

export const Quest = () => {
  const { user } = useAuthContext();
  const { jsonData } = useQuestData();

  const [mappedData, setMappedData] = useState<IMapTaskPosition[]>();

  const [isGameButtonVisible, setIsGameButtonVisible] = useState(true);
  const { loading } = useLoading();

  // Authentication is now handled by ProtectedRoute wrapper
  // No need for auth redirect logic here

  useEffect(() => {
    if (jsonData && user?.profile) {
      const mapped = usersDataMapper(jsonData, user?.profile);
      setMappedData(mapped);
    } else if (jsonData && jsonData.length === 0) {
      // Set to empty array when jsonData is explicitly empty
      setMappedData([]);
    }
  }, [jsonData, user?.profile]);

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
