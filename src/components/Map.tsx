import { FC, useEffect, useRef, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { motion } from "framer-motion";

import { IMapTaskPosition, finishScreenTypes } from "../consts";
import { FinishScreen } from "./FinishScreen/FinishScreen";
import { useLoading } from "../context/LoadingContext";
import MapSvg from "../assets/map/Map.svg";
import { Stars } from "./Animation/Stars/Stars";
import { Clouds } from "./Animation/Clouds/Clouds";
import { Girl } from "./Animation/Girl/Girl";
import { PointersModal } from "./PointersModal/PointersModal";
import { Step } from "./Step/Step";
import { StackedPointers } from "./StackedPointers/StackedPointers";

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
    if (finishScreenType === finishScreenTypes.dzen) {
      setUserPointerFinishAnimationCoordintes({
        top: "38%",
        left: "245%",
      });
    }
    if (
      finishScreenType === finishScreenTypes.finish &&
      loggedUserTaskNumber === 9
    ) {
      setUserPointerFinishAnimationCoordintes({
        top: "130%",
        left: "-75%",
      });
    }
    setFinishScreenType("");
    setFirstFinishScreenShow(false);
  };

  return (
    <>
      <div
        style={{
          position: "relative",
        }}
      >
        {finishScreenType && firstFinisScreenShow && (
          <FinishScreen
            screenType={finishScreenType}
            handleCloseClick={handleCloseClick}
          />
        )}
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
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(255, 255, 255, 0.9)",
              zIndex: 30,
            }}
          >
            <ProgressSpinner
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              strokeWidth="4"
            />
          </div>
        )}
        <div>
          <img
            src={MapSvg}
            style={{
              height: "100%",
              width: "100%",
              filter: loading ? "blur(10px)" : "none",
            }}
            alt="Map"
          />
          <Stars />
          <Clouds />
          <Girl />
        </div>
        {tableData &&
          tableData.map((group, groupIndex) => {
            const parentDivWidth = stackedPointersRef.current?.offsetWidth ?? 0;
            const parentDivHeight =
              stackedPointersRef.current?.offsetHeight ?? 0;

            return (
              <motion.div
                onHoverStart={() => {
                  setIsHover(true);
                  setHoverIndex(groupIndex);
                }}
                onHoverEnd={() => {
                  setIsHover(false);
                  setHoverIndex(0);
                }}
                key={`${group.taskNumber}_${groupIndex}`}
              >
                {hoverIndex === groupIndex &&
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
                  groupIndex={groupIndex}
                  hoverIndex={hoverIndex}
                  isHover={isHover}
                  parentDivHeight={parentDivHeight}
                  parentDivWidth={parentDivWidth}
                  setFinishScreenType={setFinishScreenType}
                  finishCoordinates={userPointerFinishAnimationCoordintes}
                  setLoggedUserTaskNumber={setLoggedUserTaskNumber}
                />
                <div
                  onClick={() => {
                    if (group.users.length > 5) {
                      handleOpenModal();
                    }
                  }}
                >
                  <Step group={group} groupIndex={groupIndex} />
                </div>
              </motion.div>
            );
          })}
      </div>
    </>
  );
};
