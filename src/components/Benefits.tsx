import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Brain, Target, Users, Wallet } from "lucide-react";

type Item = {
  id: number;
  title: string;
  desc: string;
  icon: React.ElementType;
};

const items: Item[] = [
  { id: 1, title: "Smart Financial Insights", desc: "See patterns across categories, time periods, and merchants. Get gentle nudges when trends change or budgets slip.", icon: Brain },
  { id: 2, title: "Personalized Financial Goals", desc: "Create goals like ‘Emergency Fund’ or ‘New Laptop’. We’ll calculate targets, track progress, and keep you motivated.", icon: Target },
  { id: 3, title: "Smart Expense Splitting", desc: "Split with friends, family, or colleagues—no confusion or manual math. Keep clean records and settle up in a tap.", icon: Users },
  { id: 4, title: "Automated Budgeting & Forecasting", desc: "Set category limits, detect overspending early, and preview end-of-month cash flow with simple projections.", icon: Wallet },
];

/** gallery images */
const gallery = [
  { src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1800&auto=format&fit=crop", alt: "Analytics dashboard", h: "h-64" },
  { src: "https://cdn.dribbble.com/userupload/17847238/file/original-fded481ada94169584520ef2c4e5a3bd.png?resize=1024x768&vertical=center", alt: "Mobile screen with charts", h: "h-80" },
  { src: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600&auto=format&fit=crop", alt: "Cards and payments", h: "h-72" },
  { src: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1600&auto=format&fit=crop", alt: "Growth graph", h: "h-56" },
];

/** GlowCard — white in light, elevated dark surface in dark */
function GlowCard({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "relative rounded-2xl border border-black/5 dark:border-white/10",
        "bg-[var(--benefits-card-color)]", 
        "shadow-[0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-xl",
        "overflow-hidden transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        className,
      ].join(" ")}
    >
      {/* gradient ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.1rem]
                   [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]
                   [mask-composite:exclude] p-[1px]"
        style={{
          background:
            "linear-gradient(135deg,var(--color-accent-teal),transparent 40%), radial-gradient(1200px 1200px at -20% -20%, var(--color-warm), transparent 60%)",
          opacity: "var(--exp-glow)",
          transition: "opacity 200ms ease",
        }}
      />
      {children}
    </div>
  );
}


/** Accordion item  */
function AccordionItem({
  title,
  desc,
  Icon,
  open,
  onToggle,
  controlId,
}: {
  title: string;
  desc: string;
  Icon: React.ElementType;
  open: boolean;
  onToggle: () => void;
  controlId: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const measure = () => setHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxH = open ? height + 12 : 0;

  return (
    <GlowCard className="hover:-translate-y-[2px]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={controlId}
        className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 text-left
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-teal)]
                   focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] rounded-2xl cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl
                           bg-[var(--color-accent-teal)]/15 text-[var(--color-accent-teal)]
                           ring-1 ring-[var(--color-accent-teal)]/20">
            <Icon size={18} aria-hidden />
          </span>
          <span className="font-semibold text-[var(--color-text-primary)]">{title}</span>
        </div>

        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 dark:bg-white/5">
          <ChevronDown
            size={18}
            className={`text-[var(--color-text-secondary)] transform-gpu transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </span>
      </button>

      <div
        id={controlId}
        role="region"
        aria-label={title}
        style={{
          overflow: "hidden",
          maxHeight: maxH,
          transition: "max-height 380ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          ref={panelRef}
          className={`px-4 sm:px-5 pb-4 text-[var(--color-text-secondary)]
                      transform-gpu transition-all duration-300 ease-out
                      ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
        >
          <p className="leading-relaxed pb-5">{desc}</p>
        </div>
      </div>
    </GlowCard>
  );
}

const Benefits = () => {
  const [openId, setOpenId] = useState<number>(1);
  const uid = useId();

  return (
    <section id="benefits" className="relative bg-[var(--color-background)] pt-20 lg:py-20 md:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          opacity: "calc(var(--exp-auras) * 0.85)",
          background:
            "radial-gradient(800px 400px at 10% 10%, var(--color-accent-teal)/10, transparent 60%), radial-gradient(700px 300px at 90% 60%, var(--color-warm)/10, transparent 65%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* LEFT */}
        <div className="lg:col-span-6">
          <span className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase px-3 py-1 rounded-full bg-[var(--color-accent-teal)]/12 text-[var(--color-accent-teal)] ring-1 ring-[var(--color-accent-teal)]/20">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-teal)] animate-pulse" />
            A smarter way
          </span>

          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)]">
            Manage Your Money, <span className="text-[var(--color-primary)]">Your</span> Way
          </h2>

          <p className="mt-3 text-[var(--color-text-secondary)] max-w-prose">
            Built for everyone—Xpensio gives you a seamless,
            secure, and intuitive financial workflow.
          </p>

          <div className="mt-8 space-y-4">
            {items.map(({ id, title, desc, icon: Icon }) => (
              <AccordionItem
                key={id}
                title={title}
                desc={desc}
                Icon={Icon}
                open={openId === id}
                onToggle={() => setOpenId(openId === id ? 0 : id)}
                controlId={`${uid}-panel-${id}`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-6 hidden sm:block">
          <div className="relative lg:sticky lg:top-24">
            <div className="absolute -inset-10 -z-10" style={{ opacity: "var(--exp-auras)" }}>
              <div className="absolute inset-0 rounded-[2rem] bg-[var(--color-warm)]/14 blur-3xl" />
              <div className="absolute inset-0 rounded-[2rem] bg-[var(--color-accent-teal)]/12 blur-2xl" />
            </div>

            <div className="columns-1 sm:columns-2 gap-4 md:gap-5">
              {gallery.map((g, i) => (
                <GlowCard
                  key={i}
                  className="mb-4 md:mb-5 break-inside-avoid transition-transform hover:-translate-y-0.5"
                >
                  <div className={`relative ${g.h}`}>
                    <img
                      src={g.src}
                      alt={g.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      style={{
                        WebkitMaskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
                        maskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
                        transition: "transform 300ms ease",
                      }}
                      onMouseMove={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        const rect = el.getBoundingClientRect();
                        const dy = (e.clientY - rect.top) / rect.height - 0.5;
                        el.style.transform = `translateY(${dy * -4}px) scale(1.02)`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLImageElement).style.transform =
                          "translateY(0px) scale(1)";
                      }}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[var(--color-background)]" />
                  </div>
                </GlowCard>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="sm:hidden -mx-6 px-6">
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory
                       [-ms-overflow-style:none] [scrollbar-width:none]
                       [&::-webkit-scrollbar]:hidden py-1"
            aria-label="Feature screenshots"
          >
            {gallery.map((g, i) => (
              <GlowCard
                key={`m-${i}`}
                className="snap-center shrink-0 w-[78%] first:ml-1 last:mr-1"
              >
                <div className="relative h-64">
                  <img
                    src={g.src}
                    alt={g.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    style={{
                      WebkitMaskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
                      maskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
                    }}
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[var(--color-background)]" />
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
