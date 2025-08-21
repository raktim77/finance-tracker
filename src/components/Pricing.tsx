// Pricing.tsx
import React from "react";
import { Check, Shield, Sparkles } from "lucide-react";

// Accept CSS custom properties safely (e.g., --exp-glow)
type CSSVars = { [key: `--${string}`]: string | number };
type CSSVarStyle = React.CSSProperties & CSSVars;

/** GlowCard — passes through CSS vars like --exp-glow */
function GlowCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: CSSVarStyle;
}) {
  return (
    <div
      className={[
        "relative rounded-2xl border border-black/5 dark:border-white/10",
        "bg-[var(--pricing-card-color)]",
        "shadow-[0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-xl",
        "overflow-hidden",
        className,
      ].join(" ")}
      style={style}
    >
      {/* gradient ring (strength controlled by --exp-glow) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.1rem]
                   [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]
                   [mask-composite:exclude] p-[1px]"
        style={{
          background:
            "linear-gradient(135deg,var(--color-accent-teal),transparent 40%), radial-gradient(1000px 1000px at -20% -20%, var(--color-warm), transparent 60%)",
          opacity: "var(--exp-glow, .4)",
          transition: "opacity 200ms ease",
        }}
      />
      {children}
    </div>
  );
}

const perks = [
  "Real-time balance tracking",
  "AI generated expense reports",
  "Basic cash-flow insights",
  "Expense categorization",
  "Quick support",
];
const marketingBullets = [
  "No hidden fees or surprise charges",
  "Built for individuals & small teams",
  "Privacy-first: encryption in transit & at rest",
  "Works smoothly across devices",
  "Upgrade only when you grow",
];
/** Mobile combined pricing block:
 * Heading OUTSIDE the card, card shows "Free Plan / For Individuals"
 */
function PricingMobileBlock() {
  return (
    <div>
      {/* Heading outside the card */}
      <span className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase px-3 py-1 rounded-full bg-[var(--color-accent-teal)]/12 text-[var(--color-accent-teal)] ring-1 ring-[var(--color-accent-teal)]/20">
        <Sparkles size={12} />
        Pricing
      </span>
      <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)]">
        Simple pricing. <span className="text-[var(--color-primary)]">Free</span> to start.
      </h2>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Expensio’s core features are free forever. No trial clock, no credit card.
        Upgrade later only if you want advanced automations and team tools.
      </p>

      {/* Card with auras */}
      <div className="relative mt-4">
        <div aria-hidden className="absolute -inset-10 -z-10 pointer-events-none">
          {/* light mode aura */}
          <div
            className="absolute inset-0 rounded-[2.5rem] blur-[60px] dark:hidden"
            style={{
              background:
                "radial-gradient(60% 50% at 30% 30%, rgba(50,165,158,0.18) 0%, transparent 70%), radial-gradient(70% 55% at 80% 80%, rgba(147,51,234,0.10) 0%, transparent 75%)",
            }}
          />
          {/* dark mode aura */}
          <div className="absolute inset-0 rounded-[2rem] bg-[var(--color-accent-teal)]/12 blur-2xl hidden dark:block" />
          <div className="absolute inset-0 rounded-[2rem] bg-[var(--color-warm)]/10 blur-3xl hidden dark:block" />
        </div>

        {/* locally nudge ring so it pops in light too */}
        <GlowCard className="p-6" style={{ ["--exp-glow"]: 0.18 }}>
          {/* top: Free Plan / For Individuals (matches desktop) */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-[var(--color-text-secondary)]">
                Free Plan
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-[var(--color-text-primary)]">
                For Individuals
              </h3>
            </div>

            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
                              bg-[var(--color-accent-teal)]/15 text-[var(--color-accent-teal)] ring-1 ring-[var(--color-accent-teal)]/20">
              Free forever
            </span>
          </div>

          {/* price + CTA */}
          <div className="mt-5">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold text-[var(--color-text-primary)]">$0</span>
              <span className="mb-1 text-[var(--color-text-secondary)]">/ month</span>
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Basic tools to manage your money at no cost.
            </p>
            <a
              
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl px-4 py-3
                         bg-[var(--color-accent-teal)] text-white font-semibold hover:opacity-90 transition cursor-pointer"
            >
              Get Started
            </a>
          </div>

          {/* perks */}
          <ul className="mt-5 space-y-3">
            {perks.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-teal)]/15 text-[var(--color-accent-teal)] ring-1 ring-[var(--color-accent-teal)]/20">
                  <Check size={14} />
                </span>
                <span className="text-sm text-[var(--color-text-secondary)]">{p}</span>
              </li>
            ))}
          </ul>
            
          <div className="mt-5 inline-flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <Shield size={14} />
            No credit card required
          </div>
        </GlowCard>
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="relative bg-[var(--color-background)] py-16 lg:py-20 md:py-20 sm:py-12">
      {/* subtle section aura (respects --exp-auras) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          opacity: "calc(var(--exp-auras,0) * 0.85)",
          background:
            "radial-gradient(800px 400px at 10% 20%, var(--color-accent-teal)/10, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Desktop/Tablet: two columns */}
        <div className="hidden lg:grid grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT: copy */}
          <div className="col-span-6 lg:pr-6">
            <span className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase px-3 py-1 rounded-full bg-[var(--color-accent-teal)]/12 text-[var(--color-accent-teal)] ring-1 ring-[var(--color-accent-teal)]/20">
              <Sparkles size={12} />
              Pricing
            </span>

            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)]">
              Simple pricing. <span className="text-[var(--color-primary)]">Free</span> to start.
            </h2>

            <p className="mt-3 text-[var(--color-text-secondary)] max-w-prose">
              Expensio’s core features are free forever. No trial clock, no credit card. Upgrade
              later only if you want advanced automations and team tools.
            </p>

            <ul className="mt-6 space-y-3">
  {marketingBullets.map((p, i) => (
    <li key={i} className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-teal)]/15 text-[var(--color-accent-teal)] ring-1 ring-[var(--color-accent-teal)]/20">
        <Check size={14} />
      </span>
      <span className="text-sm md:text-base text-[var(--color-text-secondary)]">
        {p}
      </span>
    </li>
  ))}
