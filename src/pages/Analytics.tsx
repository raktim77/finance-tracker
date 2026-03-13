import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
  CartesianGrid
} from "recharts";

import {
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Calendar,
  ChevronDown,
  PieChart as PieIcon,
  Lightbulb,
  AlertTriangle,
  PiggyBank // Added for Savings card
} from "lucide-react";

// --- DATA ---
const trendData = [
  { day: "01", amount: 200 },
  { day: "05", amount: 450 },
  { day: "10", amount: 150 },
  { day: "15", amount: 500 },
  { day: "20", amount: 300 },
  { day: "25", amount: 480 },
  { day: "30", amount: 420 }
];

const savingsData = [
  { day: "01", amount: 100 },
  { day: "05", amount: 300 },
  { day: "10", amount: 600 },
  { day: "15", amount: 400 },
  { day: "20", amount: 800 },
  { day: "25", amount: 750 },
  { day: "30", amount: 900 }
];

const pieData = [
  { name: "Food", value: 400, color: "#f97316" },
  { name: "Shopping", value: 300, color: "#8b5cf6" },
  { name: "Transport", value: 200, color: "#06b6d4" },
  { name: "Bills", value: 100, color: "#22c55e" }
];

const barData = [
  { month: "Jan", amount: 1200 },
  { month: "Feb", amount: 1800 },
  { month: "Mar", amount: 900 },
  { month: "Apr", amount: 2100 },
  { month: "May", amount: 1600 },
  { month: "Jun", amount: 2400 }
];

