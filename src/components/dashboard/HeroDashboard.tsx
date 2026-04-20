import { Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";
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
  const avatarInitial = displayName.charAt(0).toUpperCase();

  // 🔁 AUTO ROTATE INSIGHTS
  useEffect(() => {
    if (!data?.insights?.length) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % data.insights.length);
    }, 4000); // every 4 sec

    return () => clearInterval(interval);
  }, [data?.insights]);

  // reset index when new data arrives
  useEffect(() => {
    setIndex(0);
  }, [data]);

  // ✅ SKELETON
  if (isLoading) {
    return (
      <div className="relative z-0 group overflow-hidden rounded-[1.6rem] md:rounded-[2.5rem] p-6 md:p-10 bg-gradient-to-br from-[#2f8c3d] via-[#257d35] to-[#17430f] shadow-2xl/50">
        <div className="flex flex-col gap-8">
          <div className="space-y-3">
            <div className="h-6 w-24 bg-white/30 rounded animate-pulse" />
            <div className="h-12 md:h-10 w-48 bg-white/40 rounded animate-pulse" />
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="h-10 w-full md:w-64 bg-white/30 rounded animate-pulse" />
            <div className="h-16 w-full md:w-110 bg-white/30 rounded-2xl animate-pulse" />
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

  const insightStyles = {
    positive: "bg-white/10 border-white/10",
    warning: "bg-yellow-400/10 border-yellow-300/20",
    neutral: "bg-white/10 border-white/10",
    info: "bg-white/10 border-white/10",
  };

  return (
    <div className="relative z-0 group overflow-hidden rounded-bl-[1.6rem] rounded-br-[1.6rem] md:rounded-[2.5rem] p-5 pt-6 md:p-10 bg-gradient-to-br from-[#2f8c3d] via-[#257d35] to-[#17430f] shadow-2xl">
      {/* Background Decorative Blobs */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-2xl opacity-40 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col gap-3 md:hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-white/70">
                <Sparkles size={10} className="animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.16em]">
                  {greeting}
                </span>
              </div>
<h2 className="text-xl md:text-6xl font-black text-white tracking-tight leading-none break-words">
        Hey, {displayName}!
      </h2>
            </div>

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-sm font-black text-white shadow-md ring-1 ring-white/25">
              <ProfileMenu />
            </div>
          </div>

          <div className="h-px w-full bg-white/15" />

          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
              Net savings this month
            </span>

            <div className="mt-1 text-[1.8rem] font-black leading-none tracking-tight text-white">
              {netChange >= 0 ? "+" : "-"}₹{formatCompactCurrency(Math.abs(netChange))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-black/20 px-3 py-3 backdrop-blur-md border border-white/5">
              <span className="block text-[8px] font-black uppercase tracking-widest text-white/50">
                Income
              </span>
              <span className="mt-1 block text-sm font-black leading-none text-[#a5ffa5]">
                {compactAmount(data.summary.income)}
              </span>
            </div>

            <div className="rounded-xl bg-black/20 px-3 py-3 backdrop-blur-md border border-white/5">
              <span className="block text-[8px] font-black uppercase tracking-widest text-white/50">
                Spent
              </span>
              <span className="mt-1 block text-sm font-black leading-none text-[#fca5a5]">
                {compactAmount(data.summary.expenses)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur-md">
              {data.summary.savings_rate.toFixed(1)}% saved
            </div>

            <div className="rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur-md">
              {budgetLabel}
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-white/70">
              <Sparkles size={12} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {greeting}
              </span>
            </div>

            <h1 className="text-4xl font-black text-white tracking-tighter leading-tight break-words">
              Hey, {displayName}!
            </h1>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
              This Month
            </span>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black text-white tracking-tight">
                {netChange >= 0 ? "+" : "-"}₹{formatCompactCurrency(Math.abs(netChange))}
              </span>
              <div className="flex items-center text-[9px] font-black bg-white/20 px-2 py-1 rounded-lg text-white backdrop-blur-md">
                <ArrowUpRight size={10} strokeWidth={3} className="mr-0.5" />
                {percentChange}%
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {insight && (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`flex flex-1 max-w-md backdrop-blur-xl border rounded-2xl p-4 items-center gap-3 ${insightStyles[insight.type]}`}
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} className="text-white" />
                </div>

                <p className="text-[11px] md:text-xs font-medium text-white/90 leading-tight">
                  {insight.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
