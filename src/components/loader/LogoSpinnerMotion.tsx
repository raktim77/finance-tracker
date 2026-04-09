import { motion, useReducedMotion } from "framer-motion";
import Logo from "../../assets/images/only_logo.png";

export default function LogoSpinnerMotion({ size = 72 }: { size?: number }) {
  const reduce = useReducedMotion();

  if (reduce) return <img src={Logo} alt="Loading" style={{ width: size, height: size }} />;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0.8 }}
      animate={{
        scale: [0.95, 1.05, 0.95],
        opacity: [0.8, 1, 0.8],
        // Multi-layered bloom effect using the Industrial Copper color
        filter: [
          "drop-shadow(0 0 0px rgba(198,124,78,0))",
          "drop-shadow(0 0 12px rgba(198,124,78,0.4))",
          "drop-shadow(0 0 0px rgba(198,124,78,0))",
        ],
      }}
      transition={{
        duration: 2,
        ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for a "biological" breathing feel
        repeat: Infinity,
      }}
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <img
        src={Logo}
        alt="Xpensio"
        className="select-none"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </motion.div>
  );
}