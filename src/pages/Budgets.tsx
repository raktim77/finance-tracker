import React, { useContext, useEffect, useState, useMemo } from "react";
import {
  PlusCircle,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Flame,
  Sparkles,
  Trash2,
  Wallet,
  SlidersHorizontal,
  MoreHorizontal,
  Calendar,
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

  useEffect(() => { if (!canCreateBudget && !budget?.exists) { setIsSelectorOpen(false); setSearchQuery(""); } }, [budget, canCreateBudget]);
  useEffect(() => { setIsEditingBudget(false); }, [monthString]);

  // const getFontSize = (val: string) => {
  //   const len = val.length;
  //   if (len < 7) return "text-6xl";
  //   if (len < 10) return "text-4xl";
  //   return "text-3xl";
  // };
  // const fontSizeClass = getFontSize(draftTotalInput);

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

  const getProgressColor = (spent: number, allocated: number) => {
    const p = (spent / allocated) * 100;
    if (p <= 70) return "#22c55e";
    if (p <= 90) return "#f59e0b";
    return "#ef4444";
  };
  const getStatusLabel = (spent: number, allocated: number) => {
    const p = (spent / allocated) * 100;
    if (p > 90) return { label: "Critical", color: "#ef4444" };
    if (p > 70) return { label: "Nearing limit", color: "#f59e0b" };
    return { label: "Healthy", color: "#22c55e" };
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

  // ─── SHARED COMPONENTS ────────────────────────────────────────────────────

  // Semicircle gauge for mobile
  const SemiGauge: React.FC<{ percent: number }> = ({ percent }) => {
    const r = 90;
    const cx = 110;
    const cy = 110;
    const circumference = Math.PI * r; // half circle
    const progress = Math.min(percent / 100, 1) * circumference;
    const trackColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
    return (
      <svg viewBox="0 0 220 120" style={{ width: "220px", height: "120px", display: "block" }}>
        {/* Track */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
          fill="none"
          stroke={trackColor}
          strokeWidth="18"
          strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
          fill="none"
          stroke="#22c55e"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
        />
      </svg>
    );
  };

  // Donut gauge for desktop (full circle, flat/compact)
  const DesktopDonut: React.FC<{ percent: number }> = ({ percent }) => {
    const donutData = [
      { value: percent, color: "#22c55e" },
      { value: 100 - percent, color: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)" },
    ];
    return (
      <div style={{ position: "relative", width: "130px", height: "130px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={donutData} innerRadius={46} outerRadius={62} dataKey="value" stroke="none" startAngle={90} endAngle={450}>
              {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "1.45rem", fontWeight: 800, color: isDark ? "#fff" : "#111318", lineHeight: 1 }}>{percent}%</span>
          <span style={{ fontSize: "0.6rem", color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af", marginTop: "3px", textAlign: "center", lineHeight: 1.2 }}>of budget<br />used</span>
        </div>
      </div>
    );
  };

  // Sparkline for desktop right panel
  const SparkLine: React.FC = () => (
    <svg viewBox="0 0 280 140" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,130 C20,125 40,120 60,115 C80,110 90,108 110,100 C130,90 140,85 160,75 C175,65 185,55 200,45 C215,32 230,28 250,18 C260,12 270,8 280,4"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M0,130 C20,125 40,120 60,115 C80,110 90,108 110,100 C130,90 140,85 160,75 C175,65 185,55 200,45 C215,32 230,28 250,18 C260,12 270,8 280,4 L280,140 L0,140 Z"
        fill="url(#sparkGrad)"
      />
    </svg>
  );

  const MonthPicker: React.FC<{ center?: boolean }> = ({ center }) => (
    <div
      style={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
        borderRadius: "999px",
        padding: center ? "6px 14px" : "6px 10px",
        cursor: "pointer",
      }}
    >
      <Calendar size={13} style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }} />
      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: isDark ? "rgba(255,255,255,0.8)" : "#374151" }}>
        {monthLabelFull}
      </span>
      <button
        onClick={() => shiftMonth(-1)}
        style={{ background: "none", border: "none", padding: "0 2px", cursor: "pointer", color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}
      >
        <ChevronLeft size={14} />
      </button>
      <button
        onClick={() => shiftMonth(1)}
        disabled={!canGoToNextMonth}
        style={{ background: "none", border: "none", padding: "0 2px", cursor: canGoToNextMonth ? "pointer" : "not-allowed", color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280", opacity: canGoToNextMonth ? 1 : 0.3 }}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-4 flex flex-col gap-6 pb-24 w-full animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-[var(--color-text-secondary)]/10" />
        <div className="h-[220px] rounded-[1.5rem] bg-[var(--color-text-secondary)]/8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-[var(--color-text-secondary)]/8" />
          ))}
        </div>
      </div>
    );
  }

  // ─── NO BUDGET (PAST MONTH) ───────────────────────────────────────────────
  if (!budget?.exists && !canCreateBudget) {
    return (
      <div className="p-4 flex flex-col gap-6 pb-24 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 800, color: isDark ? "#fff" : "#111318", letterSpacing: "-0.03em" }}>
              {monthLabelLong} Budget
            </h1>
            <div style={{ marginTop: "6px" }}><MonthPicker /></div>
          </div>
        </div>
        <div className="rounded-[1.5rem] p-10 text-center" style={{ background: isDark ? "#141414" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}` }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Sparkles size={26} color="#22c55e" />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: isDark ? "#fff" : "#111318" }}>No Budget Found</h3>
          <p style={{ marginTop: 8, fontSize: "0.9rem", color: isDark ? "#6b7280" : "#9ca3af" }}>Budget creation is only available for the current and next month.</p>
        </div>
      </div>
    );
  }

  // ─── CREATE / EDIT MODE ───────────────────────────────────────────────────
  if (!budget?.exists || isEditingBudget) {
    if (!isEditingBudget && suggestionsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-pulse">
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Sparkles color="#22c55e" size={28} />
          </div>
          <p style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: isDark ? "#6b7280" : "#9ca3af" }}>Analyzing your spending...</p>
        </div>
      );
    }

    const allocated = draftCategories.reduce((s, c) => s + c.limit, 0);
    const allocationPercent = draftTotal > 0 ? (allocated / draftTotal) * 100 : 0;
    const isInvalid = allocated > draftTotal;
    const hasInvalidCategoryInputs = draftCategories.some(c => !isPositiveCommittedValue(draftCategoryInputs[c.category_id] ?? String(c.limit)));
    const isDraftTotalInputInvalid = !isPositiveCommittedValue(draftTotalInput);

    // shared add-categories dropdown
    const AddCategoryDropdown = (
      <div className="relative">
        <button
          onClick={() => setIsSelectorOpen(!isSelectorOpen)}
          style={{
            width: "100%", padding: "16px", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "8px",
            border: `1.5px dashed #22c55e`,
            borderRadius: "12px", background: "transparent",
            color: "#22c55e", fontSize: "0.75rem", fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.18em", cursor: "pointer",
          }}
        >
          <PlusCircle size={16} color="#22c55e" /> Add More Categories
        </button>
        {isSelectorOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsSelectorOpen(false)} />
            <div className="absolute bottom-full mb-3 left-0 right-0 z-50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[320px]"
              style={{ background: isDark ? "#1e1e1e" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)"}` }}>
              <div className="overflow-y-auto p-2 no-scrollbar">
                {availableToAdd.length === 0 ? (
                  <div className="py-8 text-center text-xs font-black uppercase opacity-40" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>No categories found</div>
                ) : availableToAdd.map(cat => {
                  const Icon = resolveLucideIcon(cat.icon || "help");
                  return (
                    <button key={cat.category_id}
                      onClick={() => { setDraftCategories(p => [...p, { category_id: cat.category_id, name: cat.name, limit: isEditingBudget ? 0 : (cat.suggested_limit || 0), icon: cat.icon, color: cat.color }]); setDraftCategoryInputs(p => ({ ...p, [cat.category_id]: String(isEditingBudget ? 0 : (cat.suggested_limit || 0)) })); setSearchQuery(""); setIsSelectorOpen(false); }}
                      className="w-full p-3 flex items-center gap-3 rounded-xl transition"
                      style={{ color: isDark ? "#f0f0f0" : "#111318", background: "transparent" }}
                      onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#f9fafb")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cat.color}20`, color: cat.color }}><Icon size={15} /></div>
                      <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{cat.name}</span>
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

    const panelBg = isDark ? "#1a1a1a" : "#ffffff";
    const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
    const labelColor = isDark ? "rgba(255,255,255,0.35)" : "#9ca3af";
    const textPrimary = isDark ? "#ffffff" : "#111318";
    const inputBg = isDark ? "#111111" : "#f9fafb";
    const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

    const isFullyAllocated = draftTotal > 0 && allocated >= draftTotal && !isInvalid;

    // ── Left panel content (shared between desktop and mobile) ──
    const StepOnePanel = (
      <div style={{ background: panelBg, border: `1px solid ${panelBorder}`, borderRadius: "16px", padding: "24px" }}>
        {/* "TOTAL MONTHLY LIMIT" label */}
        <p style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: labelColor, marginBottom: "14px" }}>
          Total Monthly Limit
        </p>
        {/* Big ₹ + number + pencil */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, cursor: "text" }}>
            <span style={{ fontSize: "2.6rem", fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)", lineHeight: 1, flexShrink: 0 }}>₹</span>
            <input
              type="text" inputMode="decimal" value={draftTotalInput}
              onChange={e => validateNumericInput(e.target.value, setDraftTotal, setDraftTotalInput)}
              onBlur={() => setDraftTotalInput(String(draftTotal))}
              style={{ fontSize: "2.6rem", fontWeight: 800, color: textPrimary, background: "transparent", border: "none", outline: "none", width: "100%", letterSpacing: "-0.03em", lineHeight: 1 }}
              placeholder="0"
            />
          </label>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: labelColor, padding: "4px", flexShrink: 0 }}>
            <Pencil size={17} />
          </button>
        </div>

        {/* Dashed divider */}
        <div style={{ height: "1px", background: `repeating-linear-gradient(90deg, ${panelBorder} 0, ${panelBorder} 6px, transparent 6px, transparent 12px)`, margin: "20px 0" }} />

        {/* Allocation status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: labelColor }}>Allocation Status</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: isInvalid ? "#ef4444" : textPrimary }}>
            ₹{allocated.toLocaleString()} / ₹{draftTotal.toLocaleString()}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ height: "6px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(allocationPercent, 100)}%`, background: isInvalid ? "#ef4444" : "#22c55e", borderRadius: 999, transition: "width 0.3s ease" }} />
        </div>
        {/* Status text */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px" }}>
          {isFullyAllocated ? (
            <>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#22c55e" }}>Fully allocated</span>
            </>
          ) : isInvalid ? (
            <span style={{ fontSize: "0.78rem", color: "#ef4444" }}>⚠️ Allocation exceeds monthly limit.</span>
          ) : (
            <span style={{ fontSize: "0.78rem", color: labelColor }}>₹{(draftTotal - allocated).toLocaleString()} left to allocate.</span>
          )}
        </div>
      </div>
    );

  

    // ── Mobile category cards ──
    const MobileCategoryCards = (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {draftCategories.map((c, i) => {
          const CatIcon = resolveLucideIcon(c.icon || "help");
          const isFirst = i === 0;
          return (
            <div key={c.category_id} style={{
              background: panelBg,
              border: `1px solid ${panelBorder}`,
              borderRadius: "14px",
              overflow: "hidden",
            }}>
              {/* Top row: icon + name + trash */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "10px", background: `${c.color}20`, color: c.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CatIcon size={19} />
                  </div>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: textPrimary }}>{c.name}</span>
                </div>
                <button
                  onClick={() => { setDraftCategories(p => p.filter(dc => dc.category_id !== c.category_id)); setDraftCategoryInputs(p => { const n = { ...p }; delete n[c.category_id]; return n; }); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}>
                  <Trash2 size={17} />
                </button>
              </div>

              {/* Bottom row: ₹ amount input + pencil — first card has green left accent */}
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px 14px",
                background: isFirst ? (isDark ? "rgba(34,197,94,0.08)" : "rgba(34,197,94,0.06)") : "transparent",
                borderLeft: isFirst ? "3px solid #22c55e" : "3px solid transparent",
                cursor: "text",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.4rem", fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)" }}>₹</span>
                  <input
                    type="text" inputMode="decimal"
                    value={draftCategoryInputs[c.category_id] ?? String(c.limit)}
                    onChange={e => validateNumericInput(e.target.value,
                      v => setDraftCategories(p => { const n = [...p]; n[i] = { ...n[i], limit: v }; return n; }),
                      v => setDraftCategoryInputs(p => ({ ...p, [c.category_id]: v }))
                    )}
                    onBlur={() => setDraftCategoryInputs(p => ({ ...p, [c.category_id]: String(c.limit) }))}
                    style={{ fontSize: "1.4rem", fontWeight: 800, background: "transparent", border: "none", outline: "none", color: textPrimary, letterSpacing: "-0.02em", width: "100%" }}
                    placeholder="0"
                  />
                </div>
                <Pencil size={16} style={{ color: isFirst ? "#22c55e" : labelColor, flexShrink: 0 }} />
              </label>
            </div>
          );
        })}
        <div style={{ marginTop: "6px" }}>{AddCategoryDropdown}</div>
      </div>
    );

    return (
      <>
        {/* ═══ MOBILE ══════════════════════════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col pb-28 px-4 pt-4 gap-5" style={{ background: isDark ? "#0a0a0a" : "#f5f5f5", minHeight: "100vh" }}>
          {/* Header */}
          <div>
            <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: textPrimary, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
              {isEditingBudget ? `Edit ${monthLabelLong} Budget` : `Create ${monthLabelLong} Budget`}
            </h1>
            <p style={{ marginTop: "6px", fontSize: "0.82rem", color: labelColor }}>
              {isEditingBudget ? "Update your monthly budget and category limits below." : "We've suggested limits based on your history. Fine-tune them below."}
            </p>
          </div>

          {/* Month nav pill */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: panelBg, border: `1px solid ${panelBorder}`, borderRadius: "999px", padding: "8px 16px", alignSelf: "flex-start" }}>
            <button onClick={() => shiftMonth(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: labelColor, display: "flex", alignItems: "center" }}><ChevronLeft size={15} /></button>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: textPrimary }}>
              {month.toLocaleString("default", { month: "short", year: "numeric" }).toUpperCase()}
            </span>
            <button onClick={() => shiftMonth(1)} disabled={!canGoToNextMonth} style={{ background: "none", border: "none", cursor: canGoToNextMonth ? "pointer" : "not-allowed", color: labelColor, opacity: canGoToNextMonth ? 1 : 0.3, display: "flex", alignItems: "center" }}><ChevronRight size={15} /></button>
          </div>

          {/* Step 1 panel */}
          {StepOnePanel}

          {/* Cancel + Save buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <button
              onClick={() => isEditingBudget ? setIsEditingBudget(false) : undefined}
              style={{ padding: "16px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", background: panelBg, color: textPrimary, border: `1px solid ${panelBorder}`, cursor: "pointer" }}>
              Cancel
            </button>
            <button
              disabled={isInvalid || isSavingBudget || draftTotal <= 0 || isDraftTotalInputInvalid || hasInvalidCategoryInputs}
              onClick={async () => { await mutateAsync({ month: monthString, total_limit: draftTotal, categories: draftCategories.map(c => ({ category_id: c.category_id, limit: c.limit })) }); setIsEditingBudget(false); }}
              style={{ padding: "16px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", background: panelBg, color: textPrimary, border: `1px solid ${panelBorder}`, cursor: "pointer", opacity: (isInvalid || isSavingBudget || draftTotal <= 0) ? 0.4 : 1 }}>
              {isSavingBudget ? "Saving..." : "Save Budget"}
            </button>
          </div>

          {/* Active distribution heading */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: labelColor }}>Active Distribution</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: labelColor }}>{draftCategories.length} Categories</span>
          </div>

          {/* Mobile category cards */}
          {MobileCategoryCards}
        </div>

        {/* ═══ DESKTOP ═════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-col gap-6 pb-10 w-full">
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: textPrimary, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
                {isEditingBudget ? `Edit ${monthLabelLong} Budget` : `Create ${monthLabelLong} Budget`}
              </h1>
              <p style={{ marginTop: "8px", fontSize: "0.88rem", color: labelColor }}>
                {isEditingBudget ? "Update your monthly budget and category limits below." : "We've suggested limits based on your history. Fine-tune them below."}
              </p>
            </div>

            {/* Month nav pill — top right */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", background: "transparent", border: `1px solid ${panelBorder}`, borderRadius: "10px", padding: "10px 16px", flexShrink: 0 }}>
              <button onClick={() => shiftMonth(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: labelColor, display: "flex", alignItems: "center" }}><ChevronLeft size={16} /></button>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: textPrimary, whiteSpace: "nowrap" }}>
                {month.toLocaleString("default", { month: "short", year: "numeric" }).toUpperCase()}
              </span>
              <button onClick={() => shiftMonth(1)} disabled={!canGoToNextMonth} style={{ background: "none", border: "none", cursor: canGoToNextMonth ? "pointer" : "not-allowed", color: labelColor, opacity: canGoToNextMonth ? 1 : 0.3, display: "flex", alignItems: "center" }}><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Two-panel grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" }}>
            {/* Left: Step 1 panel with numbered badge */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Panel with badge */}
              <div style={{ background: panelBg, border: `1px solid ${panelBorder}`, borderRadius: "16px", padding: "24px" }}>
                {/* Badge row */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#000" }}>1</span>
                  </div>
                  <span style={{ fontSize: "1rem", fontWeight: 700, color: textPrimary }}>Set your monthly limit</span>
                </div>

                {/* "TOTAL MONTHLY LIMIT" label */}
                <p style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: labelColor, marginBottom: "14px" }}>
                  Total Monthly Limit
                </p>
                {/* Big ₹ + number + pencil */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, cursor: "text" }}>
                    <span style={{ fontSize: "2.6rem", fontWeight: 300, color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)", lineHeight: 1, flexShrink: 0 }}>₹</span>
                    <input
                      type="text" inputMode="decimal" value={draftTotalInput}
                      onChange={e => validateNumericInput(e.target.value, setDraftTotal, setDraftTotalInput)}
                      onBlur={() => setDraftTotalInput(String(draftTotal))}
                      style={{ fontSize: "2.6rem", fontWeight: 800, color: textPrimary, background: "transparent", border: "none", outline: "none", width: "100%", letterSpacing: "-0.03em", lineHeight: 1 }}
                      placeholder="0"
                    />
                  </label>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: labelColor, padding: "4px", flexShrink: 0 }}>
                    <Pencil size={18} />
                  </button>
                </div>

                {/* Dashed divider */}
                <div style={{ height: "1px", background: `repeating-linear-gradient(90deg, ${panelBorder} 0, ${panelBorder} 6px, transparent 6px, transparent 12px)`, margin: "24px 0" }} />

                {/* Allocation status */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: labelColor }}>Allocation Status</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: isInvalid ? "#ef4444" : textPrimary }}>
                    ₹{allocated.toLocaleString()} / ₹{draftTotal.toLocaleString()}
                  </span>
                </div>
                <div style={{ height: "6px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(allocationPercent, 100)}%`, background: isInvalid ? "#ef4444" : "#22c55e", borderRadius: 999, transition: "width 0.3s ease" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px" }}>
                  {isFullyAllocated ? (
                    <>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#22c55e" }}>Fully allocated</span>
                    </>
                  ) : isInvalid ? (
                    <span style={{ fontSize: "0.8rem", color: "#ef4444" }}>⚠️ Allocation exceeds monthly limit.</span>
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: labelColor }}>₹{(draftTotal - allocated).toLocaleString()} left to allocate.</span>
                  )}
                </div>
              </div>

              {/* CANCEL + SAVE BUDGET buttons below left panel */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <button
                  onClick={() => isEditingBudget ? setIsEditingBudget(false) : undefined}
                  style={{ padding: "18px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", background: panelBg, color: textPrimary, border: `1px solid ${panelBorder}`, cursor: "pointer" }}>
                  Cancel
                </button>
                <button
                  disabled={isInvalid || isSavingBudget || draftTotal <= 0 || isDraftTotalInputInvalid || hasInvalidCategoryInputs}
                  onClick={async () => { await mutateAsync({ month: monthString, total_limit: draftTotal, categories: draftCategories.map(c => ({ category_id: c.category_id, limit: c.limit })) }); setIsEditingBudget(false); }}
                  style={{ padding: "18px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", background: panelBg, color: textPrimary, border: `1px solid ${panelBorder}`, cursor: "pointer", opacity: (isInvalid || isSavingBudget || draftTotal <= 0) ? 0.4 : 1 }}>
                  {isSavingBudget ? "Saving..." : "Save Budget"}
                </button>
              </div>
            </div>

            {/* Right: Step 2 panel with badge + table */}
            <div style={{ background: panelBg, border: `1px solid ${panelBorder}`, borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "0" }}>
              {/* Badge row */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#000" }}>2</span>
                </div>
                <span style={{ fontSize: "1rem", fontWeight: 700, color: textPrimary }}>Allocate to categories</span>
              </div>

              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 80px", gap: "12px", paddingBottom: "12px", borderBottom: `1px solid ${panelBorder}`, marginBottom: "4px" }}>
                <span style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: labelColor }}>Category</span>
                <span style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: labelColor }}>Allocation</span>
                <span style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: labelColor, textAlign: "right" }}>Action</span>
              </div>

              {/* Rows */}
              {draftCategories.map((c, i) => {
                const CatIcon = resolveLucideIcon(c.icon || "help");
                return (
                  <div key={c.category_id}
                    style={{ display: "grid", gridTemplateColumns: "1fr 200px 80px", gap: "12px", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${panelBorder}` }}>
                    {/* Category */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "10px", background: `${c.color}20`, color: c.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CatIcon size={18} />
                      </div>
                      <span style={{ fontSize: "0.92rem", fontWeight: 600, color: textPrimary }}>{c.name}</span>
                    </div>

                    {/* Input */}
                    <div style={{ position: "relative" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: "10px", padding: "10px 36px 10px 12px", cursor: "text" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: labelColor, flexShrink: 0 }}>₹</span>
                        <input
                          type="text" inputMode="decimal"
                          value={draftCategoryInputs[c.category_id] ?? String(c.limit)}
                          onChange={e => validateNumericInput(e.target.value,
                            v => setDraftCategories(p => { const n = [...p]; n[i] = { ...n[i], limit: v }; return n; }),
                            v => setDraftCategoryInputs(p => ({ ...p, [c.category_id]: v }))
                          )}
                          onBlur={() => setDraftCategoryInputs(p => ({ ...p, [c.category_id]: String(c.limit) }))}
                          style={{ fontSize: "0.92rem", fontWeight: 700, background: "transparent", border: "none", outline: "none", width: "100%", color: textPrimary }}
                          placeholder="0"
                        />
                        <Pencil size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#22c55e", flexShrink: 0 }} />
                      </label>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: labelColor, padding: "4px" }}>
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => { setDraftCategories(p => p.filter(dc => dc.category_id !== c.category_id)); setDraftCategoryInputs(p => { const n = { ...p }; delete n[c.category_id]; return n; }); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add more */}
              <div style={{ marginTop: "16px" }}>
                {AddCategoryDropdown}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── VIEW MODE ────────────────────────────────────────────────────────────

  const cardBg = isDark ? "#141414" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

  return (
    <>
      {/* ═══ MOBILE VIEW ══════════════════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col pb-28" style={{ background: isDark ? "#0a0a0a" : "#f5f5f5", minHeight: "100vh" }}>
        {/* Mobile Header */}
        <div className="px-4 pt-5 pb-4 text-center">
          <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: isDark ? "#fff" : "#111318", letterSpacing: "-0.02em" }}>
            {monthLabelLong} Budget
          </h1>
          <button
            style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "6px", background: "transparent", border: "none", cursor: "pointer", color: isDark ? "rgba(255,255,255,0.6)" : "#374151", fontSize: "0.85rem", fontWeight: 600 }}
          >
            {monthLabelFull} <ChevronDown size={14} />
          </button>
        </div>

        {/* Semicircle gauge */}
        <div className="flex flex-col items-center pb-2">
          <div style={{ position: "relative", width: "220px" }}>
            <SemiGauge percent={spentPercent} />
            <div style={{ position: "absolute", bottom: "6px", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
              <p style={{ fontSize: "2.6rem", fontWeight: 800, color: isDark ? "#fff" : "#111318", letterSpacing: "-0.04em", lineHeight: 1 }}>{spentPercent}%</p>
              <p style={{ fontSize: "0.78rem", color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af", marginTop: "2px" }}>of budget used</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mx-4 mt-2 rounded-[1.2rem] overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          {[
            { label: "Limit Set", value: `₹${totalBudget.toLocaleString()}`, color: isDark ? "#f0f0f0" : "#111318" },
            { label: "Spent", value: `₹${spentTotal.toLocaleString()}`, color: "#f97316" },
            { label: "Available", value: `₹${availableAmount.toLocaleString()}`, color: "#22c55e" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", padding: "12px 16px", borderBottom: i < 2 ? `1px solid ${cardBorder}` : "none" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.65rem", color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af", fontWeight: 600, marginBottom: 4 }}>{item.label}</p>
                <p style={{ fontSize: "1.1rem", fontWeight: 800, color: item.color, letterSpacing: "-0.02em" }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Unallocated */}
        <div className="mx-4 mt-3 rounded-[1.2rem] flex items-center justify-between px-4 py-4" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 38, height: 38, borderRadius: "10px", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wallet size={18} color="#22c55e" />
            </div>
            <div>
              <p style={{ fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af", fontWeight: 600 }}>Unallocated Funds</p>
              <p style={{ fontSize: "1.05rem", fontWeight: 800, color: isDark ? "#f0f0f0" : "#111318", letterSpacing: "-0.01em" }}>₹{remainingToAllocate.toLocaleString()}</p>
            </div>
          </div>
          <ChevronRight size={18} style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#d1d5db" }} />
        </div>

        {/* Category Overview */}
        <div className="mx-4 mt-5 mb-2 flex items-center justify-between">
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: isDark ? "#fff" : "#111318" }}>Category Overview</h2>
          <span style={{ fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>{groups.length} Categories</span>
        </div>

        {/* Category list rows */}
        <div className="mx-4 rounded-[1.2rem] overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          {groups.map((b, i) => {
            const Icon = resolveLucideIcon(b.icon || "help");
            const percent = Math.min((b.spent / b.allocated) * 100, 100);
            const progressColor = getProgressColor(b.spent, b.allocated);
            const status = getStatusLabel(b.spent, b.allocated);
            return (
              <div key={i} style={{ padding: "14px 16px", borderBottom: i < groups.length - 1 ? `1px solid ${cardBorder}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "12px", background: `${b.color}18`, color: b.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: isDark ? "#f0f0f0" : "#111318" }}>{b.category}</p>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: status.color }}>{status.label}</span>
                    </div>
                    <p style={{ fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af", marginBottom: "8px" }}>
                      ₹{b.spent.toLocaleString()} / ₹{b.allocated.toLocaleString()}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flex: 1, height: "5px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${percent}%`, background: progressColor, borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 800, color: isDark ? "#f0f0f0" : "#111318", minWidth: "32px", textAlign: "right" }}>{Math.round(percent)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit/Delete buttons (mobile) */}
        {canCreateBudget && (
          <div className="mx-4 mt-4 flex gap-3">
            <button onClick={() => setIsEditingBudget(true)}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition"
              style={{ background: isDark ? "#1a1a1a" : "#f3f4f6", color: isDark ? "#d1d5db" : "#374151", border: `1px solid ${cardBorder}` }}>
              <Pencil size={15} /> Edit Budget
            </button>
            <button onClick={handleDeleteBudget} disabled={isDeletingBudget}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition"
              style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}>
              <Trash2 size={15} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* ═══ DESKTOP VIEW ═════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col gap-7 pb-10 w-full">
        {/* Desktop Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: isDark ? "#fff" : "#111318", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {monthLabelLong} Budget
            </h1>
            {/* Month picker pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", borderRadius: "999px", padding: "7px 14px", alignSelf: "flex-start", cursor: "pointer" }}>
              <Calendar size={13} style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: isDark ? "rgba(255,255,255,0.8)" : "#374151" }}>{monthLabelFull}</span>
              <ChevronDown size={13} style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }} />
              <button onClick={() => shiftMonth(-1)} style={{ background: "none", border: "none", padding: "0 1px", cursor: "pointer", color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280", display: "flex", alignItems: "center" }}><ChevronLeft size={14} /></button>
              <button onClick={() => shiftMonth(1)} disabled={!canGoToNextMonth} style={{ background: "none", border: "none", padding: "0 1px", cursor: canGoToNextMonth ? "pointer" : "not-allowed", opacity: canGoToNextMonth ? 1 : 0.3, color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280", display: "flex", alignItems: "center" }}><ChevronRight size={14} /></button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {canCreateBudget && (
              <>
                <button onClick={() => setIsEditingBudget(true)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 600, background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", color: isDark ? "#d1d5db" : "#374151", border: `1px solid ${cardBorder}`, cursor: "pointer" }}>
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={handleDeleteBudget} disabled={isDeletingBudget}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 600, background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)", cursor: "pointer" }}>
                  <Trash2 size={14} /> Delete
                </button>
              </>
            )}
            <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 600, background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", color: isDark ? "#d1d5db" : "#374151", border: `1px solid ${cardBorder}`, cursor: "pointer" }}>
              <SlidersHorizontal size={14} /> Filters
            </button>
            <button style={{ padding: "8px 10px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", border: `1px solid ${cardBorder}`, cursor: "pointer", color: isDark ? "#d1d5db" : "#374151", display: "flex" }}>
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Desktop Hero 2-col */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px" }}>
          {/* Left hero panel */}
          <div style={{ background: isDark ? "#111a12" : "#ffffff", border: `1px solid ${cardBorder}`, borderRadius: "1.5rem", overflow: "hidden" }}>
            {/* Donut + stats row */}
            <div style={{ padding: "28px 28px 24px", display: "flex", alignItems: "center", gap: "32px" }}>
              <DesktopDonut percent={spentPercent} />
              <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                {[
                  { label: "Limit Set", value: `₹${totalBudget.toLocaleString()}`, color: isDark ? "#f0f0f0" : "#111318" },
                  { label: "Spent", value: `₹${spentTotal.toLocaleString()}`, color: "#f97316" },
                  { label: "Available", value: `₹${availableAmount.toLocaleString()}`, color: "#22c55e" },
                ].map((item, i) => (
                  <div key={i} style={{ paddingLeft: i > 0 ? "28px" : "0", marginLeft: i > 0 ? "28px" : "0", borderLeft: i > 0 ? `1px solid ${cardBorder}` : "none" }}>
                    <p style={{ fontSize: "0.7rem", fontWeight: 600, color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af", marginBottom: "6px", textTransform: "none" }}>{item.label}</p>
                    <p style={{ fontSize: "1.35rem", fontWeight: 800, color: item.color, letterSpacing: "-0.02em" }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", margin: "0 28px" }} />

            {/* Unallocated row */}
            <div style={{ padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Wallet size={17} color="#22c55e" />
                </div>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280" }}>Unallocated Funds</span>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: isDark ? "#f0f0f0" : "#111318" }}>₹{remainingToAllocate.toLocaleString()}</span>
              </div>
              <ChevronRight size={16} style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#d1d5db" }} />
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", margin: "0 28px" }} />

            {/* Status banner */}
            <div style={{ padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: isDark ? "rgba(34,197,94,0.04)" : "rgba(34,197,94,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {riskyBudgets.length === 0 ? (
                  <>
                    <div style={{ width: 28, height: 28, borderRadius: "8px", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Sparkles size={14} color="#22c55e" />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#22c55e" }}>You're doing great!</span>
                      <span style={{ fontSize: "0.78rem", color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af", marginLeft: "8px" }}>All categories are within healthy limits.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ width: 28, height: 28, borderRadius: "8px", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Flame size={14} color="#ef4444" />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ef4444" }}>Budget Warnings</span>
                      <span style={{ fontSize: "0.78rem", color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af", marginLeft: "8px" }}>{riskyBudgets.length} categories exceeding limit.</span>
                    </div>
                  </>
                )}
              </div>
              <ChevronRight size={16} style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#d1d5db" }} />
            </div>
          </div>

          {/* Right: sparkline panel */}
          <div style={{ background: isDark ? "#111a12" : "#ffffff", border: `1px solid ${cardBorder}`, borderRadius: "1.5rem", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ padding: "28px 28px 0" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af", marginBottom: "8px" }}>Spent</p>
              <p style={{ fontSize: "3.2rem", fontWeight: 800, color: isDark ? "#fff" : "#111318", letterSpacing: "-0.04em", lineHeight: 1 }}>{spentPercent}%</p>
              <p style={{ fontSize: "0.85rem", color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af", marginTop: "6px" }}>of budget</p>
            </div>
            <div style={{ height: "140px", marginTop: "8px" }}>
              <SparkLine />
            </div>
          </div>
        </div>

        {/* Budget Breakdown heading */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: isDark ? "#fff" : "#111318", letterSpacing: "-0.02em" }}>Budget Breakdown</h2>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>{groups.length} Categories</span>
        </div>

        {/* Horizontal scrolling category cards */}
        <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }} className="no-scrollbar">
          {groups.map((b, i) => {
            const Icon = resolveLucideIcon(b.icon || "help");
            const percent = Math.min((b.spent / b.allocated) * 100, 100);
            const progressColor = getProgressColor(b.spent, b.allocated);
            return (
              <div key={i} style={{
                minWidth: "200px", maxWidth: "220px", flexShrink: 0,
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: "1.2rem",
                padding: "16px",
              }}>
                {/* Icon + name */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "10px", background: `${b.color}18`, color: b.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: isDark ? "#f0f0f0" : "#111318", lineHeight: 1.2 }}>{b.category}</p>
                    <p style={{ fontSize: "0.68rem", color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af", marginTop: "2px" }}>₹{b.spent.toLocaleString()} / ₹{b.allocated.toLocaleString()}</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: "5px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)", borderRadius: 999, overflow: "hidden", marginBottom: "10px" }}>
                  <div style={{ height: "100%", width: `${percent}%`, background: progressColor, borderRadius: 999 }} />
                </div>
                {/* Percent */}
                <p style={{ fontSize: "1rem", fontWeight: 800, color: isDark ? "#f0f0f0" : "#111318", letterSpacing: "-0.01em" }}>{Math.round(percent)}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}