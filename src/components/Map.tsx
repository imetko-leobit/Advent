import { FC, useEffect, useRef, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { motion } from "framer-motion";

import { IMapTaskPosition } from "../consts";
import { FinishScreen } from "./FinishScreen/FinishScreen";
import { useLoading } from "../context/LoadingContext";
import { uiConfig } from "../config";
import { Stars } from "./Animation/Stars/Stars";
import { Clouds } from "./Animation/Clouds/Clouds";
import { Girl } from "./Animation/Girl/Girl";
import { PointersModal } from "./PointersModal/PointersModal";
import { Step } from "./Step/Step";
import { StackedPointers } from "./StackedPointers/StackedPointers";
import { finishScreenService } from "../domain";
import { MapRenderer, MapPosition } from "./MapRenderer";

interface IProps {
  tableData?: IMapTaskPosition[];
  loading?: boolean;
  setLoading?: (value: boolean) => void;
  setIsGameButtonVisible: (value: boolean) => void;
}

export const SVGMap: FC<IProps> = ({ tableData, setIsGameButtonVisible }) => {
  const { loading } = useLoading();

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
    const coordinates = finishScreenService.getFinishAnimationCoordinates(
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

  return (
    <>
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
      <MapRenderer
        mapImage={uiConfig.map.mapSvg}
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
                group.users.length > 5 && (
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
                if (group.users.length > 5) {
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
    </>
  );
};
