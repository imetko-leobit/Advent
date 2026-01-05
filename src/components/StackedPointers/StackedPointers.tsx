import { FC, RefObject, useEffect, useState } from "react";
import { UserPointer } from "./UserPointer";
import { motion } from "framer-motion";
import { IMapTaskPosition, IUserInGroupData } from "../../consts";
import { useAuth } from "react-oidc-context";
import { finishScreenService, userProgressService } from "../../domain";

interface IProps {
  stackedPointersRef: RefObject<HTMLDivElement>;
  hoverIndex: number;
  groupIndex: number;
  isHover: boolean;
  group: IMapTaskPosition;
  setFinishScreenType: (value: string) => void;
  parentDivHeight: number;
  parentDivWidth: number;
  setLoggedUserTaskNumber: (value: number) => void;
  finishCoordinates: { top: string; left: string };
}

export const StackedPointers: FC<IProps> = ({
  stackedPointersRef,
  hoverIndex,
  groupIndex,
  isHover,
  group,
  parentDivHeight,
  parentDivWidth,
  setFinishScreenType,
  setLoggedUserTaskNumber,
  finishCoordinates,
}) => {
  const { user } = useAuth();
  const [usersWithoutLoggedUser, setUsersWithoutLoggedUser] = useState<
    IUserInGroupData[]
  >([]);
  const [loggedUser, setLoggedUser] = useState<IUserInGroupData>();

  const filterUserPointers = () => {
    const loggedUserId = user?.profile.sub;
    if (!loggedUserId) return;

    const shouldSeparate = finishScreenService.isSpecialTask(group.taskNumber);
    const { regularUsers, loggedUser: foundLoggedUser } = 
      userProgressService.filterUsersAtPosition(
        group.users,
        loggedUserId,
        shouldSeparate
      );

    setUsersWithoutLoggedUser(regularUsers);
    setLoggedUser(foundLoggedUser);
  };

  useEffect(() => {
    if (group.users.length > 0) {
      filterUserPointers();
    }
  }, [group.users]);

  return (
    <motion.div
      ref={stackedPointersRef}
      transition={{ duration: 0.2 }}
      animate={{
        zIndex: hoverIndex === groupIndex && isHover ? 20 : 2,
      }}
      style={{
        position: "absolute",
        left: `${group.cxPointers}%`,
        top: `${group.cyPointers}%`,
        height: "8%",
        width: "4%",
      }}
    >
      {usersWithoutLoggedUser.map((u, index) => (
        <UserPointer
          key={u.email}
          currentUserId={user?.profile.sub}
          user={u}
          index={index}
          isHover={
            hoverIndex === groupIndex && isHover && group.users.length < 6
          }
          totalCount={usersWithoutLoggedUser.length}
          parentDivHeight={parentDivHeight}
          parentDivWidth={parentDivWidth}
          setFinishScreenType={setFinishScreenType}
          finishCoordinates={finishCoordinates}
          setLoggedUserTaskNumber={setLoggedUserTaskNumber}
        />
      ))}
      {loggedUser && (
        <UserPointer
          key={loggedUser.email}
          currentUserId={user?.profile.sub}
          user={loggedUser}
          index={0}
          isHover={
            hoverIndex === groupIndex && isHover && group.users.length < 6
          }
          totalCount={1}
          parentDivHeight={parentDivHeight}
          parentDivWidth={parentDivWidth}
          setFinishScreenType={setFinishScreenType}
          finishCoordinates={finishCoordinates}
          setLoggedUserTaskNumber={setLoggedUserTaskNumber}
        />
      )}
    </motion.div>
  );
};
