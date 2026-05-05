import { Sparkles, TrendingUp, ArrowUpRight, TrendingDown } from "lucide-react";
import { useAuth } from "../../lib/context/useAuth";
import type { DashboardSummaryResponse } from "../../features/dashboard/types/dashboard.types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import formatCompactCurrency from "../../utils/getCompactAmount";
import ProfileMenu from "../ProfileMenu";

type Props = {
  data?: DashboardSummaryResponse;
  isLoading: boolean;
};

export const HeroDashboard = ({ data, isLoading }: Props) => {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);

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
        <div className="block md:hidden relative overflow-hidden rounded-bl-[1.6rem] rounded-br-[1.6rem]"
          style={{
            background: "linear-gradient(160deg, #071209 0%, #0a1f0e 40%, #0c2a12 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
          {/* dot texture */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.15,
            backgroundImage: "radial-gradient(circle, #22c55e 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }} />
          <div className="relative z-10 p-5 pt-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2.5">
                <div className="h-2.5 w-28 bg-white/15 rounded animate-pulse" />
                <div className="h-7 w-44 bg-white/25 rounded-lg animate-pulse" />
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 animate-pulse" />
            </div>
            <div className="h-px w-full bg-white/8" />
            <div className="flex items-end justify-between gap-3">
              <div className="space-y-2">
                <div className="h-2.5 w-16 bg-white/15 rounded animate-pulse" />
                <div className="h-9 w-32 bg-white/25 rounded-lg animate-pulse" />
              </div>
              <div className="flex-1 max-w-[170px] h-14 bg-white/10 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-14 bg-black/25 rounded-xl animate-pulse" />
              <div className="h-14 bg-black/25 rounded-xl animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-24 bg-white/10 rounded-full animate-pulse" />
              <div className="h-7 w-32 bg-white/10 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Desktop skeleton */}
        <div className="hidden md:block relative overflow-hidden rounded-[2.5rem]"
          style={{
            background: "linear-gradient(155deg, #060e08 0%, #071209 35%, #0b1e0e 65%, #0d2812 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
          <div style={{
            position: "absolute", inset: 0, opacity: 0.15,
            backgroundImage: "radial-gradient(circle, rgba(34,197,94,0.5) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }} />
          <div className="relative z-10 p-10 flex flex-col gap-8">
            <div className="space-y-3">
              <div className="h-3 w-24 bg-white/20 rounded animate-pulse" />
              <div className="h-10 w-48 bg-white/30 rounded animate-pulse" />
            </div>
            <div className="flex gap-6 items-center justify-between">
              <div className="h-12 w-52 bg-white/25 rounded-xl animate-pulse" />
              <div className="h-16 flex-1 max-w-md bg-white/15 rounded-2xl animate-pulse" />
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
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(34,197,94,0.28) 1px, transparent 1px)",
        backgroundSize: mobile ? "16px 16px" : "22px 22px",
        opacity: 0.55,
      }} />
      {/* Top-right radial glow */}
      <div style={{
        position: "absolute", top: "-40px", right: "-30px",
        width: mobile ? "220px" : "320px",
        height: mobile ? "180px" : "240px",
        background: "radial-gradient(ellipse at center, rgba(34,197,94,0.22) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      {/* Bottom-left subtle glow */}
      <div style={{
        position: "absolute", bottom: "-20px", left: "-10px",
        width: mobile ? "160px" : "220px",
        height: mobile ? "120px" : "160px",
        background: "radial-gradient(ellipse at center, rgba(34,197,94,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
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
      {/* ══ MOBILE ══════════════════════════════════════════════════════════ */}
      <div
        className="md:hidden relative overflow-hidden rounded-bl-[1.8rem] rounded-br-[1.8rem]"
        style={{
          background: "linear-gradient(160deg, #071209 0%, #0a1f0e 45%, #0c2a12 100%)",
          // border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <BgLayers mobile />

        <div className="relative z-10 px-4 pt-4 pb-5 flex flex-col gap-4">

          {/* Row 1: Greeting + Avatar */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={9} className="text-[#4ade80] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
                  {greeting}
                </span>
              </div>
              <h2 className="text-[1.65rem] font-black text-white tracking-tight leading-none">
                Hey, {displayName}!
              </h2>
            </div>
            <div
              className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center ring-2 ring-white/15"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <ProfileMenu />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.08)" }} />

          {/* Row 2: Net + Insight */}
          <div className="flex items-stretch justify-between gap-3">
            {/* Net change */}
            <div className="shrink-0 flex flex-col justify-center">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/45 mb-1">
                This Month
              </span>
              <div className={`text-[1.8rem] font-black leading-none tracking-tight ${isPositive ? "text-[#4ade80]" : "text-[#fca5a5]"}`}>
                {netChange > 0 ? "+" : netChange < 0 ? "−" : ""}₹{formatCompactCurrency(Math.abs(netChange))}
              </div>
              {/* % change badge */}
              <div className="mt-2 inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5"
                style={{ background: "rgba(255,255,255,0.10)" }}>
                {isPositive
                  ? <ArrowUpRight size={9} strokeWidth={3} className="text-[#4ade80]" />
                  : <TrendingDown size={9} strokeWidth={3} className="text-[#fca5a5]" />
                }
                <span className={`text-[9px] font-black ${isPositive ? "text-[#4ade80]" : "text-[#fca5a5]"}`}>
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
                    style={{ background: "rgba(0,0,0,0.25)" }}
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "rgba(74,222,128,0.2)" }}>
                      <TrendingUp size={11} className="text-[#4ade80]" />
                    </div>
                    <p className="text-[9.5px] font-semibold text-white/80 leading-snug">
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
              style={{ background: "rgba(0,0,0,0.30)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="block text-[8px] font-black uppercase tracking-[0.18em] text-white/40 mb-1.5">
                Income
              </span>
              <span className="block text-[1.05rem] font-black leading-none text-[#4ade80]">
                {compactAmount(data.summary.income)}
              </span>
            </div>
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: "rgba(0,0,0,0.30)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="block text-[8px] font-black uppercase tracking-[0.18em] text-white/40 mb-1.5">
                Spent
              </span>
              <span className="block text-[1.05rem] font-black leading-none text-[#fca5a5]">
                {compactAmount(data.summary.expenses)}
              </span>
            </div>
          </div>

          {/* Row 4: Pills */}
          <div className="flex flex-wrap gap-2">
            <div
              className="rounded-full px-3 py-1.5 text-[9.5px] font-black text-[#4ade80]"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              {data.summary.savings_rate.toFixed(1)}% saved
            </div>
            <div
              className="rounded-full px-3 py-1.5 text-[9.5px] font-black text-white/70"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              {budgetLabel}
            </div>
          </div>

        </div>

        {/* Wave at bottom — same as accounts card */}
        {/* <div style={{ height: "48px", position: "relative", marginTop: "-4px" }}>
          <svg viewBox="0 0 390 48" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <defs>
              <linearGradient id="heroWaveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,24 C50,14 100,32 160,20 C210,10 260,28 310,18 C345,10 370,24 390,16 L390,48 L0,48 Z"
              fill="url(#heroWaveGrad)"
            />
            <path
              d="M0,24 C50,14 100,32 160,20 C210,10 260,28 310,18 C345,10 370,24 390,16"
              fill="none"
              stroke="#4ade80"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
          </svg>
        </div> */}
      </div>

    </div>
  );
};