import { FC, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { IUserInGroupData } from "../../consts";
import { uiConfig, questConfig } from "../../config";
import { UserTooltip } from "../UserTooltip/UserTooltip";
import { useLoading } from "../../context/LoadingContext";
import { calcPointerHoverPosition } from "../../helpers/calculateHoverPostion";
import { questEngine } from "../../domain";

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
  const { taskNumber, name, imageUrl, socialNetworkPoint, id } = user;
  const initialPosition =
    totalCount < 10 ? { left: `${index * 10}px` } : { left: `${index * 2}px` };

  const loggedUser = currentUserId === id;

  // Use QuestEngine to determine if user should move to finish
  const moveLoggedUserToFinish =
    loggedUser &&
    finishCoordinates &&
    questEngine.isSpecialTask(taskNumber);

  const handleFinishScreenType = useCallback(() => {
    if (!loggedUser || !id) return;

    // Use QuestEngine to get finish screen configuration
    const userProgress = {
      taskNumber,
      id,
      email: user.email,
      name,
      socialNetworkPoint,
    };
    
    const finishConfig = questEngine.getFinishState(userProgress, loggedUser);

    if (finishConfig.shouldShow) {
      setFinishScreenType(finishConfig.type);
      // Set task number for first finish task to track animation
      if (finishConfig.taskNumber === questConfig.firstFinishTaskId) {
        setLoggedUserTaskNumber(finishConfig.taskNumber);
      }
    }
  }, [loggedUser, taskNumber]);

  useEffect(() => {
    handleFinishScreenType();
    stopLoading();
  }, [handleFinishScreenType, loggedUser, stopLoading, taskNumber]);

  const showNameTooltip = isTooltipVisible && name && index < uiConfig.pointers.maxVisibleInTooltip;

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
          src={imageUrl}
          alt={`${currentUserId} avatar`}
          style={{
            position: "absolute",
            left: "40%",
            top: `28%`,
            borderRadius: "100%",
            height: parentDivHeight ? parentDivHeight / 1.6 : "",
            zIndex:
              loggedUser && questEngine.isSpecialTask(taskNumber)
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
            uiConfig.pointers.colored[socialNetworkPoint][
              index % uiConfig.pointers.colored[0].length
            ]
          }
          style={{
            position: "absolute",
            height: parentDivHeight * 1.6,
            width: parentDivWidth * 1.6,
            zIndex:
              loggedUser && questEngine.isSpecialTask(taskNumber)
                ? index + 100
                : index,
          }}
        />
      </div>
    </motion.div>
  );
};
