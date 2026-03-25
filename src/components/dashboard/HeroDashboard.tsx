import { Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../lib/context/useAuth";

export const HeroDashboard = () => {
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const displayName = user?.name?.split(" ")[0];

  // 🔥 MOCK DATA (replace later with real values)
  const netChange = 12450;
  const percentChange = 8.4;

  // future-ready state (good | warning | danger)
  const insightState: "good" | "warning" | "danger" = "good";

  const insightStyles = {
    good: "bg-white/10 border-white/10",
    warning: "bg-yellow-400/10 border-yellow-300/20",
    danger: "bg-red-400/10 border-red-300/20"
  };

  return (
    <div
      className="relative z-0 group overflow-hidden rounded-[2.5rem] p-6 md:p-10
      bg-gradient-to-br from-[#7c6cff] via-[#9c7cff] to-[#c084fc] shadow-2xl transition-all duration-500"
    >
      {/* Decorative elements */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-2xl opacity-40 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6 md:gap-8">

        {/* 🔹 Greeting */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-white/70">
            <Sparkles size={12} className="animate-pulse" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
              {greeting}
            </span>
          </div>
<h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-tight break-all">
  Hey, {displayName}!
</h1>
        </div>

        {/* 🔹 Bottom Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          {/* 🔸 Monthly Change */}
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
              This Month
            </span>

            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-black text-white tracking-tight">
                +₹{netChange.toLocaleString()}
              </span>

              <div className="flex items-center text-[9px] font-black bg-white/20 px-2 py-1 rounded-lg text-white backdrop-blur-md">
                <ArrowUpRight size={10} strokeWidth={3} className="mr-0.5" />
                {percentChange}%
              </div>
            </div>
          </div>

          {/* 🔸 Insight Card */}
          <div
            className={`flex-1 max-w-md backdrop-blur-xl border rounded-2xl p-4 flex items-center gap-3 ${insightStyles[insightState]}`}
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <TrendingUp size={16} className="text-white" />
            </div>

            <p className="text-[11px] md:text-xs font-medium text-white/90 leading-tight">
              You're saving <span className="font-black">24% more</span> than last month — great progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};