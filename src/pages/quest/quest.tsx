import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate } from "react-router-dom";
import QuestBackground from "../../assets/background/Quest_background.svg";
import { GameButton } from "../../components/GameButton/GameButton";
import { SVGMap } from "../../components/Map";
import { IMapTaskPosition } from "../../consts";
import { routes } from "../../router";
import { useLoading } from "../../context/LoadingContext";
import { usersDataMapper } from "../../helpers/userDataMapper";
import { useQuestData } from "../../hooks/useQuestData";

export const Quest = () => {
  const { user } = useAuth();
  const { jsonData } = useQuestData();

  const [mappedData, setMappedData] = useState<IMapTaskPosition[]>();

  const [isGameButtonVisible, setIsGameButtonVisible] = useState(true);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { loading } = useLoading();

  useEffect(() => {
    if (!isAuthenticated && !isAuthLoading) {
      const currentPath = window.location.pathname;

      navigate(
        routes.login.path + `?returnUrl=${encodeURIComponent(currentPath)}`
      );
    }
  }, [isAuthenticated, isAuthLoading, location.pathname, navigate]);

  useEffect(() => {
    if (jsonData && user?.profile) {
      const mappedData = usersDataMapper(jsonData, user?.profile);

      setMappedData(mappedData);
    }
  }, [jsonData, user?.profile]);

  return (
    <div>
      <img
        src={QuestBackground}
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
    </div>
  );
};
