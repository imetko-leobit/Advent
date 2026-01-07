import { FC, useEffect, useRef, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { motion } from "framer-motion";

import { IMapTaskPosition } from "../consts";
import { FinishScreen } from "./FinishScreen/FinishScreen";
import { useLoading } from "../context/LoadingContext";
import { useUIConfig } from "../context/UIConfigContext";
import { Stars } from "./Animation/Stars/Stars";
import { Clouds } from "./Animation/Clouds/Clouds";
import { Girl } from "./Animation/Girl/Girl";
import { PointersModal } from "./PointersModal/PointersModal";
import { Step } from "./Step/Step";
import { StackedPointers } from "./StackedPointers/StackedPointers";
import { questEngine } from "../domain";
import { MapRenderer, MapPosition } from "./MapRenderer";
import { EmptyState } from "./EmptyState/EmptyState";

interface IProps {
  tableData?: IMapTaskPosition[];
  loading?: boolean;
  setLoading?: (value: boolean) => void;
  setIsGameButtonVisible: (value: boolean) => void;
}

export const SVGMap: FC<IProps> = ({ tableData, setIsGameButtonVisible }) => {
  const { loading } = useLoading();
  const { uiConfig } = useUIConfig();

  const myRef = useRef<HTMLDivElement>(null);
  const stackedPointersRef = useRef<HTMLDivElement>(null);
  const [isHover, setIsHover] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(0);
  const [finishScreenType, setFinishScreenType] = useState("");
  const [firstFinisScreenShow, setFirstFinishScreenShow] = useState(true);
  const [
    userPointerFinishAnimationCoordintes,
    setUserPointerFinishAnimationCoordintes,
  ] = useState({ top: "", left: "" });
  const [loggedUserTaskNumber, setLoggedUserTaskNumber] = useState(0);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const mapIsIntersecting =
        entries[0].isIntersecting && entries.length === 1;
      setIsGameButtonVisible(!mapIsIntersecting);
    });
    if (myRef.current) observer.observe(myRef.current);
  }, [setIsGameButtonVisible]);

  const handleCloseClick = () => {
    // Use QuestEngine to get finish animation coordinates
    const coordinates = questEngine.getFinishAnimationCoordinates(
      finishScreenType,
      loggedUserTaskNumber
    );

    if (coordinates) {
      setUserPointerFinishAnimationCoordintes(coordinates);
    }

    setFinishScreenType("");
    setFirstFinishScreenShow(false);
  };

  // Convert tableData to MapPosition format
  const positions: MapPosition[] = tableData
    ? tableData.map((group) => ({
        id: `${group.taskNumber}`,
        cxPointers: group.cxPointers,
        cyPointers: group.cyPointers,
        cxStep: group.cxStep,
        cyStep: group.cyStep,
      }))
    : [];

  // Show empty state if not loading and no data
  const showEmptyState = !loading && (!tableData || tableData.length === 0);

  // Don't render if uiConfig is not loaded yet
  if (!uiConfig) {
    return null;
  }

  return (
    <>
      {/* Intersection observer target for game button visibility */}
      {/* Note: Kept separate from MapRenderer to maintain existing behavior */}
      {/* This allows the game button to hide/show based on map visibility */}
      <div
        id="quest-map"
        ref={myRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "70%",
          top: "19%",
        }}
      />
      
      {showEmptyState ? (
        <EmptyState
          title="No Quest Data"
          message="No quest progress data is available at the moment. Please check your data source configuration or try refreshing the page."
          icon="🗺️"
        />
      ) : (
        <MapRenderer
          mapImage={uiConfig.map.mapSvg}
          mapAltText="Quest map showing wellness journey progress"
          positions={positions}
          loading={loading}
          loadingIndicator={
            <ProgressSpinner
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              strokeWidth="4"
            />
          }
        overlayContent={
          finishScreenType && firstFinisScreenShow ? (
            <FinishScreen
              screenType={finishScreenType}
              handleCloseClick={handleCloseClick}
            />
          ) : undefined
        }
        renderAtPointers={({ index }) => {
          if (!tableData) return null;
          const group = tableData[index];
          const parentDivWidth = stackedPointersRef.current?.offsetWidth ?? 0;
          const parentDivHeight = stackedPointersRef.current?.offsetHeight ?? 0;

          return (
            <motion.div
              onHoverStart={() => {
                setIsHover(true);
                setHoverIndex(index);
              }}
              onHoverEnd={() => {
                setIsHover(false);
                setHoverIndex(0);
              }}
              key={`pointers_${group.taskNumber}_${index}`}
            >
              {hoverIndex === index &&
                isModalVisible &&
                group.users.length > uiConfig.pointers.maxBeforeModal && (
                  <PointersModal
                    users={group.users}
                    setIsModalVisible={setIsModalVisible}
                  />
                )}

              <StackedPointers
                stackedPointersRef={stackedPointersRef}
                group={group}
                groupIndex={index}
                hoverIndex={hoverIndex}
                isHover={isHover}
                parentDivHeight={parentDivHeight}
                parentDivWidth={parentDivWidth}
                setFinishScreenType={setFinishScreenType}
                finishCoordinates={userPointerFinishAnimationCoordintes}
                setLoggedUserTaskNumber={setLoggedUserTaskNumber}
              />
            </motion.div>
          );
        }}
        renderAtSteps={({ index }) => {
          if (!tableData) return null;
          const group = tableData[index];

          return (
            <div
              onClick={() => {
                if (group.users.length > uiConfig.pointers.maxBeforeModal) {
                  handleOpenModal();
                }
              }}
              key={`step_${group.taskNumber}_${index}`}
            >
              <Step group={group} groupIndex={index} />
            </div>
          );
        }}
      >
        {/* Map decorations/animations */}
        <Stars />
        <Clouds />
        <Girl />
      </MapRenderer>
      )}
    </>
  );
};
