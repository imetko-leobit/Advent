import { motion } from "framer-motion";
import { uiConfig, getCloudImage } from "../../../config";

export const Clouds = () => {
  const cloudImage = getCloudImage();
  const { clouds } = uiConfig.animations;

  return (
    <div>
      {clouds.map((cloud, index) => (
        <motion.img
          key={index}
          src={cloudImage}
          style={{
            position: "absolute",
            top: cloud.top,
            left: cloud.left,
            height: cloud.height,
            width: cloud.width,
          }}
          alt="Cloud"
          initial={{ translateX: cloud.translateFrom }}
          animate={{ translateX: cloud.translateTo }}
          transition={{
            ease: "linear",
            duration: cloud.duration,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};
