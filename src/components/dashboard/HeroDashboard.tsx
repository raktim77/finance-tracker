import { Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../lib/context/useAuth";
import type { DashboardSummaryResponse } from "../../features/dashboard/types/dashboard.types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import formatCompactCurrency from "../../utils/getCompactAmount";
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

  const displayName = user?.name?.split(" ")[0];

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
      <div className="relative z-0 group overflow-hidden rounded-[2.5rem] p-6 md:p-10 bg-gradient-to-br from-[#7c6cff] via-[#9c7cff] to-[#c084fc] shadow-2xl/50">
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

  const insightStyles = {
    positive: "bg-white/10 border-white/10",
    warning: "bg-yellow-400/10 border-yellow-300/20",
    neutral: "bg-white/10 border-white/10",
    info: "bg-white/10 border-white/10",
  };

  return (
    <div className="relative z-0 group overflow-hidden rounded-[2.5rem] p-6 md:p-10 bg-gradient-to-br from-[#7c6cff] via-[#9c7cff] to-[#c084fc] shadow-2xl/50">

      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-2xl opacity-40 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6 md:gap-8">

        {/* Greeting */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-white/70">
            <Sparkles size={12} className="animate-pulse" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
              {greeting}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-tight break-words">
            Hey, {displayName}!
          </h1>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          {/* Net */}
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
              This Month
            </span>

            <div className="flex items-center gap-2">
              <span className="text-3xl md:text-4xl font-black text-white tracking-tight md:block hidden">
                {netChange >= 0 ? "+" : "-"}₹{formatCompactCurrency(Math.abs(netChange)).toLocaleString()}
              </span>
              <span className="text-3xl md:text-4xl font-black text-white tracking-tight md:hidden block">
                {netChange >= 0 ? "+" : "-"}₹{formatCompactCurrency(Math.abs(netChange)).toLocaleString()}
              </span>

              <div className="flex items-center text-[9px] font-black bg-white/20 px-2 py-1 rounded-lg text-white backdrop-blur-md">
                <ArrowUpRight size={10} strokeWidth={3} className="mr-0.5" />
                {percentChange}%
              </div>
            </div>
          </div>

          {/* 🔥 INSIGHT CAROUSEL */}
          <AnimatePresence mode="wait">
            {insight && (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`flex-1 max-w-md backdrop-blur-xl border rounded-2xl p-4 flex items-center gap-3 ${insightStyles[insight.type]}`}
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
  );
};