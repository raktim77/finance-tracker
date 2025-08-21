// --- Features.tsx (only this file) ---

const cards = [
  // Row 1 — big overview (spans full width)
  {
    title: "Comprehensive Financial Overview",
    desc:
      "Your balance, income, and expenses at a glance — add transactions fast and stay on top with real‑time summaries.",
    img: "https://s3-alpha.figma.com/hub/file/6439917573/77e2518a-bb11-484c-baac-817f3525808e-cover.png",
    alt: "Analytics graphs on a laptop",
    span: "lg:col-span-12",
  },

  // Row 2 — unequal widths (5 / 7)
  {
    title: "Smart Saving Plan",
    desc:
      "Create goals, track progress, and get nudges for automated contributions and milestones.",
    img: "https://cdn-images-1.medium.com/v2/resize:fit:1000/1*djOWBfUNhFUPeDHchV9cEQ.jpeg",
    alt: "Saving plan card",
    span: "lg:col-span-5",
  },
  {
    title: "Automated Budgeting & Forecasting",
    desc:
      "Set category limits, detect overspend early, and preview end‑of‑month cash flow.",
    img: "https://copilot.money/static/fe2a5a0665773ef284db61d1c737b129/ada0f/desktop-content.png",
    alt: "Budgeting dashboard",
    span: "lg:col-span-7",
  },

  // Row 3 — zig‑zag widths (7 / 5): Privacy (left, larger) + Android (right, smaller)
  {
    title: "Private & Secured by Design",
    desc:
      "Your data stays yours. We use industry‑standard encryption (TLS in transit, AES‑256 at rest), device‑bound sessions, and granular permissions. No selling of personal data — ever. Export and delete your data any time from settings.",
    img: "/assets/padlock.png",
    alt: "Lock over abstract dashboard",
    span: "lg:col-span-7",
  },
  {
    title: "Seamless on Mobile",
    desc:
      "Enjoy all the goodness of our platform and more at your fingertips with our android app.",
    img: "/assets/mobile_app.webp",
    alt: "Mobile app preview",
    span: "lg:col-span-5",
    mobileCta: true,
  },
];

const GooglePlayIcon = () => (
 <svg className="h-5 w-5"  viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <mask id="mask0_87_8320" maskUnits="userSpaceOnUse" x="7" y="3" width="24" height="26"> <path d="M30.0484 14.4004C31.3172 15.0986 31.3172 16.9014 30.0484 17.5996L9.75627 28.7659C8.52052 29.4459 7 28.5634 7 27.1663L7 4.83374C7 3.43657 8.52052 2.55415 9.75627 3.23415L30.0484 14.4004Z" fill="#C4C4C4"></path> </mask> <g mask="url(#mask0_87_8320)"> <path d="M7.63473 28.5466L20.2923 15.8179L7.84319 3.29883C7.34653 3.61721 7 4.1669 7 4.8339V27.1664C7 27.7355 7.25223 28.2191 7.63473 28.5466Z" fill="url(#paint0_linear_87_8320)"></path> <path d="M30.048 14.4003C31.3169 15.0985 31.3169 16.9012 30.048 17.5994L24.9287 20.4165L20.292 15.8175L24.6923 11.4531L30.048 14.4003Z" fill="url(#paint1_linear_87_8320)"></path> <path d="M24.9292 20.4168L20.2924 15.8179L7.63477 28.5466C8.19139 29.0232 9.02389 29.1691 9.75635 28.766L24.9292 20.4168Z" fill="url(#paint2_linear_87_8320)"></path> <path d="M7.84277 3.29865L20.2919 15.8177L24.6922 11.4533L9.75583 3.23415C9.11003 2.87878 8.38646 2.95013 7.84277 3.29865Z" fill="url(#paint3_linear_87_8320)"></path> </g> <defs> <linearGradient id="paint0_linear_87_8320" x1="15.6769" y1="10.874" x2="7.07106" y2="19.5506" gradientUnits="userSpaceOnUse"> <stop stopColor="#00C3FF"></stop> <stop offset="1" stopColor="#1BE2FA"></stop> </linearGradient> <linearGradient id="paint1_linear_87_8320" x1="20.292" y1="15.8176" x2="31.7381" y2="15.8176" gradientUnits="userSpaceOnUse"> <stop stopColor="#FFCE00"></stop> <stop offset="1" stopColor="#FFEA00"></stop> </linearGradient> <linearGradient id="paint2_linear_87_8320" x1="7.36932" y1="30.1004" x2="22.595" y2="17.8937" gradientUnits="userSpaceOnUse"> <stop stopColor="#DE2453"></stop> <stop offset="1" stopColor="#FE3944"></stop> </linearGradient> <linearGradient id="paint3_linear_87_8320" x1="8.10725" y1="1.90137" x2="22.5971" y2="13.7365" gradientUnits="userSpaceOnUse"> <stop stopColor="#11D574"></stop> <stop offset="1" stopColor="#01F176"></stop> </linearGradient> </defs> </g></svg>
);

