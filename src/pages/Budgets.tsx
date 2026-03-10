import { useState } from "react";
import {
  PlusCircle,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import { motion } from "framer-motion";

export default function Budgets() {
  const [month, setMonth] = useState(new Date());

  const totalBudget = 30000;

  const groups = [
    { category: "Food", allocated: 8000, spent: 7200, color: "#f97316" },
    { category: "Transport", allocated: 3000, spent: 1200, color: "#06b6d4" },
    { category: "Shopping", allocated: 5000, spent: 4500, color: "#8b5cf6" },
    { category: "Entertainment", allocated: 4000, spent: 2800, color: "#22c55e" }
  ];

  const budgets = groups.flatMap(g => g);
  const allocatedTotal = budgets.reduce((a, b) => a + b.allocated, 0);
  const spentTotal = budgets.reduce((a, b) => a + b.spent, 0);
  const remainingToAllocate = totalBudget - allocatedTotal;

  const donutData = [
    { name: "Spent", value: spentTotal, color: "white" },
    { name: "Remaining", value: totalBudget - spentTotal, color: "rgba(255,255,255,0.2)" }
  ];

  const getProgressColor = (spent: number, allocated: number) => {
    const p = (spent / allocated) * 100;
    if (p <= 70) return "var(--color-success)";
    if (p > 70 && p <= 90) return "#f59e0b";
    return "var(--color-danger)";
  };

  const riskyBudgets = budgets.filter(b => (b.spent / b.allocated) * 100 > 90);

  return (
    <div className="p-1 flex flex-col gap-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 mx-auto w-full">

      {/* 1. HEADER SECTION - Fixed for Mobile Wrap */}
      <div className="flex flex-col items-start justify-between gap-10">
        <div className="flex flex-rpw gap-4 md:gap-6 w-full justify-between">
          <h2 className="text-3xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tighter">
            Budgets
          </h2>

          <button className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/10 hover:bg-[var(--color-accent)] hover:text-white hover:shadow-[0_15px_30px_-10px_rgba(82,61,255,0.4)]">
            <PlusCircle size={18} strokeWidth={2.5} />
            <span className="text-sm md:block hidden">Create Budget</span>
            <span className="text-sm block md:hidden">Create</span>
          </button>

        </div>
        {/* Month Switcher: Centered and sized for mobile */}
        <div className="flex items-center justify-between md:justify-start gap-1 py-0.5 w-full md:w-auto">
          <button
            onClick={() => setMonth(new Date(month.setMonth(month.getMonth() - 1)))}
            className="bg-[var(--color-accent)] text-[var(--color-surface)] transition-colors p-2 rounded-lg border border-[var(--border)] shrink-0"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-black uppercase text-[var(--color-accent)] tracking-widest text-center flex-1 md:flex-none md:mx-4">
            {month.toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
          <button
            onClick={() => setMonth(new Date(month.setMonth(month.getMonth() + 1)))}
            className="bg-[var(--color-accent)] text-[var(--color-surface)] transition-colors p-2 rounded-lg border border-[var(--border)] shrink-0"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. PREMIUM OVERVIEW CARD - Optimized Height for Mobile */}
      <div className="relative w-full" style={{ isolation: 'isolate' }}>
        <div
          className="
      relative group rounded-[2.5rem] p-6 md:p-12 
      bg-gradient-to-br from-[#7c6cff] via-[#9c7cff] to-[#c084fc] 
      transition-all duration-500 
      /* We use a shadow with a larger spread and specific color */
      shadow-[0_20px_50px_rgba(124,108,255,0.35)] 
      dark:shadow-[0_30px_70px_rgba(0,0,0,0.5)]
      z-10
    "
        >
          {/* Decorative Circles - Inner Overflow Control */}
          <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-[60px] md:blur-[80px] -mr-20 -mt-20 md:-mr-32 md:-mt-32 animate-pulse" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 text-center md:text-left">

            {/* Donut Logic */}
            <div className="relative w-40 h-40 md:w-48 md:h-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} innerRadius={60} outerRadius={80} dataKey="value" stroke="none" startAngle={90} endAngle={450}>
                    {donutData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] md:text-[10px] font-black uppercase text-white/60 tracking-widest">Spent</span>
                <span className="text-xl md:text-2xl font-black text-white">{Math.round((spentTotal / totalBudget) * 100)}%</span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 gap-6 md:gap-8 w-full">
              <div className="flex flex-col gap-1 md:gap-2">
                <span className="text-[12px] font-black uppercase tracking-[0.3em] text-white/60">Limit Set</span>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">₹{totalBudget.toLocaleString()}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col md:text-left text-center">
                  <span className="text-[10px]  font-black uppercase text-white/50 tracking-widest">Allocated</span>
                  <span className="text-[20px] font-bold text-white leading-tight">₹{allocatedTotal.toLocaleString()}</span>
                </div>
                <div className="flex flex-col md:text-left text-center">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Spent</span>
                  <span className="text-[20px] font-bold text-white leading-tight">₹{spentTotal.toLocaleString()}</span>
                </div>
                <div className="col-span-2 p-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 mt-1">
                  <span className="text-[10px] font-black uppercase text-white/70 tracking-widest block mb-1">Unallocated Funds</span>
                  <span className="text-[18px] font-black text-white">₹{remainingToAllocate.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. UNDERLAP CARDS */}
      <div className="relative z-10 flex flex-col gap-6 md:gap-8">
        {riskyBudgets.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-success)]/20 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-between animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)] shadow-inner">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-xs md:text-sm text-[var(--color-text-primary)] tracking-tight mb-1">
                  You're Killing It!
                </h3>
                <p className="text-[10px] md:text-xs text-[var(--color-text-secondary)] font-medium leading-tight">
                  All categories are within healthy limits.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-[var(--color-success)]/10 px-3 py-1.5 rounded-full">
              <span className="text-[10px] font-black uppercase text-[var(--color-success)] tracking-widest">On Track</span>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] border border-[var(--color-danger)]/20 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[var(--color-danger)]/10 flex items-center justify-center text-[var(--color-danger)]">
                <Flame size={20} className="animate-bounce" />
              </div>
              <div>
                <h3 className="font-black text-xs md:text-sm text-[var(--color-text-primary)] mb-1">Budget Warnings</h3>
                <p className="text-[10px] md:text-xs text-[var(--color-text-secondary)]">{riskyBudgets.length} categories exceeding limit.</p>
              </div>
            </div>
            <div className="flex -space-x-2">
              {riskyBudgets.map((b, i) => (
                <div key={i} className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-danger)] flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white uppercase shadow-sm">
                  {b.category[0]}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GROUPED BUDGETS */}
        <div className="space-y-6 md:space-y-12">
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((b, i) => {
                const percent = Math.min((b.spent / b.allocated) * 100, 100);
                const color = getProgressColor(b.spent, b.allocated);

                return (
                  <div key={i} className="shadow-sm group relative bg-[var(--color-surface)] border border-[var(--border)] p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] transition-all hover:border-[var(--color-accent)]/20 overflow-hidden">
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] opacity-50 mb-0.5 md:mb-1">Category</span>
                        <h4 className="font-black text-base md:text-lg text-[var(--color-text-primary)]">{b.category}</h4>
                      </div>
                      <button className="p-2 rounded-xl bg-[var(--color-background)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]">
                        <Pencil size={14} />
                      </button>
                    </div>

                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs md:text-sm font-black text-[var(--color-text-primary)]">₹{b.spent.toLocaleString()}</span>
                      <span className="text-[9px] md:text-[10px] font-bold text-[var(--color-text-secondary)] opacity-60 uppercase">OF ₹{b.allocated.toLocaleString()}</span>
                    </div>

                    <div className="h-3 md:h-4 w-full bg-[var(--color-background)] rounded-full border border-[var(--border)] p-0.5 md:p-1 mb-3 md:mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full shadow-sm"
                        style={{ background: color }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-[var(--border)] border-dashed mt-1 md:mt-2">
                      <span className={`text-[9px] md:text-[10px] font-black uppercase ${percent > 90
                        ? 'text-[var(--color-danger)]'
                        : (percent > 70 && percent <= 90)
                          ? 'text-[#f59e0b]'
                          : 'text-[var(--color-success)]'
                        }`}>
                        {percent > 90 ? 'Critical' : (percent > 70 && percent <= 90) ? 'Nearing limit' : 'Healthy'}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-bold text-[var(--color-text-secondary)]">
                        ₹{(b.allocated - b.spent).toLocaleString()} Left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}