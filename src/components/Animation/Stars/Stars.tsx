import { motion } from "framer-motion";
import Star from "../../../assets/star/Star.svg";

export const Stars = () => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          ease: "linear",
          duration: 1.2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <img
          src={Star}
          style={{
            position: "absolute",
            top: "80%",
            left: "60%",
            height: "3%",
            width: "3%",
          }}
          alt="Star"
        />
        <img
          src={Star}
          style={{
            position: "absolute",
            top: "78%",
            left: "81%",
            height: "3%",
            width: "3%",
          }}
          alt="Star"
        />
        <img
          src={Star}
          style={{
            position: "absolute",
            top: "44%",
            left: "90%",
            height: "3%",
            width: "3%",
          }}
          alt="Star"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          ease: "linear",
          duration: 0.7,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <img
          src={Star}
          style={{
            position: "absolute",
            top: "87%",
            left: "67%",
            height: "2%",
            width: "2%",
          }}
          alt="Star"
        />
        <img
          src={Star}
          style={{
            position: "absolute",
            top: "87%",
            left: "91%",
            height: "2%",
            width: "2%",
          }}
          alt="Star"
        />
        <img
          src={Star}
          style={{
            position: "absolute",
            top: "45%",
            left: "77%",
            height: "2%",
            width: "2%",
          }}
          alt="Star"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          ease: "linear",
          duration: 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <img
          src={Star}
          style={{
            position: "absolute",
            top: "86%",
            left: "72%",
            height: "2.5%",
            width: "2.5%",
          }}
          alt="Star"
        />
        <img
          src={Star}
          style={{
            position: "absolute",
            top: "64%",
            left: "88%",
            height: "2.5%",
            width: "2.5%",
          }}
          alt="Star"
        />
        <img
          src={Star}
          style={{
            position: "absolute",
            top: "34%",
            left: "90%",
            height: "2.5%",
            width: "2.5%",
          }}
          alt="Star"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          ease: "linear",
          duration: 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <img
          src={Star}
          style={{
            position: "absolute",
            top: "69%",
            left: "84%",
            height: "4%",
            width: "4%",
          }}
          alt="Star"
        />
      </motion.div>
    </div>
  );
};
