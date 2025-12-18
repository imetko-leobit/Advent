import { motion } from "framer-motion";
import Cloud from "../../../assets/clouds/Cloud.svg";

export const Clouds = () => {
  return (
    <div>
      <motion.img
        src={Cloud}
        style={{
          position: "absolute",
          top: "25%",
          left: "70%",
          height: "5%",
          width: "5%",
        }}
        alt="Cloud"
        initial={{ translateX: "-40%" }}
        animate={{ translateX: "20%" }}
        transition={{
          ease: "linear",
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.img
        src={Cloud}
        style={{
          position: "absolute",
          top: "20%",
          left: "60%",
          height: "7%",
          width: "7%",
        }}
        alt="Cloud"
        initial={{ translateX: "-40%" }}
        animate={{ translateX: "20%" }}
        transition={{
          ease: "linear",
          duration: 7,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.img
        src={Cloud}
        style={{
          position: "absolute",
          top: "30%",
          left: "25%",
          height: "6%",
          width: "6%",
        }}
        alt="Cloud"
        initial={{ translateX: "-30%" }}
        animate={{ translateX: "30%" }}
        transition={{
          ease: "linear",
          duration: 9,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.img
        src={Cloud}
        style={{
          position: "absolute",
          top: "42%",
          left: "13%",
          height: "8%",
          width: "8%",
        }}
        alt="Cloud"
        initial={{ translateX: "-40%" }}
        animate={{ translateX: "20%" }}
        transition={{
          ease: "linear",
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
};