export default function Analytics() {
  const budgetUsed = 64;

  return (
    <div className="flex flex-col gap-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 mx-auto w-full p-1">

      {/* 1. HEADER - Responsive Fixed */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-4">
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <h2 className="text-3xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tighter">
            Analytics
          </h2>
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-[var(--color-accent)]" />
            <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em] opacity-60">
              JAN 2026 - JUN 2026 OVERVIEW
            </p>
          </div>
        </div>

        <button className="group flex items-center justify-between md:justify-start gap-2 w-full md:w-auto px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-[var(--color-surface)] border border-[var(--border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all active:scale-95 shadow-sm">
          <span>Last 6 Months</span>
          <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* 2. PREMIUM HERO SECTION */}
      <div className="relative w-full max-w-full">
        <div className="relative z-0 group overflow-hidden rounded-[2.5rem] p-8 md:p-12 bg-gradient-to-br from-[#7c6cff] via-[#9c7cff] to-[#c084fc] shadow-2xl/50br transition-all duration-500">
          <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-[60px] md:blur-[80px] -mr-16 -mt-16 md:-mr-32 md:-mt-32 animate-pulse" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 text-white">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">Total Cumulative Spending</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-6xl font-black tracking-tighter">₹48,200</span>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg backdrop-blur-md">
                  <TrendingUp size={14} />
                  <span className="text-xs font-bold">+12.4%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-black/10 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-inner shrink-0 w-full md:w-auto justify-between md:justify-start">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase text-white/50 tracking-widest text-left">Efficiency</span>
                <span className="text-xl font-bold">High</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black uppercase text-white/50 tracking-widest text-left">Budget Remaining</span>
                <div className="w-24 md:w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-1000" style={{ width: `${100 - budgetUsed}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. OVERLAP METRICS - 4 COLUMNS */}
      <div className="relative z-10 -mt-12 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">

          {/* Card 1: This Month */}
          <div className="bg-[var(--color-surface)] border border-[var(--border)] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:scale-[1.02] transition-all">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)] shadow-inner shrink-0">
              <Zap size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col min-w-0 gap-1 ">
              <span className="text-[8px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest truncate">This Month</span>
              <span className="text-sm md:text-xl font-black text-[var(--color-text-primary)] truncate">₹8,400</span>
            </div>
          </div>

          {/* Card 2: Total Savings */}
          <div className="bg-[var(--color-surface)] border border-[var(--border)] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:scale-[1.02] transition-all">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)] shadow-inner shrink-0">
              <PiggyBank size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col min-w-0 gap-1">
              <span className="text-[8px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest truncate">Total Savings</span>
              <span className="text-sm md:text-xl font-black text-[var(--color-success)] truncate">₹20,500</span>
            </div>
          </div>

          {/* Card 3: Avg Daily */}
          <div className="bg-[var(--color-surface)] border border-[var(--border)] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:scale-[1.02] transition-all">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-warm)]/10 flex items-center justify-center text-[var(--color-warm)] shadow-inner shrink-0">
              <Target size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col min-w-0 gap-1">
              <span className="text-[8px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest truncate">Avg Daily</span>
              <span className="text-sm md:text-xl font-black text-[var(--color-text-primary)] truncate">₹280</span>
            </div>
          </div>

          {/* Card 4: Budget Used */}
          <div className="bg-[var(--color-surface)] border border-[var(--border)] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:scale-[1.02] transition-all">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shadow-inner shrink-0">
              <PieIcon size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col min-w-0 gap-1">
              <span className="text-[8px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest truncate">Budget Used</span>
              <span className="text-sm md:text-xl font-black text-[var(--color-text-primary)] truncate">{budgetUsed}%</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. MAIN ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">

        {/* Spending Trend */}
        <div className="lg:col-span-3 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6">
          {/* Header Section: Stacked on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight">
                Spending Trend
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Volume of expenses over time
              </p>
            </div>

            {/* Controls Section: Full width on mobile for easier tapping */}
            <div className="flex items-center gap-2 bg-[var(--color-background)] p-1 rounded-xl border border-[var(--border)] w-fit">
              <button className="h-8 px-4 rounded-lg bg-[var(--color-surface)] shadow-sm border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--color-text-primary)] transition-all active:scale-95">
                Daily
              </button>
              <button className="h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] opacity-40 hover:opacity-100 transition-all">
                Weekly
              </button>
            </div>
          </div>

          {/* Chart Container */}
          <div className="flex-1 min-h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", fontSize: "12px" }}
                  itemStyle={{ color: "var(--color-text-primary)", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="amount" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#trendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Heatmap */}
        <div className="lg:col-span-2 rounded-[2.5rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col">
          <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight mb-2 text-left">Category Heatmap</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-8 text-left">Where your money actually goes</p>

          <div className="h-[200px] relative mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={85} paddingAngle={2} cornerRadius={6}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-black uppercase text-[var(--color-text-secondary)]">Focus</span>
              <span className="text-lg font-black text-[var(--color-text-primary)]">Food</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-auto">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-[var(--color-background)] border border-[var(--border)]">
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase truncate">{item.name}</span>
                <span className="text-[10px] font-bold text-[var(--color-text-secondary)] ml-auto">₹{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Trend - Same style as spending */}
        <div className="lg:col-span-3 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6">
          <div className="flex flex-col">
            <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight">Savings Growth</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Retained surplus accumulated over time</p>
          </div>

          <div className="flex-1 min-h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--border)", fontSize: "12px" }}
                  itemStyle={{ color: "var(--color-text-primary)", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="amount" stroke="var(--color-success)" strokeWidth={3} fillOpacity={1} fill="url(#savingsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quarterly Velocity */}
        <div className="lg:col-span-2 rounded-[2.5rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm">
          <div className="flex flex-col mb-8">
            <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight text-left">Quarterly Velocity</h3>
            <p className="text-xs text-[var(--color-text-secondary)] text-left">Monthly spending volume comparison</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10, fontWeight: "bold" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} />
                <Tooltip cursor={{ fill: 'var(--color-accent-soft)', radius: 10 }} />
                <Bar dataKey="amount" fill="var(--color-primary)" radius={[8, 8, 8, 8]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Smart Insights - Full Width Footer Grid */}
        <div className="lg:col-span-5 rounded-[2.5rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[var(--color-accent)] opacity-5 blur-3xl rounded-full" />

          <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight mb-6 flex items-center gap-2">
            <Zap size={18} className="text-[var(--color-accent)]" /> AI Analytics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="flex gap-4 p-5 rounded-2xl bg-[var(--color-background)] border border-[var(--border)] hover:border-[var(--color-danger)]/30 transition-colors">
              <AlertTriangle className="text-[var(--color-danger)] shrink-0" size={20} />
              <p className="text-sm font-medium text-[var(--color-text-primary)] leading-relaxed">
                You spent <span className="font-black">32% more</span> on food this month. Consider reducing restaurant visits to stay on track.
              </p>
            </div>
            <div className="flex gap-4 p-5 rounded-2xl bg-[var(--color-background)] border border-[var(--border)] hover:border-[var(--color-success)]/30 transition-colors">
              <TrendingDown className="text-[var(--color-success)] shrink-0" size={20} />
              <p className="text-sm font-medium text-[var(--color-text-primary)] leading-relaxed">
                Efficiency is up! Transport expenses dropped by <span className="font-black">12%</span> compared to your 3-month average.
              </p>
            </div>
            <div className="flex gap-4 p-5 rounded-2xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 shadow-sm">
              <Lightbulb className="text-[var(--color-accent)] shrink-0" size={20} />
              <p className="text-sm font-black text-[var(--color-accent)] leading-relaxed">
                Strategy: Reducing dining out could save you approximately ₹2,000 by the end of next month.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}