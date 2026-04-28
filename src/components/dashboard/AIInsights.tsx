import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { DashboardSummaryResponse } from "../../features/dashboard/types/dashboard.types";

type Props = {
  insights?: DashboardSummaryResponse["insights"];
};

export function AIInsights({ insights = [] }: Props) {
  const [index, setIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const goTo = (i: number) => {
    if (i === index) return;
    setVisible(false);
    setTimeout(() => {
      setDisplayIndex(i);
      setIndex(i);
      setVisible(true);
    }, 350);
  };

  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => {
          const next = (prev + 1) % insights.length;
          setDisplayIndex(next);
          return next;
        });
        setVisible(true);
      }, 350);
    }, 4000);
    return () => clearInterval(interval);
  }, [insights]);

  useEffect(() => {
    setIndex(0);
    setDisplayIndex(0);
    setVisible(true);
  }, [insights]);

  const insight = insights[displayIndex];

  return (
    <div className="h-full w-full rounded-2xl border border-[var(--border)] bg-[var(--color-surface)] p-4 md:p-5 shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] tracking-wide uppercase">
          Insights for You
        </h2>

        {insights.length > 1 && (
          <div className="flex items-center gap-1.5">
            {insights.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-500 ease-in-out ${
                  i === index
                    ? "w-4 h-1.5 bg-[var(--color-primary)]"
                    : "w-1.5 h-1.5 bg-[var(--border)]"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="mt-3 flex items-stretch justify-between gap-3">

        {/* LEFT CONTENT */}
        <div className="flex flex-col min-w-0 flex-1 justify-center">

          {/* FADE WRAPPER */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 350ms ease, transform 350ms ease",
            }}
          >
            {/* Icon + Title */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full text-[var(--color-accent)]">
                <Sparkles size={24} />
              </div>
              <p className="text-xl md:text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight leading-tight">
                {insight?.title ?? "Biggest Spend"}
              </p>
            </div>

            {/* Description */}
            <p className="mt-2.5 text-xs md:text-base leading-relaxed text-[var(--color-text-secondary)] h-[3rem] line-clamp-2">
              {insight?.message ?? "You spent 18% less on Food & Dining compared to last month."}
            </p>
          </div>

          {/* CTA */}
          <div className="mt-4">
            <button className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)] px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-accent-soft)] transition">
              View More Insights
              <ArrowRight size={10} strokeWidth={3} />
            </button>
          </div>

        </div>

        {/* RIGHT VISUAL */}
        <div className="flex items-center justify-end shrink-0">
          <img
            src="/assets/dashboard_insights.webp"
            alt="insight graph"
            className="w-[100px] md:w-[180px] object-contain"
          />
        </div>

      </div>
    </div>
  );
}