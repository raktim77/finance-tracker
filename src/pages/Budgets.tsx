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
  CircleGauge,
  ShieldAlert,
  TriangleAlert,
  CircleCheckBig,
  // ShieldCheck,
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
  const monthLabelShortUpper = month.toLocaleString("default", { month: "short", year: "numeric" }).toUpperCase();

  // ─── SHARED SUB-COMPONENTS ────────────────────────────────────────────────

  const SemiGauge: React.FC<{ percent: number }> = ({ percent }) => {
    const r = 90, cx = 110, cy = 110;
    const circumference = Math.PI * r;
    const progress = Math.min(percent / 100, 1) * circumference;
    return (
      <svg viewBox="0 0 220 120" style={{ width: "220px", height: "120px", display: "block" }}>
        <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
          fill="none" stroke="var(--border)" strokeWidth="18" strokeLinecap="round" />
        <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
          fill="none" stroke="var(--color-success)" strokeWidth="18" strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`} />
      </svg>
    );
  };

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


  // Month nav pill — rounded for mobile, rectangular for desktop create header
  const MonthNavPill: React.FC<{ rounded?: boolean }> = ({ rounded }) => (
    <div className={`inline-flex items-center gap-3 border border-[var(--border)] bg-[var(--color-surface)] px-4 py-2.5 ${rounded ? "rounded-full" : "rounded-xl"}`}>
      <button onClick={() => shiftMonth(-1)}
        className="flex items-center bg-transparent border-none cursor-pointer p-0 text-[var(--color-text-secondary)]">
        <ChevronLeft size={15} />
      </button>
      <span className="text-[0.78rem] font-black uppercase tracking-[0.14em] text-[var(--color-text-primary)]">
        {monthLabelShortUpper}
      </span>
      <button onClick={() => shiftMonth(1)} disabled={!canGoToNextMonth}
        className="flex items-center bg-transparent border-none cursor-pointer p-0 text-[var(--color-text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronRight size={15} />
      </button>
    </div>
  );

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-4 flex flex-col gap-6 pb-24 w-full animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-[var(--color-text-secondary)]/10" />
        <div className="h-[220px] rounded-[1.5rem] bg-[var(--color-text-secondary)]/10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-[var(--color-text-secondary)]/10" />
          ))}
        </div>
      </div>
    );
  }

  // ─── NO BUDGET (PAST MONTH) ───────────────────────────────────────────────
  if (!budget?.exists && !canCreateBudget) {
    return (
      <div className="p-4 flex flex-col gap-6 pb-24 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1.9rem] font-black tracking-tight text-[var(--color-text-primary)]">
              {monthLabelLong} Budget
            </h1>
            <div className="mt-1.5"><MonthNavPill rounded /></div>
          </div>
        </div>
        <div className="rounded-[1.5rem] p-10 text-center bg-[var(--color-surface)] border border-[var(--border)]">
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center mx-auto mb-4">
            <Sparkles size={26} className="text-[var(--color-accent)]" />
          </div>
          <h3 className="text-xl font-black text-[var(--color-text-primary)]">No Budget Found</h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Budget creation is only available for the current and next month.
          </p>
        </div>
      </div>
    );
  }

  // ─── CREATE / EDIT MODE ───────────────────────────────────────────────────
  if (!budget?.exists || isEditingBudget) {
    if (!isEditingBudget && suggestionsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-pulse">
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center mb-4">
            <Sparkles className="text-[var(--color-accent)]" size={28} />
          </div>
          <p className="text-[0.75rem] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            Analyzing your spending...
          </p>
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
                <CircleCheckBig width={18} strokeWidth={2} className="text-(--color-primary)"/>
              <span className="text-[0.8rem] font-semibold text-[var(--color-success)]">Fully allocated</span>
            </>
          ) : isInvalid ? (
            <span className="text-[0.8rem] text-[var(--color-danger)] flex items-center gap-1.5 font-semibold"><TriangleAlert width={18} strokeWidth={2} className="text-(--color-warm)"/> Allocation exceeds monthly limit.</span>
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
          const isFirst = i === 0;
          return (
            <div key={c.category_id}
              className="rounded-[14px] overflow-hidden bg-[var(--color-surface)] border border-[var(--border)]">
              {/* Top: icon + name + trash */}
              <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c.color}20`, color: c.color }}>
                    <CatIcon size={19} />
                  </div>
                  <span className="text-[0.95rem] font-bold text-[var(--color-text-primary)]">{c.name}</span>
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
                className="flex items-center justify-between px-4 pb-3.5 cursor-text"
                style={{
                  background: isFirst ? "var(--color-accent-soft)" : "transparent",
                  borderLeft: `3px solid ${isFirst ? "var(--color-accent)" : "transparent"}`,
                }}
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
                <Pencil size={16} className={isFirst ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"} />
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
        <div className="lg:hidden flex flex-col pb-28 px-4 pt-4 gap-5 bg-[var(--color-background)] min-h-screen">
          <div>
            <h1 className="text-[1.7rem] font-black tracking-tight leading-tight text-[var(--color-text-primary)]">
              {isEditingBudget ? `Edit ${monthLabelLong} Budget` : `Create ${monthLabelLong} Budget`}
            </h1>
            <p className="mt-1.5 text-[0.82rem] text-[var(--color-text-secondary)]">
              {isEditingBudget ? "Update your monthly budget and category limits below." : "We've suggested limits based on your history. Fine-tune them below."}
            </p>
          </div>

          <MonthNavPill rounded />

          {/* Step 1 panel */}
          <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl p-6">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.22em] text-[var(--color-text-secondary)] mb-3.5">
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
              </label>
              <button className="bg-transparent border-none cursor-pointer text-[var(--color-text-secondary)] p-1 flex-shrink-0">
                <Pencil size={17} />
              </button>
            </div>
            {AllocationStatus}
          </div>

          {/* Cancel + Save */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => isEditingBudget ? setIsEditingBudget(false) : undefined}
              className="py-4 rounded-xl text-[0.72rem] font-black uppercase tracking-[0.18em] bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--border)] cursor-pointer hover:bg-[var(--color-background)] transition-colors">
              Cancel
            </button>
            <button
              disabled={isInvalid || isSavingBudget || draftTotal <= 0 || isDraftTotalInputInvalid || hasInvalidCategoryInputs}
              onClick={async () => {
                await mutateAsync({ month: monthString, total_limit: draftTotal, categories: draftCategories.map(c => ({ category_id: c.category_id, limit: c.limit })) });
                setIsEditingBudget(false);
              }}
              className="py-4 rounded-xl text-[0.72rem] font-black uppercase tracking-[0.18em] bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--border)] cursor-pointer hover:bg-[var(--color-background)] transition-colors disabled:opacity-30">
              {isSavingBudget ? "Saving..." : "Save Budget"}
            </button>
          </div>

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
            <div>
              <h2 className="text-[2.1rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">
                {isEditingBudget ? `Edit ${monthLabelLong} Budget` : `Create ${monthLabelLong} Budget`}
              </h2>
              <p className="mt-2 text-[1rem] font-semibold text-[var(--color-text-secondary)]">
                {isEditingBudget ? "Update your monthly budget and category limits below." : "We've suggested limits based on your history. Fine-tune them below."}
              </p>
            </div>
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
                    <Pencil size={18} className="cursor-pointer absolute right-0 text-[var(--color-text-secondary)] "/>
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
      <div className="lg:hidden flex flex-col pb-28 bg-[var(--color-background)] min-h-screen">
        {/* Header */}
        <div className="px-4 pt-5 pb-4 text-center">
          <h1 className="text-[1.35rem] font-black tracking-tight text-[var(--color-text-primary)]">
            {monthLabelLong} Budget
          </h1>
          <button className="inline-flex items-center gap-1 mt-1.5 bg-transparent border-none cursor-pointer text-[var(--color-text-secondary)] text-[0.85rem] font-semibold">
            {monthLabelFull} <ChevronDown size={14} />
          </button>
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
        <div className="mx-4 mt-2 rounded-[1.2rem] overflow-hidden bg-[var(--color-surface)] border border-[var(--border)]">
          {[
            { label: "Limit Set", value: `₹${totalBudget.toLocaleString()}`, cls: "text-[var(--color-text-primary)]" },
            { label: "Spent", value: `₹${spentTotal.toLocaleString()}`, cls: "text-[var(--color-warm)]" },
            { label: "Available", value: `₹${availableAmount.toLocaleString()}`, cls: "text-[var(--color-success)]" },
          ].map((item, i) => (
            <div key={i} className="px-4 py-3" style={{ borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
              <p className="text-[0.65rem] text-[var(--color-text-secondary)] font-semibold mb-1">{item.label}</p>
              <p className={`text-[1.1rem] font-black tracking-tight ${item.cls}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Unallocated */}
        <div className="mx-4 mt-3 rounded-[1.2rem] flex items-center justify-between px-4 py-4 bg-[var(--color-surface)] border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-[10px] bg-[var(--color-accent-soft)] flex items-center justify-center">
              <Wallet size={18} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="text-[0.72rem] text-[var(--color-text-secondary)] font-semibold">Unallocated Funds</p>
              <p className="text-[1.05rem] font-black tracking-tight text-[var(--color-text-primary)]">
                ₹{remainingToAllocate.toLocaleString()}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[var(--color-text-secondary)] opacity-40" />
        </div>

        {/* Category Overview */}
        <div className="mx-4 mt-5 mb-2 flex items-center justify-between">
          <h2 className="text-[1.05rem] font-black text-[var(--color-text-primary)]">Category Overview</h2>
          <span className="text-[0.72rem] text-[var(--color-text-secondary)]">{groups.length} Categories</span>
        </div>

        {/* Category list */}
        <div className="mx-4 rounded-[1.2rem] overflow-hidden bg-[var(--color-surface)] border border-[var(--border)]">
          {groups.map((b, i) => {
            const Icon = resolveLucideIcon(b.icon || "help");
            const percent = Math.min((b.spent / b.allocated) * 100, 100);
            const progressColor = getProgressColor(b.spent, b.allocated);
            const status = getStatusLabel(b.spent, b.allocated);
            return (
              <div key={i} className="px-4 py-3.5"
                style={{ borderBottom: i < groups.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${b.color}18`, color: b.color }}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[0.9rem] font-bold text-[var(--color-text-primary)]">{b.category}</p>
                      <span className={`text-[0.7rem] font-bold ${status.cls}`}>{status.label}</span>
                    </div>
                    <p className="text-[0.72rem] text-[var(--color-text-secondary)] mb-2">
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

        {/* Edit/Delete */}
        {canCreateBudget && (
          <div className="mx-4 mt-4 flex gap-3">
            <button onClick={() => setIsEditingBudget(true)}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--border)] cursor-pointer hover:bg-[var(--color-background)] transition-colors">
              <Pencil size={15} /> Edit Budget
            </button>
            <button onClick={handleDeleteBudget} disabled={isDeletingBudget}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-[var(--color-danger)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/8 cursor-pointer disabled:opacity-50 hover:bg-[var(--color-danger)]/10 transition-colors">
              <Trash2 size={15} /> Delete
            </button>
          </div>
        )}
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
                <div className="flex-1 min-w-0 flex justify-between items-start">
                  <div>
                    <p className="text-[2.6rem] font-black tracking-tight leading-none text-[var(--color-danger)]">
                      +12%
                    </p>

                    <p className="text-[0.85rem] text-[var(--color-text-secondary)] mt-3">
                      over ideal pace
                    </p>

                  </div>


                </div>

                {/* CHART */}
                <div className="w-[280px] h-[130px] flex-shrink-0 flex items-center justify-center">
                  <PaceVsIdealChart />
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
                    ₹6,700.00
                  </p>
                </div>

                <div>
                  <p className="text-[0.7rem] font-semibold text-[var(--color-text-secondary)] mb-2">
                    ACTUAL
                  </p>
                  <p className="text-[1rem] font-bold text-[var(--color-text-primary)]">
                    ₹7,520.00
                  </p>
                </div>

                <div>
                  <p className="text-[0.7rem] font-semibold text-[var(--color-text-secondary)] mb-2">
                    DIFFERENCE
                  </p>
                  <p className="text-[1rem] font-bold text-[var(--color-danger)]">
                    +₹820.00
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
                    <p className="text-[1rem] font-bold text-[var(--color-text-primary)] mb-1">₹268 / ₹224</p>
                    <p className="text-[0.7rem] text-[var(--color-text-secondary)]">per day</p>
                  </div>
                </div>

                {/* BURN */}
                <div className="flex items-center gap-3 px-4">
                  <Flame size={34} strokeWidth={2} className="text-(--color-warm)" />

                  <div>
                    <p className="text-[0.7rem] text-[var(--color-text-secondary)] mb-2 font-semibold">BURN RATE</p>
                    <p className="text-[1rem] font-bold text-(--color-warm) mb-1" >1.2×</p>
                    <p className="text-[0.7rem] text-[var(--color-text-secondary)]">vs ideal</p>
                  </div>
                </div>

                {/* RISK */}
                <div className="flex items-center gap-3 pl-4">
                  {/* <ShieldCheck size={34} strokeWidth={2} className="text-(--color-primary)" /> */}
                  <ShieldAlert size={34} strokeWidth={2} className="text-(--color-danger)" />

                  <div>
                    <p className="text-[0.7rem] text-[var(--color-text-secondary)] mb-2 font-semibold">RISK</p>
                    <p className="text-[1rem] font-bold text-[var(--color-danger)] mb-1">+₹2,300</p>
                    <p className="text-[0.7rem] text-[var(--color-text-secondary)]">over budget</p>
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
