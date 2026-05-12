import React, { useContext, useEffect, useState, useMemo } from "react";
import {
  PlusCircle,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Trash2,
  Wallet,
  CircleGauge,
  ShieldAlert,
  TriangleAlert,
  CircleCheckBig,
  ShieldCheck,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  useBudget,
  useBudgetSuggestions,
  useDeleteBudget,
  useUpsertBudget,
} from "../features/budgets/hooks/useBudgets";
import { useDismissibleLayer } from "../components/app-back/DismissibleLayerProvider";
import { useConfirm } from "../components/ui/confirm-modal/useConfirm";
import { useToast } from "../components/ui/confirm-modal/useToast";
import resolveLucideIcon from "../utils/LucideIconsResolver";
import { ThemeContext } from "../context/ThemeContext";
import PaceVsIdealChart from "../components/budgets/PaceVsIdealChart";
import { useHeaderConfig } from "../hooks/useHeaderConfig";
import formatCompactCurrency from "../utils/getCompactAmount";
// Place this OUTSIDE and ABOVE the Budgets component
const SemiGauge: React.FC<{ percent: number }> = ({ percent }) => {
  const r = 90;
  const cx = 110;
  const cy = 110;
  const circumference = Math.PI * r;
  const target = Math.min(percent / 100, 1) * circumference;

  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    // Let the component paint at 0 first, then transition to target
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimated(target);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <svg viewBox="0 0 220 120" style={{ width: "220px", height: "120px", display: "block" }}>
      {/* Background arc */}
      <path
        d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
        fill="none"
        stroke="var(--border)"
        strokeWidth="18"
        strokeLinecap="round"
      />
      {/* Animated arc — CSS transition does the heavy lifting */}
      <path
        d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
        fill="none"
        stroke="var(--color-success)"
        strokeWidth="18"
        strokeLinecap="round"
        strokeDasharray={`${animated} ${circumference}`}
        style={{
          transition: "stroke-dasharray 900ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
    </svg>
  );
};
export default function Budgets() {

  const { theme } = useContext(ThemeContext);
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [month, setMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const monthString = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);
  const selectedMonth = new Date(month);
  selectedMonth.setDate(1);
  selectedMonth.setHours(0, 0, 0, 0);
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const isCurrentMonth =
    selectedMonth.getFullYear() === currentMonth.getFullYear() &&
    selectedMonth.getMonth() === currentMonth.getMonth();
  const isNextMonth =
    selectedMonth.getFullYear() === nextMonth.getFullYear() &&
    selectedMonth.getMonth() === nextMonth.getMonth();
  const canCreateBudget = isCurrentMonth || isNextMonth;
  const canGoToNextMonth = selectedMonth < nextMonth;

  const { data: budget, isLoading } = useBudget(monthString);
  const { data: suggestions, isLoading: suggestionsLoading } = useBudgetSuggestions(monthString, {
    enabled: canCreateBudget && (!budget?.exists || isEditingBudget),
  });

  const confirm = useConfirm();
  const toast = useToast();
  const { mutateAsync, isPending: isSavingBudget } = useUpsertBudget();
  const { mutateAsync: deleteBudgetFn, isPending: isDeletingBudget } = useDeleteBudget();

  const [draftTotal, setDraftTotal] = useState(0);
  const [draftTotalInput, setDraftTotalInput] = useState("");
  const [draftCategories, setDraftCategories] = useState<
    { category_id: string; name: string; limit: number; icon?: string; color?: string }[]
  >([]);
  const [draftCategoryInputs, setDraftCategoryInputs] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useDismissibleLayer({ open: isSelectorOpen, onDismiss: () => setIsSelectorOpen(false), priority: 300 });

  useEffect(() => {
    if (suggestions && !budget?.exists && !isEditingBudget) {
      setDraftTotal(suggestions.suggested_total);
      setDraftTotalInput(String(suggestions.suggested_total));
      const cats = suggestions.categories.filter(c => c.suggested_limit > 0).map(c => ({
        category_id: c.category_id, name: c.name, limit: c.suggested_limit, icon: c.icon, color: c.color,
      }));
      setDraftCategories(cats);
      setDraftCategoryInputs(Object.fromEntries(cats.map(c => [c.category_id, String(c.limit)])));
    }
  }, [suggestions, budget, isEditingBudget]);

  useEffect(() => {
    if (budget?.exists && isEditingBudget) {
      const budgetTotal = budget.total_limit ?? 0;
      const cats = budget.categories?.filter(c => c.limit > 0).map(c => ({
        category_id: c.category_id, name: c.name, limit: c.limit, icon: c.icon, color: c.color,
      })) ?? [];
      setDraftTotal(budgetTotal);
      setDraftTotalInput(String(budgetTotal));
      setDraftCategories(cats);
      setDraftCategoryInputs(Object.fromEntries(cats.map(c => [c.category_id, String(c.limit)])));
    }
  }, [budget, isEditingBudget]);

  const getFontSize = (val: string) => {
    const len = val.length;
    if (len < 7) return "text-6xl";
    if (len < 10) return "text-4xl";
    return "text-3xl";
  };

  const fontSizeClass = getFontSize(draftTotalInput);

  useEffect(() => {
    if (!canCreateBudget && !budget?.exists) { setIsSelectorOpen(false); setSearchQuery(""); }
  }, [budget, canCreateBudget]);
  useEffect(() => { setIsEditingBudget(false); }, [monthString]);

  const availableToAdd = useMemo(() => {
    if (!suggestions) return [];
    return suggestions.categories
      .filter(c => !draftCategories.find(dc => dc.category_id === c.category_id))
      .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [suggestions, draftCategories, searchQuery]);

  const totalBudget = budget?.total_limit ?? 0;
  type BudgetGroup = { category: string; allocated: number; spent: number; color: string; icon: string | undefined };
  const groups: BudgetGroup[] = budget?.categories?.map(c => ({
    category: c.name, allocated: c.limit, spent: c.spent, color: c.color, icon: c.icon,
  })).filter(item => item.allocated > 0) ?? [];

  const allocatedTotal = budget?.allocated ?? 0;
  const spentTotal = budget?.spent ?? 0;
  const remainingToAllocate = budget?.unallocated ?? 0;
  const spentPercent = totalBudget > 0 ? Math.round((spentTotal / totalBudget) * 100) : 0;
  const availableAmount = allocatedTotal - spentTotal;
  const now = new Date();

  const budgetSelectedYear = month.getFullYear();
  const budgetSelectedMonth = month.getMonth();
  const budgetDaysInMonth = new Date(
    budgetSelectedYear,
    budgetSelectedMonth + 1,
    0
  ).getDate();

  const isFutureMonth =
    selectedMonth > currentMonth;

  const budgetCurrentDay =
    isFutureMonth
      ? 0
      : isCurrentMonth
        ? now.getDate()
        : budgetDaysInMonth;

  const budgetIdealPerDay =
    budgetDaysInMonth > 0
      ? totalBudget / budgetDaysInMonth
      : 0;

  const budgetShouldHaveSpent =
    budgetIdealPerDay * budgetCurrentDay;

  const budgetActualSpent = spentTotal;

  const budgetDifference =
    budgetActualSpent - budgetShouldHaveSpent;

  const budgetPacePercent =
    budgetShouldHaveSpent > 0 &&
      budgetActualSpent > 0
      ? (budgetDifference / budgetShouldHaveSpent) * 100
      : 0;

  const budgetBurnRate =
    budgetShouldHaveSpent > 0 &&
      budgetActualSpent > 0
      ? budgetActualSpent / budgetShouldHaveSpent
      : 0;

  const budgetProjectedSpend =
    budgetCurrentDay > 0
      ? (budgetActualSpent / budgetCurrentDay) *
      budgetDaysInMonth
      : 0;

  const budgetProjectedOverBudget =
    budgetProjectedSpend - totalBudget;

  const budgetIsOver = budgetDifference > 0;

  const getProgressColor = (spent: number, allocated: number) => {
    const p = (spent / allocated) * 100;
    if (p <= 70) return "var(--color-success)";
    if (p <= 90) return "#f59e0b";
    return "var(--color-danger)";
  };
  const getStatusLabel = (spent: number, allocated: number) => {
    const p = (spent / allocated) * 100;
    if (p > 90) return { label: "Critical", cls: "text-[var(--color-danger)]" };
    if (p > 70) return { label: "Nearing limit", cls: "text-amber-500" };
    return { label: "Healthy", cls: "text-[var(--color-success)]" };
  };

  const riskyBudgets = groups.filter(b => b.allocated > 0 && (b.spent / b.allocated) * 100 > 90);

  const isPositiveCommittedValue = (v: string) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) >= 0;

  const validateNumericInput = (raw: string, onValid: (n: number) => void, onRaw: (v: string) => void) => {
    if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
    if (raw.includes(".") && raw.split(".")[1].length > 2) return;
    onRaw(raw);
    if (raw === "" || raw === ".") { onValid(0); return; }
    if (!isPositiveCommittedValue(raw)) return;
    onValid(Number(raw));
  };

  const handleDeleteBudget = async () => {
    const ok = await confirm({ title: "Delete Budget?", message: "This will remove the budget for this month.", confirmText: "Delete", cancelText: "Cancel", variant: "danger" });
    if (!ok) return;
    try {
      await deleteBudgetFn(monthString);
      setIsEditingBudget(false);
      toast.success("Budget deleted successfully");
    } catch { toast.error("Failed to delete budget"); }
  };

  const shiftMonth = (delta: number) => {
    setMonth(prev => {
      const next = new Date(prev);
      next.setDate(1);
      next.setMonth(next.getMonth() + delta);
      next.setHours(0, 0, 0, 0);
      return next;
    });
  };

  const monthLabelLong = month.toLocaleString("default", { month: "long" });
  const monthLabelFull = month.toLocaleString("default", { month: "long", year: "numeric" });
  // const monthLabelShortUpper = month.toLocaleString("default", { month: "short", year: "numeric" }).toUpperCase();
  useHeaderConfig({
    heroColor: null,
    heroHeight: 80,
    showLogo: false,
    scrollTitle: `${monthLabelLong} Budget`,
    scrollAction: null,
    onAction: null,
  });






  // ─── SHARED SUB-COMPONENTS ────────────────────────────────────────────────


  const DesktopDonut: React.FC<{ percent: number }> = ({ percent }) => {
    const donutData = [
      { value: percent, color: "var(--color-success)" },
      { value: 100 - percent, color: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)" },
    ];
    return (
      <div className="relative flex-shrink-0" style={{ width: "250px", height: "250px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={donutData} innerRadius={72} outerRadius={95} dataKey="value" stroke="none" startAngle={90} endAngle={450}>
              {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[1.45rem] font-black text-[var(--color-text-primary)] leading-none">{percent}%</span>
          <span className="text-[0.9rem] text-[var(--color-text-secondary)] mt-3 text-center leading-tight">of budget used</span>
        </div>
      </div>
    );
  };

  // shared card — use for both mobile and desktop center card
  const NoBudgetCard = (
    <div style={{
      position: "relative", overflow: "hidden",
      borderRadius: 20, padding: "32px 24px",
      background: "var(--color-surface)",
      border: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 14, textAlign: "center",
    }}>
      <style>{`
      @keyframes nb-pulse{0%,100%{opacity:.45;transform:scale(1);}50%{opacity:.9;transform:scale(1.07);}}
      @keyframes nb-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
    `}</style>

      {/* blobs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }}>
        <div style={{ position: "absolute", top: "-30%", left: "-10%", width: "55%", paddingBottom: "55%", borderRadius: "50%", background: "radial-gradient(circle,rgba(34,197,94,.10) 0%,transparent 70%)", filter: "blur(32px)" }} />
        <div style={{ position: "absolute", bottom: "-25%", right: "-10%", width: "50%", paddingBottom: "50%", borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,.07) 0%,transparent 70%)", filter: "blur(28px)" }} />
      </div>

      {/* icon */}
      <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center", animation: "nb-float 3.2s ease-in-out infinite", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "1.5px solid rgba(34,197,94,.22)", animation: "nb-pulse 2.8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(34,197,94,.10)", animation: "nb-pulse 2.8s ease-in-out .5s infinite" }} />
        <div style={{
          width: 64, height: 64, borderRadius: 18, position: "relative", zIndex: 1,
          background: "linear-gradient(135deg,rgba(34,197,94,.14) 0%,rgba(16,185,129,.07) 100%)",
          border: "1px solid rgba(34,197,94,.22)", boxShadow: "0 8px 24px rgba(34,197,94,.10)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Sparkles size={26} style={{ color: "#22c55e" }} />
        </div>
      </div>

      {/* text */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 280, position: "relative" }}>
        <p className="text-[14px] md:text-[16px]" style={{ margin: 0, fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "0.01em" }}>
          No Budget Found
        </p>
        <p className="text-[12px] md:text-[14px]" style={{ margin: 0, lineHeight: 1.65, color: "var(--color-text-secondary)" }}>
          Budget creation is only available for the current and next month.
        </p>
      </div>
    </div>
  );
  const skeletonBg =
  "color-mix(in srgb, var(--color-text-secondary) 20%, transparent)";
  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div>
        <style>{`
        @keyframes bg-shimmer {
          0%,100%{ opacity:.30; }
          50%    { opacity:.65; }
        }
      `}</style>

        {/* MOBILE skeleton */}
        <div className="lg:hidden flex flex-col pb-24 px-3 gap-5">
          {/* header — always visible */}
          <div>
            <h2 className="text-[1.5rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">
              {monthLabelLong} Budget
            </h2>
            <div className="inline-flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-xl px-3 py-2 mt-3 border border-(--color-accent-soft)">
              <button onClick={() => shiftMonth(-1)} className="flex items-center text-[var(--color-text-primary)]">
                <ChevronLeft size={14} />
              </button>
              <span className="text-[0.75rem] font-semibold text-[var(--color-text-primary)]">{monthLabelFull}</span>
              <button onClick={() => shiftMonth(1)} disabled={!canGoToNextMonth}
                className="flex items-center text-[var(--color-text-primary)] disabled:opacity-30">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* gauge skeleton */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 220, height: 120, borderRadius: 110,
              background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out infinite"
            }} />
            <div style={{
              height: 13, width: 60, borderRadius: 6,
              background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out .1s infinite"
            }} />
          </div>

          {/* stats row skeleton */}
          <div style={{
            borderRadius: 16, overflow: "hidden",
            background: "linear-gradient(135deg,rgba(34,197,94,0.08),rgba(34,197,94,0.04))",
            border: "1px solid rgba(34,197,94,0.12)"
          }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", borderBottom: i < 2 ? "1px solid var(--border)" : "none"
              }}>
                <div style={{
                  height: 11, width: 70, borderRadius: 5,
                  background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                }} />
                <div style={{
                  height: 13, width: 90, borderRadius: 5,
                  background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                }} />
              </div>
            ))}
          </div>

          {/* unallocated card skeleton */}
          <div style={{
            borderRadius: 16, padding: "16px", display: "flex", alignItems: "center", gap: 12,
            background: "var(--color-surface)", border: "1px solid var(--border)"
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out infinite"
            }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{
                height: 10, width: 110, borderRadius: 5,
                background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out .1s infinite"
              }} />
              <div style={{
                height: 14, width: 80, borderRadius: 5,
                background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out .2s infinite"
              }} />
            </div>
          </div>

          {/* spending pace card skeleton */}
          <div style={{
            borderRadius: 16, overflow: "hidden", background: "var(--color-surface)",
            border: "1px solid var(--border)"
          }}>
            <div style={{ padding: "16px 16px 12px" }}>
              <div style={{
                height: 14, width: 120, borderRadius: 5,
                background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out infinite"
              }} />
              <div style={{
                height: 10, width: 180, borderRadius: 5, marginTop: 8,
                background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out .1s infinite"
              }} />
            </div>
            <div style={{ padding: "0 16px 16px", display: "flex", gap: 12 }}>
              <div style={{
                width: "38%", height: 88, borderRadius: 10,
                background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out infinite"
              }} />
              <div style={{
                flex: 1, height: 88, borderRadius: 10,
                background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out .1s infinite"
              }} />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                padding: "14px 16px", borderTop: "1px solid var(--border)"
              }}>
                <div style={{
                  height: 10, width: 80, borderRadius: 5,
                  background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                }} />
                <div style={{
                  height: 12, width: 100, borderRadius: 5,
                  background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                }} />
              </div>
            ))}
            {/* 3 metric boxes */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              margin: "0 16px 16px", borderRadius: 12, overflow: "hidden",
              border: "1px solid var(--border)"
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 6, padding: "12px 8px",
                  borderRight: i < 2 ? "1px solid var(--border)" : "none"
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                  }} />
                  <div style={{
                    height: 8, width: 32, borderRadius: 4,
                    background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                  }} />
                  <div style={{
                    height: 12, width: 44, borderRadius: 4,
                    background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* category list skeleton */}
          <div style={{
            borderRadius: 16, overflow: "hidden", background: "var(--color-surface)",
            border: "1px solid var(--border)"
          }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                borderBottom: i < 3 ? "1px solid var(--border)" : "none"
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{
                      height: 12, width: "45%", borderRadius: 5,
                      background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                    }} />
                    <div style={{
                      height: 10, width: "20%", borderRadius: 5,
                      background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                    }} />
                  </div>
                  <div style={{
                    height: 5, width: "100%", borderRadius: 99,
                    background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP skeleton */}
        <div className="hidden lg:flex flex-col gap-5 pb-10 w-full">
          {/* header — always visible */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-5">
              <h2 className="text-[2.1rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">
                {monthLabelLong} Budget
              </h2>
              <div className="inline-flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-xl px-3.5 py-2 self-start border border-(--color-accent-soft)">
                <button onClick={() => shiftMonth(-1)} className="flex items-center bg-transparent border-none cursor-pointer text-[var(--color-text-primary)]">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[0.9rem] font-semibold text-[var(--color-text-primary)]">{monthLabelFull}</span>
                <button onClick={() => shiftMonth(1)} disabled={!canGoToNextMonth}
                  className="flex items-center bg-transparent border-none cursor-pointer text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            {/* edit/delete button ghosts */}
            <div style={{ display: "flex", gap: 8 }}>
              {[100, 80].map((w, i) => (
                <div key={i} style={{
                  height: 36, width: w, borderRadius: 10,
                  background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                }} />
              ))}
            </div>
          </div>

          {/* hero 2-col */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-11 items-stretch auto-rows-fr">
            {/* left panel */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* donut + stats card */}
              <div style={{
                padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
                background: "var(--color-surface)", border: "1px solid var(--border)",
                borderRadius: 16, flex: 1
              }}>
                {/* donut ghost */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{
                    width: 200, height: 200, borderRadius: "50%",
                    background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out infinite",
                    position: "relative"
                  }}>
                    <div style={{
                      position: "absolute", inset: 48, borderRadius: "50%",
                      background: "var(--color-surface)"
                    }} />
                  </div>
                </div>
                {/* stats ghost */}
                <div style={{
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  alignItems: "center", gap: 28
                }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{
                        height: 9, width: 60, borderRadius: 4,
                        background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                      }} />
                      <div style={{
                        height: 20, width: 100, borderRadius: 5,
                        background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                      }} />
                    </div>
                  ))}
                </div>
              </div>
              {/* unallocated ghost */}
              <div style={{
                padding: "16px 28px", display: "flex", alignItems: "center", gap: 12,
                background: "var(--color-surface)", border: "1px solid var(--border)", borderRadius: 16
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out infinite"
                }} />
                <div style={{
                  height: 11, width: 130, borderRadius: 5,
                  background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out .1s infinite"
                }} />
                <div style={{
                  height: 16, width: 90, borderRadius: 5, marginLeft: 8,
                  background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out .2s infinite"
                }} />
              </div>
            </div>

            {/* right panel — spending pace */}
            <div style={{
              background: "var(--color-surface)", border: "1px solid var(--border)",
              borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 24
            }}
              className="lg:col-span-6">
              {/* header */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{
                  height: 14, width: 140, borderRadius: 5,
                  background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out infinite"
                }} />
                <div style={{
                  height: 10, width: 220, borderRadius: 5,
                  background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out .1s infinite"
                }} />
              </div>
              {/* pace hero */}
              <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
                <div style={{
                  display: "flex", flexDirection: "column", gap: 12,
                  borderRight: "1px solid var(--border)", paddingRight: 32, flex: 1
                }}>
                  <div style={{
                    height: 38, width: 100, borderRadius: 8,
                    background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out infinite"
                  }} />
                  <div style={{
                    height: 11, width: 120, borderRadius: 5,
                    background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out .1s infinite"
                  }} />
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{
                      height: 9, width: 70, borderRadius: 4,
                      background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out infinite"
                    }} />
                    <div style={{
                      height: 14, width: 90, borderRadius: 5,
                      background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out .1s infinite"
                    }} />
                  </div>
                </div>
                <div style={{
                  width: 280, height: 130, borderRadius: 12, flexShrink: 0,
                  background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out infinite"
                }} />
              </div>
              {/* should/actual/diff */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24,
                padding: "24px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)"
              }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{
                      height: 9, width: 70, borderRadius: 4,
                      background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                    }} />
                    <div style={{
                      height: 16, width: 90, borderRadius: 5,
                      background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                    }} />
                  </div>
                ))}
              </div>
              {/* pace/burn/risk */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    paddingLeft: i > 0 ? 16 : 0, paddingRight: i < 2 ? 16 : 0,
                    borderRight: i < 2 ? "1px solid var(--border)" : "none"
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                      background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                    }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{
                        height: 9, width: 55, borderRadius: 4,
                        background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                      }} />
                      <div style={{
                        height: 14, width: 65, borderRadius: 5,
                        background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                      }} />
                      <div style={{
                        height: 9, width: 50, borderRadius: 4,
                        background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* status bar ghost */}
          <div style={{
            height: 56, borderRadius: 16,
            background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out infinite"
          }} />

          {/* breakdown heading ghost */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <div style={{
              height: 20, width: 160, borderRadius: 6,
              background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out infinite"
            }} />
            <div style={{
              height: 12, width: 80, borderRadius: 5,
              background: skeletonBg, animation: "bg-shimmer 1.6s ease-in-out infinite"
            }} />
          </div>

          {/* category cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{
                background: "var(--color-surface)", border: "1px solid var(--border)",
                borderRadius: 16, padding: 20, opacity: 1 - i * 0.06
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.08}s infinite`
                  }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <div style={{
                      height: 13, width: 90, borderRadius: 5,
                      background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.08}s infinite`
                    }} />
                    <div style={{
                      height: 10, width: 110, borderRadius: 5,
                      background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.08 + 0.1}s infinite`
                    }} />
                  </div>
                </div>
                <div style={{
                  height: 5, borderRadius: 99,
                  background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.08}s infinite`,
                  marginBottom: 10
                }} />
                <div style={{
                  height: 14, width: 40, borderRadius: 5,
                  background: skeletonBg, animation: `bg-shimmer 1.6s ease-in-out ${i * 0.08}s infinite`
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── NO BUDGET (PAST MONTH) ───────────────────────────────────────────────
  if (!budget?.exists && !canCreateBudget) {
    return (
      <div>
        {/* MOBILE */}
        <div className="px-3 flex md:hidden flex-col gap-6 pb-24 w-full ">
          <div className="pb-">
            <div>
              <h2 className="text-[1.5rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">
                {monthLabelLong} Budget
              </h2>
              <div className="inline-flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-xl px-3 py-2 mt-2 border border-(--color-accent-soft) mt-3">
                <button
                  onClick={() => shiftMonth(-1)}
                  className="flex items-center text-[var(--color-text-primary)]"
                >
                  <ChevronLeft size={14} />
                </button>

                <span className="text-[0.75rem] font-semibold text-[var(--color-text-primary)]">
                  {monthLabelFull}
                </span>

                <button
                  onClick={() => shiftMonth(1)}
                  disabled={!canGoToNextMonth}
                  className="flex items-center text-[var(--color-text-primary)] disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
          {NoBudgetCard}
        </div>
        {/* DESKTOP */}
        <div className=" hidden md:flex flex-col gap-4 pb-24 w-full">
          <div className="flex items-center justify-between gap-5">
            <div className="flex flex-col gap-5">
              <h2 className="text-[2.1rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">
                {monthLabelLong} Budget
              </h2>
              {/* Month picker pill */}
              <div className="inline-flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-xl px-3.5 py-2 self-start border border-(--color-accent-soft)">
                <button onClick={() => shiftMonth(-1)}
                  className="flex items-center bg-transparent border-none cursor-pointer text-[var(--color-text-primary)]">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[0.9rem] font-semibold text-[var(--color-text-primary)]">{monthLabelFull}</span>
                <button onClick={() => shiftMonth(1)} disabled={!canGoToNextMonth}
                  className="flex items-center bg-transparent border-none cursor-pointer text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
          {NoBudgetCard}
        </div>

      </div>
    );
  }

  // ─── CREATE / EDIT MODE ───────────────────────────────────────────────────
  if (!budget?.exists || isEditingBudget) {
    if (!isEditingBudget && suggestionsLoading) {
      return (
        <div>
          <style>{`@keyframes sl-shimmer{0%,100%{opacity:.30;}50%{opacity:.65;}}`}</style>

          {/* MOBILE */}
          <div className="lg:hidden flex flex-col pb-24 px-3 gap-5">
            <div>
              <h2 className="text-[1.5rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">
                {isEditingBudget ? `Edit ${monthLabelLong} Budget` : `Create ${monthLabelLong} Budget`}
              </h2>
              <div className="inline-flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-xl px-3 py-2 mt-3 border border-(--color-accent-soft)">
                <button onClick={() => shiftMonth(-1)} className="flex items-center text-[var(--color-text-primary)]"><ChevronLeft size={14} /></button>
                <span className="text-[0.75rem] font-semibold text-[var(--color-text-primary)]">{monthLabelFull}</span>
                <button onClick={() => shiftMonth(1)} disabled={!canGoToNextMonth} className="flex items-center text-[var(--color-text-primary)] disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            </div>
            {/* Step 1 card ghost */}
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ height: 10, width: 140, borderRadius: 5, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out infinite" }} />
              <div style={{ height: 42, width: "70%", borderRadius: 8, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out .1s infinite" }} />
              <div style={{ height: 1, background: "var(--border)" }} />
              <div style={{ height: 10, width: 110, borderRadius: 5, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out infinite" }} />
              <div style={{ height: 6, borderRadius: 99, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out infinite" }} />
              <div style={{ height: 11, width: "55%", borderRadius: 5, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out .1s infinite" }} />
            </div>
            {/* save button ghost */}
            <div style={{ height: 56, borderRadius: 12, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out infinite" }} />
            {/* category cards ghost */}
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: "var(--color-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12, opacity: 1 - i * 0.12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: skeletonBg, animation: `sl-shimmer 1.6s ease-in-out ${i * 0.1}s infinite` }} />
                    <div style={{ height: 13, width: 90, borderRadius: 5, background: skeletonBg, animation: `sl-shimmer 1.6s ease-in-out ${i * 0.1}s infinite` }} />
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: skeletonBg, animation: `sl-shimmer 1.6s ease-in-out ${i * 0.1}s infinite` }} />
                </div>
                <div style={{ height: 28, width: "55%", borderRadius: 6, background: skeletonBg, animation: `sl-shimmer 1.6s ease-in-out ${i * 0.1}s infinite` }} />
              </div>
            ))}
          </div>

          {/* DESKTOP */}
          <div className="hidden lg:flex flex-col gap-6 pb-10 w-full">
            <div className="flex flex-col gap-5">
              <h2 className="text-[2.1rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">
                {isEditingBudget ? `Edit ${monthLabelLong} Budget` : `Create ${monthLabelLong} Budget`}
              </h2>
              <div className="inline-flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-xl px-3.5 py-2 self-start border border-(--color-accent-soft)">
                <button onClick={() => shiftMonth(-1)} className="flex items-center bg-transparent border-none cursor-pointer text-[var(--color-text-primary)]"><ChevronLeft size={16} /></button>
                <span className="text-[0.9rem] font-semibold text-[var(--color-text-primary)]">{monthLabelFull}</span>
                <button onClick={() => shiftMonth(1)} disabled={!canGoToNextMonth} className="flex items-center bg-transparent border-none cursor-pointer text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
              </div>
              <div style={{ height: 16, width: 360, borderRadius: 6, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out infinite" }} />
            </div>
            <div className="grid grid-cols-5 gap-4 items-start">
              {/* left */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div style={{ background: "var(--color-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out infinite" }} />
                    <div style={{ height: 14, width: 180, borderRadius: 5, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out .1s infinite" }} />
                  </div>
                  <div style={{ height: 42, width: "65%", borderRadius: 8, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out infinite" }} />
                  <div style={{ height: 1, background: "var(--border)" }} />
                  <div style={{ height: 10, width: 120, borderRadius: 5, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out infinite" }} />
                  <div style={{ height: 6, borderRadius: 99, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out infinite" }} />
                  <div style={{ height: 11, width: "50%", borderRadius: 5, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out .1s infinite" }} />
                </div>
                <div style={{ height: 56, borderRadius: 12, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out infinite" }} />
              </div>
              {/* right */}
              <div className="lg:col-span-3" style={{ background: "var(--color-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out infinite" }} />
                  <div style={{ height: 14, width: 200, borderRadius: 5, background: skeletonBg, animation: "sl-shimmer 1.6s ease-in-out .1s infinite" }} />
                </div>
                {/* table header */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 80px", gap: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                  {[80, 60, 40].map((w, i) => (
                    <div key={i} style={{ height: 9, width: w, borderRadius: 4, background: skeletonBg, animation: `sl-shimmer 1.6s ease-in-out ${i * 0.1}s infinite` }} />
                  ))}
                </div>
                {/* rows */}
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 200px 80px", gap: 12, alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border)", opacity: 1 - i * 0.12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: skeletonBg, animation: `sl-shimmer 1.6s ease-in-out ${i * 0.1}s infinite` }} />
                      <div style={{ height: 13, width: 100, borderRadius: 5, background: skeletonBg, animation: `sl-shimmer 1.6s ease-in-out ${i * 0.1}s infinite` }} />
                    </div>
                    <div style={{ height: 36, borderRadius: 10, background: skeletonBg, animation: `sl-shimmer 1.6s ease-in-out ${i * 0.1}s infinite` }} />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: skeletonBg, animation: `sl-shimmer 1.6s ease-in-out ${i * 0.1}s infinite` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const allocated = draftCategories.reduce((s, c) => s + c.limit, 0);
    const allocationPercent = draftTotal > 0 ? (allocated / draftTotal) * 100 : 0;
    const isInvalid = allocated > draftTotal;
    const hasInvalidCategoryInputs = draftCategories.some(c =>
      !isPositiveCommittedValue(draftCategoryInputs[c.category_id] ?? String(c.limit))
    );
    const isDraftTotalInputInvalid = !isPositiveCommittedValue(draftTotalInput);
    const isFullyAllocated = draftTotal > 0 && allocated >= draftTotal && !isInvalid;

    // Shared add-categories dropdown
    const AddCategoryDropdown = (
      <div className="relative">
        <button
          onClick={() => setIsSelectorOpen(!isSelectorOpen)}
          className="w-full py-4 flex items-center justify-center gap-2 font-black text-[0.72rem] uppercase tracking-[0.18em] rounded-xl cursor-pointer bg-transparent text-[var(--color-accent)]"
          style={{ border: "1.5px dashed var(--color-accent)" }}
        >
          <PlusCircle size={16} /> Add More Categories
        </button>
        {isSelectorOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsSelectorOpen(false)} />
            <div className="absolute bottom-full mb-3 left-0 right-0 z-50 rounded-2xl shadow-2xl overflow-hidden max-h-[320px] flex flex-col bg-[var(--color-surface)] border border-[var(--border)] lg:fixed lg:bottom-auto lg:top-1/2 lg:left-[58%] lg:right-auto lg:mb-0 lg:w-[min(860px,calc(100vw-10rem))] lg:max-h-[420px] lg:-translate-x-1/2 lg:-translate-y-1/2">
              <div className="overflow-y-auto p-2 no-scrollbar">
                {availableToAdd.length === 0 ? (
                  <div className="py-8 text-center text-xs font-black uppercase text-[var(--color-text-secondary)] opacity-40">
                    No categories found
                  </div>
                ) : availableToAdd.map(cat => {
                  const Icon = resolveLucideIcon(cat.icon || "help");
                  return (
                    <button key={cat.category_id}
                      onClick={() => {
                        setDraftCategories(p => [...p, { category_id: cat.category_id, name: cat.name, limit: isEditingBudget ? 0 : (cat.suggested_limit || 0), icon: cat.icon, color: cat.color }]);
                        setDraftCategoryInputs(p => ({ ...p, [cat.category_id]: String(isEditingBudget ? 0 : (cat.suggested_limit || 0)) }));
                        setSearchQuery(""); setIsSelectorOpen(false);
                      }}
                      className="w-full p-3 flex items-center gap-3 rounded-xl transition-colors hover:bg-[var(--color-background)] text-[var(--color-text-primary)]"
                      style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cat.color}20`, color: cat.color }}>
                        <Icon size={15} />
                      </div>
                      <span className="text-sm font-semibold">{cat.name}</span>
                      <PlusCircle size={13} className="ml-auto opacity-30" />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );

    // Allocation status block — shared between mobile and desktop
    const AllocationStatus = (
      <>
        {/* Dashed divider */}
        <div className="my-5 h-px"
          style={{ background: "repeating-linear-gradient(90deg, var(--border) 0, var(--border) 6px, transparent 6px, transparent 12px)" }} />
        <div className="flex items-center justify-between mb-4">
          <span className="text-[0.6rem] font-black uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
            Allocation Status
          </span>
          <span className={`text-[0.75rem] font-bold tracking-[0.05em] ${isInvalid ? "text-[var(--color-danger)]" : "text-[var(--color-text-primary)]"}`}>
            ₹{allocated.toLocaleString()} / ₹{draftTotal.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--color-background)] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(allocationPercent, 100)}%`, background: isInvalid ? "var(--color-danger)" : "var(--color-success)" }} />
        </div>
        <div className="flex items-center gap-1.5 mt-4">
          {isFullyAllocated ? (
            <>
              <CircleCheckBig width={18} strokeWidth={2} className="text-(--color-primary)" />
              <span className="text-[0.8rem] font-semibold text-[var(--color-success)]">Fully allocated</span>
            </>
          ) : isInvalid ? (
            <span className="text-[0.8rem] text-[var(--color-danger)] flex items-center gap-1.5 font-semibold"><TriangleAlert width={18} strokeWidth={2} className="text-(--color-warm)" /> Allocation exceeds monthly limit.</span>
          ) : (
            <span className="text-[0.8rem] text-[var(--color-text-primary)]">
              ₹{(draftTotal - allocated).toLocaleString()} left to allocate.
            </span>
          )}
        </div>
      </>
    );

    // Mobile category cards
    const MobileCategoryCards = (
      <div className="flex flex-col gap-2.5">
        {draftCategories.map((c, i) => {
          const CatIcon = resolveLucideIcon(c.icon || "help");
          return (
            <div key={c.category_id}
              className="rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--border)] shadow-xs">
              {/* Top: icon + name + trash */}
              <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c.color}20`, color: c.color }}>
                    <CatIcon size={19} />
                  </div>
                  <span className="text-[0.9rem] font-bold text-[var(--color-text-primary)]">{c.name}</span>
                </div>
                <button
                  onClick={() => {
                    setDraftCategories(p => p.filter(dc => dc.category_id !== c.category_id));
                    setDraftCategoryInputs(p => { const n = { ...p }; delete n[c.category_id]; return n; });
                  }}
                  className="text-[var(--color-danger)] bg-transparent border-none cursor-pointer p-1">
                  <Trash2 size={17} />
                </button>
              </div>
              {/* Bottom: ₹ input + pencil */}
              <label
                className="flex items-center justify-between px-5 pb-3.5 cursor-text"

              >
                <div className="flex items-center gap-2">
                  <span className="text-[1.4rem] font-light text-[var(--color-text-secondary)] leading-none">₹</span>
                  <input
                    type="text" inputMode="decimal"
                    value={draftCategoryInputs[c.category_id] ?? String(c.limit)}
                    onChange={e => validateNumericInput(e.target.value,
                      v => setDraftCategories(p => { const n = [...p]; n[i] = { ...n[i], limit: v }; return n; }),
                      v => setDraftCategoryInputs(p => ({ ...p, [c.category_id]: v }))
                    )}
                    onBlur={() => setDraftCategoryInputs(p => ({ ...p, [c.category_id]: String(c.limit) }))}
                    className="text-[1.4rem] font-black bg-transparent border-none outline-none text-[var(--color-text-primary)] tracking-tight w-full"
                    placeholder="0"
                  />
                </div>
                <Pencil size={16} className="text-[var(--color-text-secondary)]" />
              </label>
            </div>
          );
        })}
        <div className="mt-1.5">{AddCategoryDropdown}</div>
      </div>
    );

    return (
      <>
        {/* ═══ MOBILE ══════════════════════════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col pb-24 px-3 gap-5 bg-[var(--color-background)] min-h-screen">
          <div>
            <h2 className="text-[1.5rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">
              {isEditingBudget ? `Edit ${monthLabelLong} Budget` : `Create ${monthLabelLong} Budget`}
            </h2>
            <div className="inline-flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-xl px-3 py-2 mt-2 border border-(--color-accent-soft) mt-3">
              <button
                onClick={() => shiftMonth(-1)}
                className="flex items-center text-[var(--color-text-primary)]"
              >
                <ChevronLeft size={14} />
              </button>

              <span className="text-[0.75rem] font-semibold text-[var(--color-text-primary)]">
                {monthLabelFull}
              </span>

              <button
                onClick={() => shiftMonth(1)}
                disabled={!canGoToNextMonth}
                className="flex items-center text-[var(--color-text-primary)] disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <p className="mt-3 text-[0.8rem] font-semibold text-(--color-text-secondary)">
              {isEditingBudget ? "Update your monthly budget and category limits below." : "We've suggested limits based on your history. Fine-tune them below."}
            </p>
          </div>


          {/* Step 1 panel */}
          <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.15em] text-[var(--color-text-secondary)] mb-3.5">
              Target Monthly Limit
            </p>
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 flex-1 cursor-text">
                <span className="text-[2.4rem] font-light text-[var(--color-text-secondary)] leading-none flex-shrink-0">₹</span>
                <input
                  type="text" inputMode="decimal" value={draftTotalInput}
                  onChange={e => validateNumericInput(e.target.value, setDraftTotal, setDraftTotalInput)}
                  onBlur={() => setDraftTotalInput(String(draftTotal))}
                  className="text-[2.4rem] font-black bg-transparent border-none outline-none w-full tracking-tight leading-none text-[var(--color-text-primary)]"
                  placeholder="0"
                />
                <Pencil size={17} className="relative top-1 bg-transparent border-none cursor-pointer text-[var(--color-text-secondary) flex-shrink-0" />
              </label>
            </div>
            {AllocationStatus}
          </div>

          {/* Cancel + Save */}
          <div className={`grid gap-3 ${isEditingBudget ? "grid-cols-2" : "grid-cols-1"}`}>
            {isEditingBudget && (
              <button
                onClick={() => isEditingBudget ? setIsEditingBudget(false) : undefined}
                className="py-[18px] rounded-xl text-[0.72rem] font-black uppercase tracking-[0.18em] bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-text-secondary)]/50 cursor-pointer hover:bg-[var(--color-background)] transition-colors">
                Cancel
              </button>
            )}
            <button
              disabled={isInvalid || isSavingBudget || draftTotal <= 0 || isDraftTotalInputInvalid || hasInvalidCategoryInputs}
              onClick={async () => {
                await mutateAsync({ month: monthString, total_limit: draftTotal, categories: draftCategories.map(c => ({ category_id: c.category_id, limit: c.limit })) });
                setIsEditingBudget(false);
              }}
              className="py-[18px] rounded-xl text-[0.72rem] font-black uppercase tracking-[0.18em] bg-[var(--color-accent)] text-white border border-[var(--border)] cursor-pointer transition-colors disabled:opacity-30">
              {isSavingBudget
                ? "Saving..."
                : isEditingBudget
                  ? "Save Budget"
                  : "Initialize Budget"}
            </button>
          </div>

          <div className="my-1 relative h-px bg-[var(--border)] md:bottom-0 md:left-15 md:right-2" />

          {/* Active distribution heading */}
          <div className="flex items-center justify-between">
            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              Active Distribution
            </span>
            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              {draftCategories.length} Categories
            </span>
          </div>

          {MobileCategoryCards}
        </div>

        {/* ═══ DESKTOP ═════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-col gap-6 pb-10 w-full">
          {/* Header */}
          <div className="flex flex-col gap-5">
            <h2 className="text-[2.1rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">
              {isEditingBudget ? `Edit ${monthLabelLong} Budget` : `Create ${monthLabelLong} Budget`}
            </h2>
            <div className="inline-flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-xl px-3.5 py-2 self-start border border-(--color-accent-soft)">
              <button onClick={() => shiftMonth(-1)}
                className="flex items-center bg-transparent border-none cursor-pointer text-[var(--color-text-primary)]">
                <ChevronLeft size={16} />
              </button>
              <span className="text-[0.9rem] font-semibold text-[var(--color-text-primary)]">{monthLabelFull}</span>
              <button onClick={() => shiftMonth(1)} disabled={!canGoToNextMonth}
                className="flex items-center bg-transparent border-none cursor-pointer text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight size={16} />
              </button>
            </div>
            <p className="text-[1rem] font-semibold text-[var(--color-text-secondary)]">
              {isEditingBudget ? "Update your monthly budget and category limits below." : "We've suggested limits based on your history. Fine-tune them below."}
            </p>
          </div>

          {/* 2/3 grid */}
          <div className="grid grid-cols-5 gap-4 items-start">

            {/* LEFT: Step 1 */}
            <div className="flex flex-col gap-4 lg:col-span-2 ">
              <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs">
                {/* Badge */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[0.85rem] font-black text-(--color-primary) pt-[2px]">1</span>
                  </div>
                  <span className="text-base font-bold text-[var(--color-text-primary)]">Set your monthly limit</span>
                </div>
                {/* 
                <p className="text-[0.6rem] font-black uppercase tracking-[0.1rem] text-[var(--color-text-secondary)] mb-3.5">
                  Total Monthly Limit
                </p> */}
                <div className={`flex items-center justify-between gap-3 ${fontSizeClass}`}>
                  <label className="flex items-center gap-2.5 flex-1 cursor-text relative">
                    <span className="text-[2.6rem] font-light text-[var(--color-text-secondary)] leading-none flex-shrink-0">₹</span>
                    <input
                      type="text" inputMode="decimal" value={draftTotalInput}
                      onChange={e => validateNumericInput(e.target.value, setDraftTotal, setDraftTotalInput)}
                      onBlur={() => setDraftTotalInput(String(draftTotal))}
                      className="text-[2.6rem] font-black bg-transparent border-none outline-none w-full tracking-tight leading-none text-[var(--color-text-primary)]"
                      placeholder="0"
                    />
                    <Pencil size={18} className="cursor-pointer absolute right-0 text-[var(--color-text-secondary)] " />
                  </label>
                </div>

                {AllocationStatus}
              </div>

              {/* CANCEL + SAVE */}
              <div className={`grid gap-3 ${isEditingBudget ? "grid-cols-2" : "grid-cols-1"}`}>
                {isEditingBudget && (
                  <button
                    onClick={() => isEditingBudget ? setIsEditingBudget(false) : undefined}
                    className="py-[18px] rounded-xl text-[0.72rem] font-black uppercase tracking-[0.18em] bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-text-secondary)]/50 cursor-pointer hover:bg-[var(--color-background)] transition-colors">
                    Cancel
                  </button>
                )}
                <button
                  disabled={isInvalid || isSavingBudget || draftTotal <= 0 || isDraftTotalInputInvalid || hasInvalidCategoryInputs}
                  onClick={async () => {
                    await mutateAsync({ month: monthString, total_limit: draftTotal, categories: draftCategories.map(c => ({ category_id: c.category_id, limit: c.limit })) });
                    setIsEditingBudget(false);
                  }}
                  className="py-[18px] rounded-xl text-[0.72rem] font-black uppercase tracking-[0.18em] bg-[var(--color-accent)] text-white border border-[var(--border)] cursor-pointer transition-colors disabled:opacity-30">
                  {isSavingBudget
                    ? "Saving..."
                    : isEditingBudget
                      ? "Save Budget"
                      : "Initialize Budget"}
                </button>
              </div>
            </div>

            {/* RIGHT: Step 2 */}
            <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col lg:col-span-3 shadow-xs">
              {/* Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[0.85rem] font-black text-(--color-primary) pt-[2px]">2</span>
                </div>
                <span className="text-base font-bold text-[var(--color-text-primary)]">Allocate to categories</span>
              </div>

              {/* Table header */}
              <div className="grid gap-3 pb-3 border-b border-[var(--border)] mb-1"
                style={{ gridTemplateColumns: "1fr 200px 80px" }}>
                {(["Category", "Allocation", "Action"] as const).map((h, i) => (
                  <span key={h}
                    className={`text-[0.58rem] font-black uppercase tracking-[0.15em] text-[var(--color-text-secondary)] ${i === 2 ? "text-right" : ""}`}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {draftCategories.map((c, i) => {
                const CatIcon = resolveLucideIcon(c.icon || "help");
                return (
                  <div key={c.category_id}
                    className="grid gap-3 items-center py-3 border-b border-[var(--border)]"
                    style={{ gridTemplateColumns: "1fr 200px 80px" }}>

                    {/* Category */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                        style={{ background: `${c.color}20`, color: c.color }}>
                        <CatIcon size={18} />
                      </div>
                      <span className="text-[0.92rem] font-semibold text-[var(--color-text-primary)]">{c.name}</span>
                    </div>

                    {/* Input */}
                    <div className="relative">
                      <label className="flex items-center gap-1.5 bg-[var(--color-background)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 pr-8 cursor-text">
                        <span className="text-[0.82rem] font-semibold text-[var(--color-text-secondary)] flex-shrink-0">₹</span>
                        <input
                          type="text" inputMode="decimal"
                          value={draftCategoryInputs[c.category_id] ?? String(c.limit)}
                          onChange={e => validateNumericInput(e.target.value,
                            v => setDraftCategories(p => { const n = [...p]; n[i] = { ...n[i], limit: v }; return n; }),
                            v => setDraftCategoryInputs(p => ({ ...p, [c.category_id]: v }))
                          )}
                          onBlur={() => setDraftCategoryInputs(p => ({ ...p, [c.category_id]: String(c.limit) }))}
                          className="text-[1rem] font-bold bg-transparent border-none outline-none w-full text-[var(--color-text-primary)]"
                          placeholder="0"
                        />
                        <Pencil size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-accent)]" />
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setDraftCategories(p => p.filter(dc => dc.category_id !== c.category_id));
                          setDraftCategoryInputs(p => { const n = { ...p }; delete n[c.category_id]; return n; });
                        }}
                        className="p-1 bg-transparent border-none cursor-pointer text-[var(--color-danger)]">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="mt-4">{AddCategoryDropdown}</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── VIEW MODE ────────────────────────────────────────────────────────────

  return (
    <>
      {/* ═══ MOBILE VIEW ══════════════════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col pb-24 px-1 bg-[var(--color-background)] min-h-screen">
        {/* Header */}
        <div className="px-2 pb-4 flex items-start justify-between">
          {/* LEFT: TITLE + MONTH */}
          <div>
            <h2 className="text-[1.5rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">
              {monthLabelLong} Budget
            </h2>

            <div className="inline-flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-xl px-3 py-2 mt-2 border border-(--color-accent-soft) mt-3">
              <button
                onClick={() => shiftMonth(-1)}
                className="flex items-center text-[var(--color-text-primary)]"
              >
                <ChevronLeft size={14} />
              </button>

              <span className="text-[0.75rem] font-semibold text-[var(--color-text-primary)]">
                {monthLabelFull}
              </span>

              <button
                onClick={() => shiftMonth(1)}
                disabled={!canGoToNextMonth}
                className="flex items-center text-[var(--color-text-primary)] disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* RIGHT: ACTIONS */}
          {canCreateBudget && (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setIsEditingBudget(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--color-surface)]"
              >
                <Pencil size={16} className="text-[var(--color-text-secondary)]" />
              </button>

              <button
                onClick={handleDeleteBudget}
                disabled={isDeletingBudget}
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 disabled:opacity-50"
              >
                <Trash2 size={16} className="text-[var(--color-danger)]" />
              </button>
            </div>
          )}
        </div>

        {/* Semicircle gauge */}
        <div className="flex flex-col items-center pb-2">
          <div className="relative" style={{ width: "220px" }}>
            <SemiGauge percent={spentPercent} />
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-center">
              <p className="text-[2.6rem] font-black tracking-tighter leading-none text-[var(--color-text-primary)]">
                {spentPercent}%
              </p>
              <p className="text-[0.78rem] text-[var(--color-text-secondary)] mt-0.5">of budget used</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="mx-2 mt-2 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))",
            border: "1px solid rgba(16,185,129,0.15)",
          }}
        >
          {[
            { label: "Limit Set", value: totalBudget, cls: "text-[var(--color-text-primary)]" },
            { label: "Spent", value: spentTotal, cls: "text-[var(--color-warm)]" },
            { label: "Available", value: availableAmount, cls: "text-[var(--color-success)]" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                // borderTop: i !== 0 ? "1px solid var(--border)" : "none",
              }}
            >
              {/* Label on left */}
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  flexShrink: 0,
                }}
              >
                {item.label}
              </span>

              {/* Amount on right */}
              <span
                className={item.cls}
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  textAlign: "right",
                }}
              >
                ₹{item.value.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>

        {/* Unallocated */}
        <div className="mx-2 mt-3 rounded-2xl flex items-center justify-between px-4 py-4 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-[10px] bg-[var(--color-accent-soft)] flex items-center justify-center">
              <Wallet size={18} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="text-[0.72rem] text-[var(--color-text-secondary)] font-semibold mb-1">Unallocated Funds</p>
              <p className="text-[1.05rem] font-black tracking-tight text-[var(--color-text-primary)]">
                ₹{remainingToAllocate.toLocaleString()}
              </p>
            </div>
          </div>
          {/* <ChevronRight size={18} className="text-[var(--color-text-secondary)] opacity-40" /> */}
        </div>

        {/* ── RISKY BUDGETS (mobile) ───────────────────────────── */}
        <div className="mx-2 mt-3">
          {riskyBudgets.length === 0 ? (
            <div className="px-4 py-3.5 flex items-center gap-3 bg-[var(--color-accent-soft)] rounded-2xl border border-(--color-accent-soft)">
              <div className="w-9 h-9 rounded-[10px] bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0">
                <Sparkles size={17} className="text-[var(--color-accent)]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.8rem] font-bold text-[var(--color-success)]">You're doing great!</span>
                <span className="text-[0.7rem] text-[var(--color-text-secondary)]">
                  All categories are within healthy limits.
                </span>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3.5 flex items-center gap-3 bg-[var(--color-danger)]/10 rounded-2xl border border-[var(--color-danger)]/10">
              <div className="w-9 h-9 rounded-[10px] bg-[var(--color-danger)]/10 flex items-center justify-center flex-shrink-0">
                <Flame size={17} className="text-[var(--color-danger)]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.8rem] font-bold text-[var(--color-danger)]">Budget Warnings</span>
                <span className="text-[0.7rem] text-[var(--color-text-secondary)]">
                  {riskyBudgets.length} categories exceeding limit.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── SPENDING PACE (mobile) ───────────────────────────── */}
        <div className="mx-2 mt-3 bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xs">

          {/* Header */}
          <div className="px-4 pt-4 pb-3 mb-2">
            <p className="font-bold text-base md:text-lg text-[var(--color-text-primary)] tracking-tight">Spending Pace</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              How you're tracking against your ideal pace
            </p>
          </div>

          {/* Hero + Chart Combined */}
          <div className="px-4 pt-5 pb-4">
            <div className="flex gap-3 items-stretch">

              {/* Left Hero */}
              <div className="w-[38%] flex flex-col gap-1 justify-between border-r border-(--border)">
                <div>
                  <p
                    className={`text-[1.5rem] font-black tracking-tight leading-none ${budgetIsOver
                      ? "text-[var(--color-danger)]"
                      : "text-[var(--color-success)]"
                      }`}
                  >
                    {budgetActualSpent === 0
                      ? "0%"
                      : `${budgetIsOver ? "+" : "-"}${Math.abs(
                        budgetPacePercent
                      ).toFixed(0)}%`}
                  </p>

                  <p className="text-[0.78rem] text-[var(--color-text-secondary)] mt-2 leading-snug">
                    {budgetIsOver
                      ? "over ideal pace"
                      : "under ideal pace"}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-[0.62rem] uppercase tracking-[0.12em] font-black text-[var(--color-text-secondary)]">
                    Ideal pace
                  </p>

                  <p className="text-[0.82rem] font-black text-[var(--color-text-primary)] mt-1">
                    ₹{formatCompactCurrency(+budgetIdealPerDay.toFixed(2))}
                    <span className="text-[0.72rem] font-semibold text-[var(--color-text-secondary)]">
                      /day
                    </span>
                  </p>
                </div>
              </div>

              {/* Right Chart */}
              <div className="flex-1">
                <div style={{ height: "88px" }}>
                  <PaceVsIdealChart
                    totalBudget={totalBudget}
                    daysInMonth={budgetDaysInMonth}
                    currentDay={budgetCurrentDay}
                    dailySpending={budget.daily_spending ?? []}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Financial Summary */}
          <div className="pb-4">
            <div className="rounded-2xl overflow-hidden mt-2">
              {[
                {
                  label: "Should Be",
                  value: `₹${budgetShouldHaveSpent.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}`,
                  cls: "text-[var(--color-text-primary)]",
                },
                {
                  label: "Actual Spent",
                  value: `₹${budgetActualSpent.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}`,
                  cls: "text-[var(--color-text-primary)]",
                },
                {
                  label: "Difference",
                  value: `${budgetIsOver ? "+" : "-"}₹${Math.abs(
                    budgetDifference
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}`,
                  cls: budgetIsOver
                    ? "text-[var(--color-danger)]"
                    : "text-[var(--color-success)]",
                },
              ].map((item, i, arr) => (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-4 px-4 py-3.5 ${i < arr.length - 1
                    ? "border-b border-[var(--border)]"
                    : ""
                    }`}
                >
                  <span className="text-[0.75rem] font-semibold text-[var(--color-text-secondary)] shrink-0">
                    {item.label}
                  </span>

                  <span
                    className={`text-[0.95rem] font-semibold text-right leading-none ${item.cls}`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Metrics */}
          <div className="mx-4 mb-4 rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="grid grid-cols-3 bg-[var(--color-background)]">

              {/* Pace */}
              <div className="flex flex-col items-center justify-center py-3 px-2">
                <CircleGauge
                  size={18}
                  strokeWidth={2}
                  className="text-(--color-primary)"
                />

                <p className="mt-2 text-[0.58rem] uppercase tracking-[0.1em] font-black text-[var(--color-text-secondary)]">
                  Pace
                </p>

                <p className="mt-1 text-[0.82rem] font-black text-[var(--color-text-primary)] leading-none">
                  ₹{formatCompactCurrency(Math.round(
                    budgetActualSpent / Math.max(budgetCurrentDay, 1)
                  ))}
                </p>

                <p className="mt-2 text-[0.64rem] text-[var(--color-text-secondary)] leading-none">
                  per day
                </p>
              </div>

              {/* Burn */}
              <div className="flex flex-col items-center justify-center py-3 px-2 border-x border-[var(--border)]">
                <Flame
                  size={18}
                  strokeWidth={2}
                  className="text-(--color-warm)"
                />

                <p className="mt-2 text-[0.58rem] uppercase tracking-[0.1em] font-black text-[var(--color-text-secondary)]">
                  Burn
                </p>

                <p className="mt-1 text-[0.82rem] font-black text-(--color-warm) leading-none">
                  {budgetBurnRate.toFixed(1)}×
                </p>

                <p className="mt-2 text-[0.64rem] text-[var(--color-text-secondary)] leading-none">
                  vs ideal
                </p>
              </div>

              {/* Risk */}
              <div className="flex flex-col items-center justify-center py-3 px-2">
                {budgetProjectedSpend > totalBudget ? (
                  <ShieldAlert
                    size={18}
                    strokeWidth={2}
                    className="text-(--color-danger)"
                  />
                ) : (
                  <ShieldCheck
                    size={18}
                    strokeWidth={2}
                    className="text-(--color-primary)"
                  />
                )}

                <p className="mt-2 text-[0.58rem] uppercase tracking-[0.1em] font-black text-[var(--color-text-secondary)]">
                  Risk
                </p>

                <p
                  className={`mt-1 text-[0.8rem] font-black leading-none text-center ${budgetProjectedSpend > totalBudget
                    ? "text-[var(--color-danger)]"
                    : "text-[var(--color-success)]"
                    }`}
                >
                  {budgetProjectedSpend > totalBudget
                    ? `+₹${Math.round(
                      budgetProjectedOverBudget
                    ).toLocaleString()}`
                    : "On track"}
                </p>

                <p className="mt-2 text-[0.64rem] text-[var(--color-text-secondary)] text-center leading-none">
                  {budgetProjectedSpend > totalBudget
                    ? "projected overspend"
                    : "within budget"}
                </p>
              </div>

            </div>
          </div>
        </div>


        {/* Category Overview */}
        <div className="mx-2 mt-5 mb-3 flex items-center justify-between">
          <h2 className="text-base font-black text-[var(--color-text-primary)]">Category Overview</h2>
          <span className="text-[0.72rem] text-[var(--color-text-secondary)]">{groups.length} Categories</span>
        </div>

        {/* Category list */}
        <div className="mx-2 rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--border)] shadow-xs">
          {groups.map((b, i) => {
            const Icon = resolveLucideIcon(b.icon || "help");
            const percent = Math.min((b.spent / b.allocated) * 100, 100);
            const progressColor = getProgressColor(b.spent, b.allocated);
            const status = getStatusLabel(b.spent, b.allocated);
            return (
              <div key={i} className="px-4 py-3.5"
                style={{ borderBottom: i < groups.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${b.color}18`, color: b.color }}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[0.9rem] font-bold text-[var(--color-text-primary)] mb-1">{b.category}</p>
                      <span className={`text-[0.7rem] font-bold ${status.cls}`}>{status.label}</span>
                    </div>
                    <p className="text-[0.75rem] text-[var(--color-text-secondary)] mb-2 font-semibold">
                      ₹{b.spent.toLocaleString()} / ₹{b.allocated.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-[5px] rounded-full overflow-hidden bg-[var(--color-background)]">
                        <div className="h-full rounded-full" style={{ width: `${percent}%`, background: progressColor }} />
                      </div>
                      <span className="text-[0.82rem] font-black text-[var(--color-text-primary)] min-w-[32px] text-right">
                        {Math.round(percent)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ═══ DESKTOP VIEW ═════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col gap-4 pb-10 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-5">
            <h2 className="text-[2.1rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">
              {monthLabelLong} Budget
            </h2>
            {/* Month picker pill */}
            <div className="inline-flex items-center gap-2 bg-[var(--color-accent-soft)] rounded-xl px-3.5 py-2 self-start border border-(--color-accent-soft)">
              <button onClick={() => shiftMonth(-1)}
                className="flex items-center bg-transparent border-none cursor-pointer text-[var(--color-text-primary)]">
                <ChevronLeft size={16} />
              </button>
              <span className="text-[0.9rem] font-semibold text-[var(--color-text-primary)]">{monthLabelFull}</span>
              <button onClick={() => shiftMonth(1)} disabled={!canGoToNextMonth}
                className="flex items-center bg-transparent border-none cursor-pointer text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {canCreateBudget && (
              <>
                <button onClick={() => setIsEditingBudget(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[0.85rem] font-semibold bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--border)] cursor-pointer hover:bg-[var(--color-background)] transition-colors">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={handleDeleteBudget} disabled={isDeletingBudget}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[0.85rem] font-semibold text-[var(--color-danger)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/8 cursor-pointer disabled:opacity-50">
                  <Trash2 size={14} /> Delete
                </button>
              </>
            )}
            {/* <button className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[0.85rem] font-semibold bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--border)] cursor-pointer hover:bg-[var(--color-background)] transition-colors">
              <SlidersHorizontal size={14} /> Filters
            </button>
            <button className="flex p-2 rounded-[10px] bg-[var(--color-surface)] border border-[var(--border)] cursor-pointer text-[var(--color-text-primary)] hover:bg-[var(--color-background)] transition-colors">
              <MoreHorizontal size={16} />
            </button> */}
          </div>
        </div>

        {/* Hero 2-col */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-11 items-stretch auto-rows-fr">
          {/* Left panel */}
          <div className="lg:col-span-5 h-full flex flex-col gap-4">
            {/* Donut + stats */}
            <div className="p-6 grid grid-cols-1 gap-4 lg:grid-cols-12 bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden flex-1">

              {/* LEFT: BIG DONUT */}
              <div className="flex flex-col justify-center items-center lg:col-span-6 h-full">
                <DesktopDonut percent={spentPercent} />
              </div>

              {/* RIGHT: STACKED STATS */}
              <div className="flex flex-col justify-center items-center gap-7 flex-1 min-w-0 lg:col-span-6 h-full text-center">
                {[
                  {
                    label: "Limit Set",
                    value: `₹${totalBudget.toLocaleString()}`,
                    cls: "text-[var(--color-text-primary)]",
                  },
                  {
                    label: "Spent",
                    value: `₹${spentTotal.toLocaleString()}`,
                    cls: "text-[var(--color-warm)]",
                  },
                  {
                    label: "Available",
                    value: `₹${availableAmount.toLocaleString()}`,
                    cls: "text-[var(--color-success)]",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col">
                    <p className="text-[0.7rem] font-bold text-(--color-text-secondary) mb-2 uppercase">
                      {item.label}
                    </p>
                    <p className={`text-[1.4rem] font-black tracking-tight ${item.cls}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Unallocated */}
            <div className="px-7 py-4 flex items-center justify-between bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-[var(--color-accent-soft)] flex items-center justify-center">
                  <Wallet size={17} className="text-[var(--color-accent)]" />
                </div>

                <span className="text-[0.9rem] font-semibold text-[var(--color-text-secondary)]">
                  Unallocated Funds
                </span>

                <span className="text-[1rem] font-black text-[var(--color-text-primary)]">
                  ₹{remainingToAllocate.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl lg:col-span-6 h-full">

            <div className="p-7 flex flex-col gap-6">

              {/* HEADER */}
              <div>
                <p className="text-base font-semibold text-[var(--color-text-primary)]">
                  Spending Pace
                </p>
                <p className="text-[0.8rem] text-[var(--color-text-secondary)] mt-1">
                  How you're tracking against your ideal pace
                </p>
              </div>

              {/* TOP: VALUE + LEGEND + CHART */}
              <div className="flex items-center gap-10">

                {/* LEFT */}
                <div className="flex-1 min-w-0 flex flex-col justify-between items-start gap-2 border-r border-(--border)">
                  <div>
                    <p
                      className={`text-[2.6rem] font-black tracking-tight leading-none ${budgetIsOver
                        ? "text-[var(--color-danger)]"
                        : "text-[var(--color-success)]"
                        }`}
                    >
                      {budgetActualSpent === 0
                        ? "0%"
                        : `${budgetIsOver ? "+" : "-"}${Math.abs(
                          budgetPacePercent
                        ).toFixed(0)}%`}
                    </p>

                    <p className="text-[0.85rem] text-[var(--color-text-secondary)] mt-2">
                      {budgetIsOver ? "over ideal pace" : "under ideal pace"}
                    </p>

                  </div>

                  <div className="mt-4">
                    <p className="text-[0.62rem] uppercase tracking-[0.12em] font-black text-[var(--color-text-secondary)]">
                      Ideal pace
                    </p>

                    <p className="text-[1rem] font-bold text-[var(--color-text-primary)] mt-1">
                      ₹{formatCompactCurrency(+budgetIdealPerDay.toFixed(2))}
                      <span className="text-[0.72rem] font-semibold text-[var(--color-text-secondary)]">
                        /day
                      </span>
                    </p>
                  </div>
                </div>

                {/* CHART */}
                <div className="w-[280px] h-[130px] flex-shrink-0 flex items-center justify-center">
                  <PaceVsIdealChart
                    totalBudget={totalBudget}
                    daysInMonth={budgetDaysInMonth}
                    currentDay={budgetCurrentDay}
                    dailySpending={budget.daily_spending ?? []} />
                </div>

              </div>

              {/* DIVIDER */}
              {/* <div className="h-px bg-[var(--border)]" /> */}

              {/* SHOULD / ACTUAL / DIFFERENCE */}
              <div className="grid grid-cols-3 gap-6 py-6 border-b border-t border-(--border)">

                <div>
                  <p className="text-[0.7rem] font-semibold text-[var(--color-text-secondary)] mb-2">
                    SHOULD BE
                  </p>

                  <p className="text-[1rem] font-bold text-[var(--color-text-primary)]">
                    ₹
                    {budgetShouldHaveSpent.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-[0.7rem] font-semibold text-[var(--color-text-secondary)] mb-2">
                    ACTUAL
                  </p>

                  <p className="text-[1rem] font-bold text-[var(--color-text-primary)]">
                    ₹
                    {budgetActualSpent.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-[0.7rem] font-semibold text-[var(--color-text-secondary)] mb-2">
                    DIFFERENCE
                  </p>

                  <p
                    className={`text-[1rem] font-bold ${budgetIsOver
                      ? "text-[var(--color-danger)]"
                      : "text-[var(--color-success)]"
                      }`}
                  >
                    {budgetIsOver ? "+" : "-"}₹
                    {Math.abs(budgetDifference).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>

              </div>

              {/* DIVIDER */}
              {/* <div className="h-px bg-[var(--border)]" /> */}

              {/* BOTTOM METRICS */}
              <div className="grid grid-cols-3 divide-x divide-[var(--border)]">

                {/* PACE */}
                <div className="flex items-center gap-3 pr-4">
                  <CircleGauge size={34} strokeWidth={2} className="text-(--color-primary)" />
                  <div>
                    <p className="text-[0.7rem] text-[var(--color-text-secondary)] mb-2 font-semibold">PACE</p>
                    <p className="text-[1rem] font-bold text-[var(--color-text-primary)] mb-1">
                      ₹{formatCompactCurrency(Math.round(budgetActualSpent / Math.max(budgetCurrentDay, 1)))}
                      {/* /
                      ₹{formatCompactCurrency(Math.round(budgetIdealPerDay))} */}
                    </p>
                    <p className="text-[0.7rem] text-[var(--color-text-secondary)]">per day</p>
                  </div>
                </div>

                {/* BURN */}
                <div className="flex items-center gap-3 px-4">
                  <Flame size={34} strokeWidth={2} className="text-(--color-warm)" />

                  <div>
                    <p className="text-[0.7rem] text-[var(--color-text-secondary)] mb-2 font-semibold">BURN RATE</p>
                    <p className="text-[1rem] font-bold text-(--color-warm) mb-1">
                      {budgetBurnRate.toFixed(1)}×
                    </p>
                    <p className="text-[0.7rem] text-[var(--color-text-secondary)]">vs ideal</p>
                  </div>
                </div>

                {/* RISK */}
                <div className="flex items-center gap-3 pl-4">
                  {budgetProjectedSpend > totalBudget ? (
                    <ShieldAlert size={34} strokeWidth={2} className="text-(--color-danger)" />

                  ) : (

                    <ShieldCheck size={34} strokeWidth={2} className="text-(--color-primary)" />
                  )}

                  <div>
                    <p className="text-[0.7rem] text-[var(--color-text-secondary)] mb-2 font-semibold">RISK</p>
                    <p
                      className={`text-[1rem] font-bold mb-1 ${budgetProjectedSpend > totalBudget
                        ? "text-[var(--color-danger)]"
                        : "text-[var(--color-success)]"
                        }`}
                    >
                      {budgetProjectedSpend > totalBudget
                        ? `+₹${Math.round(budgetProjectedOverBudget).toLocaleString()}`
                        : "On track"}
                    </p>
                    <p className="text-[0.7rem] text-[var(--color-text-secondary)]">
                      {budgetProjectedSpend > totalBudget
                        ? "projected overspend"
                        : "within budget"}
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
        <div>
          {riskyBudgets.length === 0 ? (
            <>
              <div className="px-7 py-3.5 flex items-center justify-between bg-[var(--color-accent-soft)] rounded-2xl shadow-xs border border-(--color-accent-soft)">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[10px] bg-[var(--color-accent-soft)] flex items-center justify-center">
                    <Sparkles size={17} className="text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <span className="text-[0.9rem] font-bold text-[var(--color-success)]">You're doing great!</span>
                    <span className="text-[0.8rem] text-[var(--color-text-secondary)] ml-2">
                      All categories are within healthy limits.
                    </span>
                  </div>

                </div>
                {/* <ChevronRight size={16} className="text-[var(--color-text-secondary)] opacity-40" /> */}
              </div>
            </>
          ) : (
            <>
              <div className="px-7 py-3.5 flex items-center justify-between bg-[var(--color-danger)]/10 rounded-2xl shadow-xs border border-(--color-danger)/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[10px] bg-[var(--color-danger)]/10 flex items-center justify-center">
                    <Flame size={17} className="text-[var(--color-danger)]" />
                  </div>
                  <div>
                    <span className="text-[0.9rem] font-bold text-[var(--color-danger)]">Budget Warnings</span>
                    <span className="text-[0.8rem] text-[var(--color-text-secondary)] ml-2">
                      {riskyBudgets.length} categories exceeding limit.
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[var(--color-text-secondary)] opacity-40" />
              </div>
            </>
          )}

        </div>

        {/* Budget Breakdown */}
        <div className="flex items-center justify-between mt-4">
          <h2 className="text-[1.35rem] font-black tracking-tight text-[var(--color-text-primary)]">Budget Breakdown</h2>
          <span className="text-[0.8rem] font-semibold text-[var(--color-text-secondary)]">{groups.length} Categories</span>
        </div>

        {/* Horizontal scrolling category cards */}
        <div className="grid grid-cols-3 gap-4">
          {groups.map((b, i) => {
            const Icon = resolveLucideIcon(b.icon || "help");
            const percent = Math.min((b.spent / b.allocated) * 100, 100);
            const progressColor = getProgressColor(b.spent, b.allocated);

            return (
              <div
                key={i}
                className="bg-[var(--color-surface)] border border-[var(--border)] shadow-xs rounded-2xl p-5 w-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0"
                    style={{ background: `${b.color}18`, color: b.color }}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[1rem] font-bold text-[var(--color-text-primary)] leading-tight truncate">
                      {b.category}
                    </p>
                    <p className="text-[0.9rem] text-[var(--color-text-primary)]/70 mt-2 truncate">
                      <span className="text-[var(--color-text-primary)]">₹{b.spent.toLocaleString()}</span>  / ₹{b.allocated.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="h-[5px] rounded-full overflow-hidden bg-[var(--color-background)] mb-2.5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${percent}%`, background: progressColor }}
                  />
                </div>

                <p className="text-[1rem] font-black text-[var(--color-text-primary)] tracking-tight">
                  {Math.round(percent)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
