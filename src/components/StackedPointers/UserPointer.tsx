import { FC, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { IUserInGroupData } from "../../consts";
import { coloredPointers } from "../../consts/colors";
import { UserTooltip } from "../UserTooltip/UserTooltip";
import { useLoading } from "../../context/LoadingContext";
import { calcPointerHoverPosition } from "../../helpers/calculateHoverPostion";
import { 
  getFinishScreenType, 
  triggersFinishScreen,
  isFirstFinishMilestone 
} from "../../domain/questRules";

interface IProps {
  currentUserId?: string;
  user: IUserInGroupData;
  index: number;
  isHover: boolean;
  totalCount: number;
  setFinishScreenType: (value: string) => void;
  parentDivHeight: number;
  parentDivWidth: number;
  finishCoordinates?: { top: string; left: string };
  setLoggedUserTaskNumber: (value: number) => void;
}

export const UserPointer: FC<IProps> = ({
  currentUserId,
  user,
  index,
  isHover,
  totalCount,
  setFinishScreenType,
  parentDivHeight,
  parentDivWidth,
  finishCoordinates,
  setLoggedUserTaskNumber,
}) => {
  const { stopLoading } = useLoading();
  const pointerRef = useRef<HTMLDivElement>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState(user.imageUrl);
  const { taskNumber, name, imageUrl, socialNetworkPoint, id } = user;

  const handleImageError = () => {
    // Use fallback avatar if image fails to load
    setImgSrc("/fallback-avatar.svg");
  };
  const initialPosition =
    totalCount < 10 ? { left: `${index * 10}px` } : { left: `${index * 2}px` };

  const loggedUser = currentUserId === id;

  const moveLoggedUserToFinish =
    loggedUser &&
    finishCoordinates &&
    triggersFinishScreen(user.taskNumber);

  const handleFinishScreenType = useCallback(() => {
    if (!loggedUser) {
      return;
    }

    const finishType = getFinishScreenType(taskNumber);
    if (finishType) {
      setFinishScreenType(finishType);
      
      // Track when user reaches first milestone
      if (isFirstFinishMilestone(taskNumber)) {
        setLoggedUserTaskNumber(taskNumber);
      }
    }
  }, [loggedUser, taskNumber, setFinishScreenType, setLoggedUserTaskNumber]);

  useEffect(() => {
    handleFinishScreenType();
    stopLoading();
  }, [handleFinishScreenType, loggedUser, stopLoading, taskNumber]);

  const showNameTooltip = isTooltipVisible && name && index < 5;

  return (
    <motion.div
      ref={pointerRef}
      key={imageUrl}
      animate={
        moveLoggedUserToFinish
          ? finishCoordinates
          : isHover
          ? calcPointerHoverPosition(index, parentDivWidth, totalCount)
          : initialPosition
      }
      transition={{
        duration: moveLoggedUserToFinish ? 2 : 0.3,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        height: parentDivHeight * 1.5,
        width: parentDivWidth * 0.9,
      }}
    >
      <div>
        <motion.img
          src={imgSrc}
          alt={`${currentUserId} avatar`}
          onError={handleImageError}
          style={{
            position: "absolute",
            left: "40%",
            top: `28%`,
            borderRadius: "100%",
            height: parentDivHeight ? parentDivHeight / 1.6 : "",
            zIndex:
              loggedUser && triggersFinishScreen(taskNumber)
                ? index + 101
                : index + 1,
          }}
          onHoverStart={() => setIsTooltipVisible(true)}
          onHoverEnd={() => setIsTooltipVisible(false)}
        />
        {showNameTooltip && (
          <UserTooltip isLoggedUser={loggedUser} name={name} />
        )}
        <img
          src={
            coloredPointers[socialNetworkPoint][
              index % coloredPointers[0].length
            ]
          }
          style={{
            position: "absolute",
            height: parentDivHeight * 1.6,
            width: parentDivWidth * 1.6,
            zIndex:
              loggedUser && triggersFinishScreen(taskNumber)
                ? index + 100
                : index,
          }}
        />
      </div>
    </motion.div>
  );
};
