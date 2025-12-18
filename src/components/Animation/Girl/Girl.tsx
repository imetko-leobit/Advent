import { motion } from "framer-motion";
import GirlSvg from "../../../assets/girl-with-shadow/Girl.svg";
import Shadow from "../../../assets/girl-with-shadow/Shadow.svg";

export const Girl = () => {
  return (
    <div>
      <motion.img
        src={Shadow}
        style={{
          position: "absolute",
          left: "81%",
          top: "37%",
          height: "2%",
        }}
        alt="Cloud"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1.2 }}
        transition={{
          ease: "linear",
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.img
        src={GirlSvg}
        style={{
          position: "absolute",
          left: "79.3%",
          top: "28%",
          height: "15%",
        }}
        alt="Girl"
        initial={{ translateY: "-45%" }}
        animate={{ translateY: "-40%" }}
        transition={{
          ease: "linear",
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
};
