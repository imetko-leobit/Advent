import { motion } from "framer-motion";
import { FC } from "react";

interface IProps {
  name: string;
  isLoggedUser: boolean;
}

export const UserTooltip: FC<IProps> = ({ name, isLoggedUser }) => {
  return (
    <motion.div
      transition={{ ease: "linear" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "absolute",
        top: "-10%",
        left: "20%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "#fff",
        padding: "8px",
        borderRadius: "5px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        fontFamily: "Roboto",
        fontWeight: "normal",
        zIndex: isLoggedUser ? 102 : 50,
        minWidth: "120%",
        height: "20%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {name}
    </motion.div>
  );
};