</ul>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                
                className="inline-flex items-center justify-center rounded-xl px-5 py-3
                           bg-[var(--color-accent-teal)] text-white font-medium hover:opacity-90 transition cursor-pointer"
              >
                Get started — it’s free
              </a>
              <div className="inline-flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <Shield size={14} />
                No credit card required
              </div>
            </div>
          </div>

          {/* RIGHT: highlighted free plan card */}
          <div className="col-span-6 lg:pl-6">
            <div className="relative">
              {/* auras behind the card (light + dark) */}
              <div aria-hidden className="absolute -inset-14 -z-10 pointer-events-none">
                {/* light mode aura */}
                <div
                  className="absolute inset-0 rounded-[2.5rem] blur-[60px] dark:hidden"
                  style={{
                    background:
                      "radial-gradient(60% 50% at 30% 30%, rgba(50,165,158,0.22) 0%, transparent 70%), radial-gradient(70% 55% at 80% 80%, rgba(147,51,234,0.12) 0%, transparent 75%)",
                  }}
                />
                {/* dark mode aura */}
                <div className="absolute inset-0 rounded-[2rem] bg-[var(--color-accent-teal)]/12 blur-2xl hidden dark:block" />
                <div className="absolute inset-0 rounded-[2rem] bg-[var(--color-warm)]/10 blur-3xl hidden dark:block" />
              </div>

              {/* local ring boost stays */}
              <GlowCard className="p-6 md:p-8" style={{ ["--exp-glow"]: 0.18 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Free Plan
                    </p>
                    <h3 className="mt-1 text-2xl font-extrabold text-[var(--color-text-primary)]">
                      For Individuals
                    </h3>
                  </div>

                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
                                    bg-[var(--color-accent-teal)]/15 text-[var(--color-accent-teal)] ring-1 ring-[var(--color-accent-teal)]/20">
                    Free forever
                  </span>
                </div>

                <div className="mt-6 flex items-end gap-2">
                  <span className="text-5xl font-extrabold text-[var(--color-text-primary)]">$0</span>
                  <span className="mb-1 text-[var(--color-text-secondary)]">/ month</span>
                </div>

                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  Basic tools to manage your money at no cost.
                </p>

                <a
                  
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3
                             bg-[var(--color-accent-teal)] text-white font-semibold hover:opacity-90 transition cursor-pointer"
                >
                  Get Started
                </a>

                <ul className="mt-6 space-y-3">
                  {perks.map((p, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-teal)]/15 text-[var(--color-accent-teal)] ring-1 ring-[var(--color-accent-teal)]/20">
                        <Check size={14} />
                      </span>
                      <span className="text-sm text-[var(--color-text-secondary)]">{p}</span>
                    </li>
                  ))}
                </ul>
              </GlowCard>
            </div>
          </div>
        </div>

        {/* Mobile/Small: heading outside + single combined card */}
        <div className="lg:hidden mt-2">
          <PricingMobileBlock />
        </div>
      </div>
    </section>
  );
}
