import { FC } from "react";
import { motion } from "framer-motion";
import { uiConfig } from "../../config";
import { IMapTaskPosition, IUserInGroupData } from "../../consts";
import { useAuth } from "react-oidc-context";

interface IProps {
  group: IMapTaskPosition;
  groupIndex: number;
}

export const Step: FC<IProps> = ({ group, groupIndex }) => {
  const { user } = useAuth();
  const hoverAnimation = {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    scale: 1.1,
    transition: {
      duration: 0.5,
      type: "linear",
    },
  };

  // Get step shadow based on configuration
  const stepShadow = groupIndex < uiConfig.steps.shadow.greenThreshold 
    ? uiConfig.steps.shadow.green 
    : uiConfig.steps.shadow.purple;

  // Check if the current user is at this position
  const isUserAtThisPosition = user?.profile?.sub && group.users
    ? group.users.find((u: IUserInGroupData) => u.id === user.profile.sub)
    : false;

  return (
    <div>
      {group.taskNumber !== 0 && (
        <motion.div
          initial={{
            backgroundColor: "rgba(0, 0, 0, 0)",
            border: "1px transparent",
          }}
          style={{
            position: "absolute",
            left: `${group.cxStep}%`,
            top: `${group.cyStep}%`,
            height: "7%",
            cursor: "pointer",
            borderRadius: "50px",
          }}
          whileHover={hoverAnimation}
        >
          <img
            src={uiConfig.steps.images[groupIndex]}
            style={{
              position: "relative",
              height: "100%",
              top: 3,
              zIndex: 1,
            }}
          />
          {groupIndex !== 0 && isUserAtThisPosition && (
              <>
                <motion.img
                  src={stepShadow}
                  style={{
                    position: "absolute",
                    height: "120%",
                    width: "120%",
                    left: "-10%",
                    top: "-10%",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    ease: "linear",
                    duration: 3,
                    delay: 1,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />

                <motion.img
                  src={stepShadow}
                  style={{
                    position: "absolute",
                    height: "140%",
                    width: "140%",
                    left: "-20%",
                    top: "-20%",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    ease: "linear",
                    duration: 2,
                    delay: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              </>
            )}
        </motion.div>
      )}
    </div>
  );
};
