import { FC } from "react";
import { motion } from "framer-motion";
import { svgSteps } from "../../consts/svgSteps";
import { IMapTaskPosition, IUserInGroupData } from "../../consts";
import PurpleStepShadow from "../../assets/pointers-shadow/Purple.svg";
import GreenStepShadow from "../../assets/pointers-shadow/Green.svg";
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
            src={svgSteps[groupIndex]}
            style={{
              position: "relative",
              height: "100%",
              top: 3,
              zIndex: 1,
            }}
          />
          {groupIndex !== 0 &&
            group.users.find(
              (u: IUserInGroupData) => u.id === user?.profile.sub
            ) && (
              <>
                <motion.img
                  src={groupIndex < 10 ? GreenStepShadow : PurpleStepShadow}
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
                  src={groupIndex < 10 ? GreenStepShadow : PurpleStepShadow}
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
