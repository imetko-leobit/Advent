import { motion } from "framer-motion";
import { uiConfig, getStarImage } from "../../../config";
import { useMemo } from "react";

export const Stars = () => {
  const starImage = getStarImage();
  const { stars } = uiConfig.animations;

  // Group stars by duration for animation - memoized for performance
  const starGroups = useMemo(() => {
    return stars.reduce((groups, star) => {
      const duration = star.duration;
      if (!groups[duration]) {
        groups[duration] = [];
      }
      groups[duration].push(star);
      return groups;
    }, {} as Record<number, typeof stars>);
  }, [stars]);

  return (
    <div>
      {Object.entries(starGroups).map(([duration, starsInGroup]) => (
        <motion.div
          key={duration}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            ease: "linear",
            duration: parseFloat(duration),
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          {starsInGroup.map((star, index) => (
            <img
              key={`${duration}-${index}`}
              src={starImage}
              style={{
                position: "absolute",
                top: star.top,
                left: star.left,
                height: star.height,
                width: star.width,
              }}
              alt="Star"
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
};
