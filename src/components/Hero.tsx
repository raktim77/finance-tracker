import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
    const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };
  return (
    <section id="home" className="relative bg-[var(--color-background)] text-center py-24 overflow-hidden max-w-7xl mx-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-accent-teal)]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-warm)]/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-7xl font-black leading-[1.1] text-[var(--color-text-primary)] tracking-tighter"
        >
          Manage <span className="bg-gradient-to-r from-[var(--color-accent-teal)] to-[var(--color-warm)] bg-clip-text text-transparent">Finances</span> <br /> Easily and Smartly
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 text-lg md:text-xl text-[var(--color-text-secondary)] font-medium opacity-80"
        >
          Xpensio helps you control spending, track income, and manage savings with an intuitive dashboard.
        </motion.p>
        
        <div className="mt-10 flex justify-center">
          <button 
          onClick={handleLogin}
          className="h-14 px-10 rounded-2xl bg-[var(--color-accent)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_40px_-12px_rgba(82,61,255,0.4)] hover:scale-105 active:scale-95 transition-all">
            Try it Free
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-20 flex justify-center px-6">
        <div className="absolute inset-0 flex justify-center -z-10">
          <div className="w-[min(90vw,1200px)] h-[500px] bg-[var(--color-warm)]/20 blur-3xl rounded-full" />
        </div>

        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="glass-card p-2 md:p-4 rounded-[2.5rem]"
        >
          <img
            src="/assets/professional-dashboard-user-panel.png"
            alt="Xpensio Dashboard"
            className="w-[min(92vw,1400px)] rounded-[1.8rem] shadow-2xl border border-[var(--border)]"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;