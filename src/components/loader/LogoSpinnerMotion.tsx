import { motion, useReducedMotion } from "framer-motion";
import Logo from "../../assets/images/only_logo.png";

export default function LogoSpinnerMotion({ size = 72 }: { size?: number }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div
        className="flex items-center justify-center logo-loader-glow"
        style={{ width: size, height: size }}
        role="status"
        aria-label="Loading"
      >
        <img src={Logo} alt="Xpensio" style={{ width: size, height: size, objectFit: "contain" }} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0.7, scale: 0.9 }}
      animate={{
        opacity: [0.7, 1, 0.85, 1],
        scale: [0.9, 1.04, 0.97, 1],
        filter: [
          "drop-shadow(0 0 0px rgba(59,130,246,0))",
          "drop-shadow(0 0 12px rgba(59,130,246,0.45))",
          "drop-shadow(0 0 4px rgba(59,130,246,0.25))",
          "drop-shadow(0 0 0px rgba(59,130,246,0))",
        ],
      }}
      transition={{
        duration: 1.8,
        ease: "easeInOut",
        repeat: Infinity,
      }}
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <img
        src={Logo}
        alt="Xpensio"
        className="rounded-full select-none"
        style={{
          width: size,
          height: size,
          objectFit: "contain",
        }}
      />
    </motion.div>
  );
}
