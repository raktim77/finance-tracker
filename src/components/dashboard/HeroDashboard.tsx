import { Sparkles, TrendingUp, ArrowUpRight, TrendingDown } from "lucide-react";
import { useAuth } from "../../lib/context/useAuth";
import type { DashboardSummaryResponse } from "../../features/dashboard/types/dashboard.types";
import { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import formatCompactCurrency from "../../utils/getCompactAmount";
import ProfileMenu from "../ProfileMenu";
import { ThemeContext } from "../../context/ThemeContext";

type Props = {
  data?: DashboardSummaryResponse;
  isLoading: boolean;
};

export const HeroDashboard = ({ data, isLoading }: Props) => {
  const { user } = useAuth();
  const { theme } = useContext(ThemeContext);
  const [index, setIndex] = useState(0);
  const positiveColor = "var(--color-success)";
  const negativeColor = "var(--color-danger)";
  const mutedText = "color-mix(in srgb, var(--color-text-primary) 45%, transparent)";
  const softText = "color-mix(in srgb, var(--color-text-primary) 70%, transparent)";
  const divider = "color-mix(in srgb, var(--color-text-primary) 10%, transparent)";
  const softOverlay = "color-mix(in srgb, var(--color-text-primary) 8%, transparent)";
  const mediumOverlay = "color-mix(in srgb, var(--color-text-primary) 12%, transparent)";
  const heroDot = "color-mix(in srgb, var(--color-primary) 45%, transparent)";
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const displayName = user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    if (!data?.insights?.length) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % data.insights.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [data?.insights]);

  useEffect(() => {
    setIndex(0);
  }, [data]);

  // ── LOADING ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div>
        {/* Mobile skeleton */}
        <div
          className="block md:hidden relative overflow-hidden rounded-bl-[1.6rem] rounded-br-[1.6rem]"
          style={{
            marginTop: "calc(-1 * var(--app-header-height, 76px))",
            background: "linear-gradient(160deg, #071209 0%, #0a1f0e 40%, #0c2a12 100%)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              position: "absolute", inset: 0, opacity: 0.15,
              backgroundImage: `radial-gradient(circle, ${heroDot} 1px, transparent 1px)`,
              backgroundSize: "18px 18px",
            }}
          />
          <div
            className="relative z-10 p-5 flex flex-col gap-4"
            style={{ paddingTop: "calc(var(--app-header-height, 76px) + 1rem)" }}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2.5">
                <div className="h-2.5 w-28 bg-white/15 rounded animate-pulse" />
                <div className="h-7 w-44 bg-white/25 rounded-lg animate-pulse" />
              </div>
              <div className="h-10 w-10 rounded-full animate-pulse" style={{ background: mediumOverlay }} />
            </div>
            <div className="h-px w-full" style={{ background: divider }} />
            <div className="flex items-end justify-between gap-3">
              <div className="space-y-2">
                <div className="h-2.5 w-16 bg-white/15 rounded animate-pulse" />
                <div className="h-9 w-32 bg-white/25 rounded-lg animate-pulse" />
              </div>
              <div className="flex-1 max-w-[170px] h-14 rounded-xl animate-pulse" style={{ background: mediumOverlay }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-14 rounded-xl animate-pulse" style={{ background: softOverlay }} />
              <div className="h-14 rounded-xl animate-pulse" style={{ background: softOverlay }} />
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-24 rounded-full animate-pulse" style={{ background: mediumOverlay }} />
              <div className="h-7 w-32 rounded-full animate-pulse" style={{ background: mediumOverlay }} />
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (!data) return null;

  const netChange = data.summary.net;
  const percentChange = data.comparison.percent_change;
  const insight = data.insights?.[index];

  const compactAmount = (value: number) => `₹${formatCompactCurrency(value)}`;
  const budgetLabel =
    data.summary.budget_left !== null
      ? `${compactAmount(data.summary.budget_left)} budget left`
      : "No budget set";

  const isPositive = netChange >= 0;


  // ── SHARED BACKGROUND LAYERS ─────────────────────────────────────────────
  const BgLayers = ({ mobile }: { mobile?: boolean }) => (
    <>
      {/* Dot texture */}
      {isDark ? (
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: `radial-gradient(circle, ${heroDot} 1px, transparent 1px)`,
            backgroundSize: mobile ? "16px 16px" : "22px 22px",
            opacity: 0.55,
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: `radial-gradient(circle, var(--color-primary) 1px, transparent 1px)`,
            backgroundSize: mobile ? "16px 16px" : "22px 22px",
            opacity: 0.3,
            filter: "blur(0.8px)",
          }}
        />
      )}

      {/* Top-right radial glow */}
      {isDark ? (
        <div
          style={{
            position: "absolute", top: "-40px", right: "-30px",
            width: mobile ? "220px" : "320px",
            height: mobile ? "180px" : "240px",
            background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--color-primary) 22%, transparent) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(60% 60% at 100% 0%, color-mix(in srgb, var(--color-primary) 18%, transparent) 0%, color-mix(in srgb, var(--color-primary) 10%, transparent) 25%, color-mix(in srgb, var(--color-primary) 5%, transparent) 40%, transparent 55%)`,
          }}
        />
      )}

      {/* Bottom-left subtle glow — dark only */}
      {isDark && (
        <div
          style={{
            position: "absolute", bottom: "-20px", left: "-10px",
            width: mobile ? "160px" : "220px",
            height: mobile ? "120px" : "160px",
            background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--color-primary) 10%, transparent) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );

  const insightBg = {
    positive: "bg-white/8 border-white/10",
    warning: "bg-yellow-400/10 border-yellow-300/20",
    neutral: "bg-white/8 border-white/10",
    info: "bg-white/8 border-white/10",
  };

  return (
    <div>
      <div
        className="md:hidden relative overflow-hidden rounded-bl-[1.8rem] rounded-br-[1.8rem] shadow-sm"
        style={{
          marginTop: "calc(-1 * var(--app-header-height, 76px))",
          background: isDark
            ? "linear-gradient(160deg, #071209 0%, #0a1f0e 45%, #0c2a12 100%)"
            : "var(--color-surface)",
          border: isDark ? undefined : "1px solid var(--border)",
        }}
      >
        <BgLayers mobile />

        <div
          className="relative z-10 px-4 pb-5 flex flex-col gap-4"
          style={{ paddingTop: "calc(var(--app-header-height, 76px) + 1rem)" }}
        >
          {/* Row 1: Greeting + Avatar */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={9} className="animate-pulse text-[var(--color-success)]" />
                <span
                  className="text-[9px] font-black uppercase tracking-[0.2em]"
                  style={{ color: mutedText }}
                >
                  {greeting}
                </span>
              </div>
              <h2
                className="text-[1.65rem] font-black tracking-tight leading-none"
                style={{ color: "var(--color-text-primary)" }}
              >
                Hey, {displayName}!
              </h2>
            </div>
            <div
              className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center ring-2"
              style={{
                background: mediumOverlay,
              }}
            >
              <ProfileMenu />
            </div>
          </div>

          {/* Divider */}
          <div
            className="h-px w-full"
            style={{ background: divider }}
          />

          {/* Row 2: Net + Insight */}
          <div className="flex items-stretch justify-between gap-3">
            {/* Net change */}
            <div className="shrink-0 flex flex-col justify-center">
              <span
                className="text-[8px] font-black uppercase tracking-[0.2em] mb-1"
                style={{ color: mutedText }}
              >
                This Month
              </span>
              <div
                className="text-[1.8rem] font-black leading-none tracking-tight"
                style={{ color: isPositive ? positiveColor : negativeColor }}
              >
                {netChange > 0 ? "+" : netChange < 0 ? "−" : ""}₹{formatCompactCurrency(Math.abs(netChange))}
              </div>
              {/* % change badge */}
              <div
                className="mt-2 inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5"
                style={{ background: softOverlay }}
              >
                {isPositive
                  ? <ArrowUpRight size={9} strokeWidth={3} style={{ color: positiveColor }} />
                  : <TrendingDown size={9} strokeWidth={3} style={{ color: negativeColor }} />
                }
                <span className="text-[9px] font-black" style={{ color: isPositive ? positiveColor : negativeColor }}>
                  {percentChange}%
                </span>
              </div>
            </div>

            {/* Insight card */}
            <div className="flex flex-1 min-w-0 max-w-[175px]">
              <AnimatePresence mode="wait">
                {insight && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`w-full rounded-2xl p-3 flex items-start gap-2 border backdrop-blur-xl ${insightBg[insight.type]}`}
                    style={{
                      background: "color-mix(in srgb, var(--color-surface) 75%, transparent)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "color-mix(in srgb, var(--color-success) 20%, transparent)" }}
                    >
                      <TrendingUp size={11} style={{ color: positiveColor }} />
                    </div>
                    <p
                      className="text-[9.5px] font-semibold leading-snug"
                      style={{ color: softText }}
                    >
                      {insight.message}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Row 3: Income / Spent cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: softOverlay,
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="block text-[8px] font-black uppercase tracking-[0.18em] mb-1.5"
                style={{ color: mutedText }}
              >
                Income
              </span>
              <span className="block text-[1.05rem] font-black leading-none" style={{ color: positiveColor }}>
                {compactAmount(data.summary.income)}
              </span>
            </div>
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: softOverlay,
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="block text-[8px] font-black uppercase tracking-[0.18em] mb-1.5"
                style={{ color: mutedText }}
              >
                Spent
              </span>
              <span className="block text-[1.05rem] font-black leading-none" style={{ color: negativeColor }}>
                {compactAmount(data.summary.expenses)}
              </span>
            </div>
          </div>

          {/* Row 4: Pills */}
          <div className="flex flex-wrap gap-2">
            <div
              className="rounded-full px-3 py-1.5 text-[9.5px] font-black"
              style={{
                color: positiveColor,
                background: "color-mix(in srgb, var(--color-success) 15%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-success) 30%, transparent)",
              }}
            >
              {data.summary.savings_rate.toFixed(1)}% saved
            </div>
            <div
              className="rounded-full px-3 py-1.5 text-[9.5px] font-black"
              style={{
                color: softText,
                background: softOverlay,
                border: "1px solid var(--border)",
              }}
            >
              {budgetLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