const Features = () => {
  return (
    <section id="features" className="relative bg-[var(--color-background)] pt-16 lg:py-16 md:py-16 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="px-6 text-center mb-12">
        <span className="inline-block text-xs tracking-widest uppercase px-3 py-1 rounded-full
                         bg-[var(--color-accent-teal)]/15 text-[var(--color-accent-teal)]">
          Why Expensio
        </span>
        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)]">
          Powerful Features to <span className="text-[var(--color-primary)]">Elevate</span> Your Finances
        </h2>
        <p className="mt-3 text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          A compact, clear hub for everything you do — overview, savings,
          budgets, and a slick mobile experience.
        </p>
      </div>

      {/* Grid → always 12 on lg so we can do 12/5/7/7/5 spans */}
      <div className="px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {cards.map((c, idx) => {
            const isWide = c.span?.includes("lg:col-span-12"); // only the top hero card
            // Keep the alternating image/text order for non-wide cards
            const reverse = !isWide && idx % 2 === 1;

            return (
              <article key={idx} className={`relative group h-full ${c.span ?? ""}`}>
                {/* subtle outer glow */}
                <div className="absolute -inset-6 -z-10 rounded-3xl
                                bg-[var(--color-accent-teal)]/12 blur-3xl opacity-0
                                group-hover:opacity-100 transition-opacity duration-300" />

                {/* Card */}
                <div className="relative h-full flex flex-col overflow-hidden rounded-3xl
                             bg-[var(--color-surface-elevated)]
                             border border-black/10 dark:border-white/10
                             shadow-lg"
                >
                  <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

                  {/* Content grid */}
                  <div
                    className={[
                      "p-6 md:p-10 grid gap-8 md:gap-10 flex-1",
                      isWide ? "lg:grid-cols-12" : "md:grid-cols-2",
                      reverse ? "md:[&>*:first-child]:order-2" : "",
                      idx === 0 ? "items-center" : "items-start",
                    ].join(" ")}
                  >
                    {/* Text */}
                    <div className={isWide ? "lg:col-span-5" : ""}>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-2">
                        
                      </div>

                      <h3 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-primary)]">
                        {c.title}
                      </h3>
                      <p className="mt-3 text-[var(--color-text-secondary)] leading-relaxed">
                        {c.desc}
                      </p>

                      {c.mobileCta && (
                        <div className="mt-6">
                          <a
                            href="#"
                            className="btn-outline inline-flex items-center gap-2 rounded-xl px-4 py-2
                                        text-[var(--color-accent-teal)] font-medium
                                       hover:opacity-90 transition hover:bg-[var(--color-accent-teal)] hover:text-white"
                            aria-label="Get it on Google Play"
                          >
                            <GooglePlayIcon />
                            Coming Soon
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Image */}
                    <div className={isWide ? "lg:col-span-7" : ""}>
                      <div className="relative rounded-2xl border border-black/10 dark:border-white/10 shadow-xl overflow-hidden">
                        <img
                          src={c.img}
                          alt={c.alt}
                          loading="lazy"
                          className={[
                            "w-full object-cover",
                            isWide ? "h-[22rem] md:h-[24rem]" : "h-64 md:h-72 lg:h-80",
                          ].join(" ")}
                          style={{
                            WebkitMaskImage:
                              "linear-gradient(to bottom, black 80%, transparent 100%)",
                            maskImage:
                              "linear-gradient(to bottom, black 80%, transparent 100%)",
                          }}
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16
                                        bg-gradient-to-b from-transparent to-[var(--color-surface-elevated)]" />
                      </div>

                      {/* subtle accent blob for wide cards */}
                      {isWide && (
                        <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full
                                        bg-[var(--color-warm)]/20 blur-2xl pointer-events-none" />
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
