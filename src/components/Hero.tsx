// components/Hero.tsx
const Hero = () => {
  return (
    <section id="home" className="relative bg-[var(--color-background)] text-center py-20 overflow-hidden max-w-7xl mx-auto">
      {/* HEADLINE (clean, no glow behind it) */}
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-[var(--color-text-primary)]">
          Manage <span className="text-[var(--color-primary)]">Finances</span> <br /> Easily and Smartly
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[var(--color-text-secondary)]">
          Xpensio helps you control spending, track income, and manage savings with an intuitive dashboard.
        </p>
        <div className="mt-8 flex justify-center">
          <button className="btn btn-primary px-6 py-3 rounded-full font-medium text-lg shadow-lg hover:opacity-90 transition">
            Try it Free
          </button>
        </div>
      </div>

      {/* IMAGE + GLOW */}
      <div className="relative z-10 mt-16 flex justify-center">
        {/* glow wrapper behind image */}
        <div className="absolute inset-0 flex justify-center -z-10">
          <div className="w-[min(90vw,1200px)] h-[500px] bg-[var(--color-warm)]/30 blur-3xl rounded-full" />
        </div>

        <img
          src="/assets/professional-dashboard-user-panel.png" // dashboard image
          alt="Xpensio Dashboard"
          className="w-[min(92vw,1400px)] rounded-xl shadow-2xl "
        />
      </div>
    </section>
  );
};

export default Hero;
