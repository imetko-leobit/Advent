import { FC } from "react";
import { motion } from "framer-motion";
import { useUIConfig } from "../../context/UIConfigContext";
import "./FinishScreen.css";
import { finishScreenTypes } from "../../consts";

interface IProps {
  screenType: string;
  handleCloseClick: () => void;
}

export const FinishScreen: FC<IProps> = ({ screenType, handleCloseClick }) => {
  const { uiConfig } = useUIConfig();

  if (!uiConfig) {
    return null;
  }

  const finishScreenImage = screenType === finishScreenTypes.finish
    ? uiConfig.finishScreens.finish
    : uiConfig.finishScreens.dzen;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "absolute",
        top: "55%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 30,
        width: "70%",
      }}
    >
      <motion.div
        className="close-screen-btn-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ position: "absolute", top: 30, right: 50, cursor: "pointer" }}
        onClick={handleCloseClick}
      >
        <motion.div className="close-screen-btn">&times;</motion.div>
      </motion.div>
      <motion.img
        src={finishScreenImage}
        style={{
          height: "100%",
          width: "100%",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
    </motion.div>
  );
};
