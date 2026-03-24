import { useEffect, useState, useMemo } from "react";
import {
  PlusCircle,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Search,
  Trash2,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import {
  useBudget,
  useBudgetSuggestions,
  useUpsertBudget,
} from "../features/budgets/hooks/useBudgets";
import resolveLucideIcon from "../utils/LucideIconsResolver";

export default function Budgets() {
  const [month, setMonth] = useState(new Date());
  const monthString = month.toISOString().slice(0, 7);
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

  const { data: suggestions, isLoading: suggestionsLoading } =
    useBudgetSuggestions(monthString, {
      enabled: canCreateBudget && !budget?.exists,
    });

  const { mutateAsync, isPending } = useUpsertBudget();

  const [draftTotal, setDraftTotal] = useState(0);
  const [draftTotalInput, setDraftTotalInput] = useState("");
  const [draftCategories, setDraftCategories] = useState<
    { category_id: string; name: string; limit: number; icon?: string; color?: string }[]
  >([]);
  const [draftCategoryInputs, setDraftCategoryInputs] = useState<Record<string, string>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
 
  useEffect(() => {
    if (suggestions && !budget?.exists) {
      setDraftTotal(suggestions.suggested_total);
      setDraftTotalInput(String(suggestions.suggested_total));

      const initialCategories = suggestions.categories
        .filter(c => c.suggested_limit > 0)
        .map((c) => ({
          category_id: c.category_id,
          name: c.name,
          limit: c.suggested_limit,
          icon: c.icon,
          color: c.color
        }));

      setDraftCategories(initialCategories);
      setDraftCategoryInputs(
        Object.fromEntries(
          initialCategories.map((category) => [
            category.category_id,
            String(category.limit),
          ])
        )
      );
    }
  }, [suggestions, budget]);

  const getFontSize = (val: string) => {
    const len = val.length;
    if (len < 7) return "text-6xl";
    if (len < 10) return "text-4xl";
    return "text-3xl";
  };

  const fontSizeClass = getFontSize(draftTotalInput);

  useEffect(() => {
    if (!canCreateBudget && !budget?.exists) {
      setIsSelectorOpen(false);
      setSearchQuery("");
    }
  }, [budget, canCreateBudget]);

  const availableToAdd = useMemo(() => {
    if (!suggestions) return [];
    return suggestions.categories
      .filter((c) => !draftCategories.find((dc) => dc.category_id === c.category_id))
      .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [suggestions, draftCategories, searchQuery]);

  const totalBudget = budget?.total_limit ?? 0;

  const groups =
    budget?.categories?.map((c) => ({
      category: c.name,
      allocated: c.limit,
      spent: c.spent,
      color: c.color,
    })) ?? [];

  const allocatedTotal = budget?.allocated ?? 0;
  const spentTotal = budget?.spent ?? 0;
  const remainingToAllocate = budget?.unallocated ?? 0;

  const donutData = [
    { name: "Spent", value: spentTotal, color: "white" },
    {
      name: "Remaining",
      value: totalBudget - spentTotal,
      color: "rgba(255,255,255,0.2)",
    },
  ];

  const getProgressColor = (spent: number, allocated: number) => {
    const p = (spent / allocated) * 100;
    if (p <= 70) return "var(--color-success)";
    if (p > 70 && p <= 90) return "#f59e0b";
    return "var(--color-danger)";
  };

  const riskyBudgets = groups.filter(
    (b) => b.allocated > 0 && (b.spent / b.allocated) * 100 > 90
  );

  const isPositiveCommittedValue = (value: string) => {
    if (!/^\d+(\.\d{1,2})?$/.test(value)) return false;
    return Number(value) >= 0;
  };

  const validateNumericInput = (
    rawValue: string,
    onValidNumber: (num: number) => void,
    onRawValueChange: (value: string) => void
  ) => {
    if (rawValue !== "" && !/^\d*\.?\d*$/.test(rawValue)) return;
    if (rawValue.includes(".") && rawValue.split(".")[1].length > 2) return;

    onRawValueChange(rawValue);

    if (rawValue === "" || rawValue === ".") {
      onValidNumber(0);
      return;
    }

    if (!isPositiveCommittedValue(rawValue)) return;

    onValidNumber(Number(rawValue));
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!budget?.exists && !canCreateBudget) {
    return (
      <div className="p-1 flex flex-col gap-8 pb-24 mx-auto w-full">
        <div className="flex flex-col gap-4 px-2">
          <div className="flex flex-col gap-1">
            {/* <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Budget Archive
            </span> */}
            <h2 className="text-2xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tighter leading-tight">
              {month.toLocaleString("default", { month: "long" })} Budget
            </h2>
            <p className="text-xs md:text-sm font-medium text-[var(--color-text-secondary)] opacity-70">
              No budget was created for this past month.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[var(--color-surface)] p-1.5 rounded-2xl border border-[var(--border)] self-start">
            <button
              onClick={() =>
                setMonth((prev) => {
                  const d = new Date(prev);
                  d.setMonth(d.getMonth() - 1);
                  return d;
                })
              }
              className="p-2 hover:bg-[var(--color-background)] rounded-xl transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[9px] font-black uppercase tracking-widest px-2">
              {month.toLocaleString("default", { month: "short", year: "numeric" })}
            </span>
            <button
              onClick={() =>
                setMonth((prev) => {
                  const d = new Date(prev);
                  d.setMonth(d.getMonth() + 1);
                  return d;
                })
              }
              disabled={!canGoToNextMonth}
              className="p-2 hover:bg-[var(--color-background)] rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 text-center shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(124,108,255,0.08),transparent_35%)]" />
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
              No Budget Found
            </h3>
            <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed opacity-80">
              Budget creation is only available for the current month and next month. You can still browse older months here whenever budget data exists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!budget?.exists) {
    if (suggestionsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse px-6 text-center">
          <div className="w-16 h-16 bg-[var(--color-accent-soft)] rounded-full mb-4 flex items-center justify-center">
            <Sparkles className="text-[var(--color-accent)]" size={32} />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-[var(--color-text-secondary)] opacity-60">
            Analyzing your spending...
          </p>
        </div>
      );
    }

    const allocated = draftCategories.reduce((sum, c) => sum + c.limit, 0);
    const allocationPercent = draftTotal > 0 ? (allocated / draftTotal) * 100 : 0;
    const isInvalid = allocated > draftTotal;

    const hasInvalidCategoryInputs = draftCategories.some((category) => {
      const rawValue = draftCategoryInputs[category.category_id] ?? String(category.limit);
      return !isPositiveCommittedValue(rawValue);
    });

    const isDraftTotalInputInvalid = !isPositiveCommittedValue(draftTotalInput);

    return (
      <div className="p-1 flex flex-col gap-6 md:gap-8 pb-32 w-full">

        <div className="flex flex-col gap-4 px-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tighter leading-tight">
              {month.toLocaleString("default", { month: "long" })} Budget
            </h2>
            <p className="text-xs md:text-sm font-medium text-[var(--color-text-secondary)] opacity-70">
              We've suggested limits based on your history. Fine-tune them below.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[var(--color-surface)] p-1.5 rounded-2xl border border-[var(--border)] self-start">
            <button onClick={() => setMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() - 1); return d; })} className="p-2 hover:bg-[var(--color-background)] rounded-xl transition-colors"><ChevronLeft size={14} /></button>
            <span className="text-[9px] font-black uppercase tracking-widest px-2">{month.toLocaleString("default", { month: "short", year: "numeric" })}</span>
            <button
              onClick={() => setMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + 1); return d; })}
              disabled={!canGoToNextMonth}
              className="p-2 hover:bg-[var(--color-background)] rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">

          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-6">
            <div className="bg-[var(--color-surface)] border border-[var(--border)] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent)]/5 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />

              <label className="text-[9px] uppercase font-black text-[var(--color-text-secondary)] tracking-widest opacity-60 block mb-3">
                Target Monthly Limit
              </label>
              <div className={`flex items-center gap-2 group min-w-0 ${fontSizeClass}`}>
                <span className="font-black text-[var(--color-text-primary)] opacity-30 group-focus-within:text-[var(--color-accent)] group-focus-within:opacity-100 transition-all shrink-0">₹</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={draftTotalInput}
                  onChange={(e) =>
                    validateNumericInput(
                      e.target.value,
                      setDraftTotal,
                      setDraftTotalInput
                    )
                  }
                  onBlur={() => setDraftTotalInput(String(draftTotal))}
                  className="font-black bg-transparent outline-none w-full tracking-tighter text-[var(--color-text-primary)] min-w-0"
                  placeholder="0"
                />
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border)] border-dashed">
                <div className="flex justify-between items-end mb-3 gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Allocation Status</span>
                  <span className={`text-[10px] font-black whitespace-nowrap ${isInvalid ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]'}`}>
                    ₹{allocated.toLocaleString()} / ₹{draftTotal.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 w-full bg-[var(--color-background)] rounded-full border border-[var(--border)] p-0.5 overflow-hidden">
                  <div
                    className="h-full rounded-full shadow-sm transition-all duration-300"
                    style={{
                      width: `${Math.min(allocationPercent, 100)}%`,
                      backgroundColor: isInvalid ? "var(--color-danger)" : "var(--color-accent)",
                    }}
                  />
                </div>
                <p className="mt-3 text-[9px] font-bold text-[var(--color-text-secondary)] opacity-60 leading-tight">
                  {isInvalid
                    ? "⚠️ Warning: Total allocation exceeds your monthly limit."
                    : `You have ₹${(draftTotal - allocated).toLocaleString()} left to allocate.`}
                </p>
              </div>
            </div>

            <button
              disabled={
                isInvalid ||
                isPending ||
                draftTotal <= 0 ||
                isDraftTotalInputInvalid ||
                hasInvalidCategoryInputs
              }
              onClick={async () => {
                await mutateAsync({
                  month: monthString,
                  total_limit: draftTotal,
                  categories: draftCategories.map((c) => ({
                    category_id: c.category_id,
                    limit: c.limit,
                  })),
                });
              }}
              className="group relative w-full px-6 py-5 md:py-6 rounded-2xl md:rounded-[2rem] bg-[var(--color-text-primary)] text-[var(--color-background)] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs transition-all active:scale-95 disabled:opacity-20 hover:shadow-2xl overflow-hidden"
            >
              <span className="relative z-10">{isPending ? "Finalizing..." : "Initialize Budget"}</span>
              <div className="absolute inset-0 bg-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

        {/* RIGHT: Category Breakdown */}
<div className="lg:col-span-7 flex flex-col gap-4">
  <div className="flex items-center justify-between px-2">
    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Active Distribution</span>
    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] opacity-40">{draftCategories.length} Categories</span>
  </div>

  <div className="grid gap-3">
    {draftCategories.map((c, i) => {
      const CategoryIcon = resolveLucideIcon(c.icon || 'help');

      return (
        <div
          key={c.category_id}
          className="group relative bg-[var(--color-surface)] border border-[var(--border)] p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] hover:border-[var(--color-accent)]/30 transition-all flex flex-col gap-4"
        >
          {/* Top Row: Icon + Name + Delete (Mobile friendly) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ backgroundColor: `${c.color}15`, color: c.color }}
              >
                <CategoryIcon size={20} />
              </div>
              <span className="font-black text-sm md:text-base text-[var(--color-text-primary)] truncate">
                {c.name}
              </span>
            </div>

            <button
              onClick={() => {
                setDraftCategories((prev) => prev.filter((dc) => dc.category_id !== c.category_id));
                setDraftCategoryInputs((prev) => {
                  const next = { ...prev };
                  delete next[c.category_id];
                  return next;
                });
              }}
              aria-label={`Remove ${c.name}`}
              className="p-2.5 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl hover:bg-[var(--color-danger)]/20 transition-all shrink-0 active:scale-90"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Bottom Row: Input Field */}
          <div className="relative flex items-center group/input rounded-[1.15rem] border border-[var(--border)] bg-[var(--color-background)] px-4 py-3 transition-all focus-within:border-[var(--color-accent)]/40 focus-within:bg-[var(--color-surface)] focus-within:ring-4 focus-within:ring-[var(--color-accent)]/5">
            <span className="absolute left-4 text-[11px] font-black opacity-30 group-focus-within/input:opacity-100 transition-opacity">₹</span>
            <input
              type="text"
              inputMode="decimal"
              value={draftCategoryInputs[c.category_id] ?? String(c.limit)}
              onChange={(e) =>
                validateNumericInput(
                  e.target.value,
                  (value) => {
                    setDraftCategories((prev) => {
                      const next = [...prev];
                      next[i] = { ...next[i], limit: value };
                      return next;
                    });
                  },
                  (value) =>
                    setDraftCategoryInputs((prev) => ({
                      ...prev,
                      [c.category_id]: value,
                    }))
                )
              }
              onBlur={() =>
                setDraftCategoryInputs((prev) => ({
                  ...prev,
                  [c.category_id]: String(c.limit),
                }))
              }
              className="w-full pl-5 pr-10 text-xl md:text-2xl font-black bg-transparent outline-none text-[var(--color-text-primary)] tracking-tight"
              placeholder="0"
            />
            <Pencil
              size={14}
              className="pointer-events-none absolute right-4 text-[var(--color-text-secondary)] opacity-30 group-focus-within/input:opacity-80 transition-opacity"
            />
          </div>
        </div>
      );
    })}

    {/* ADD CATEGORY SELECTOR BUTTON */}
    <div className="relative mt-2">
      <button
        onClick={() => setIsSelectorOpen(!isSelectorOpen)}
        className="w-full p-4 border border-dashed border-[var(--border)] rounded-2xl md:rounded-[2rem] bg-[var(--color-surface)]/50 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-all flex items-center justify-center gap-2"
      >
        <PlusCircle size={14} />
        Add More Categories
      </button>

      {isSelectorOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsSelectorOpen(false)}
          />
          <div className="absolute bottom-full mb-4 left-0 right-0 z-50 bg-[var(--color-surface)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[350px]">
            <div className="p-4 border-b border-[var(--border)] bg-[var(--color-background)]/50 flex items-center gap-3">
              <Search size={14} className="text-[var(--color-text-secondary)] opacity-40" />
              <input
                autoFocus
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-bold w-full text-[var(--color-text-primary)]"
              />
            </div>
            <div className="overflow-y-auto p-2 no-scrollbar">
              {availableToAdd.length === 0 ? (
                <div className="py-8 text-center text-[10px] font-black uppercase text-[var(--color-text-secondary)] opacity-40">No categories found</div>
              ) : (
                availableToAdd.map(cat => {
                  const Icon = resolveLucideIcon(cat.icon || 'help');
                  return (
                    <button
                      key={cat.category_id}
                      onClick={() => {
                        setDraftCategories(prev => [...prev, {
                          category_id: cat.category_id,
                          name: cat.name,
                          limit: cat.suggested_limit || 0,
                          icon: cat.icon,
                          color: cat.color
                        }]);
                        setDraftCategoryInputs((prev) => ({
                          ...prev,
                          [cat.category_id]: String(cat.suggested_limit || 0),
                        }));
                        setSearchQuery("");
                        setIsSelectorOpen(false);
                      }}
                      className="w-full p-3 flex items-center gap-4 hover:bg-[var(--color-background)] rounded-2xl transition-colors group"
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                        style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                      >
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">{cat.name}</span>
                      <PlusCircle size={14} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  </div>
</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 flex flex-col gap-8 pb-24 mx-auto w-full">

      <div className="flex flex-col items-start justify-between gap-10">
        <div className="flex flex-rpw gap-4 md:gap-6 w-full justify-between">
          <h2 className="text-3xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tighter">
            Budgets
          </h2>

          {/* <button
            disabled={!canCreateBudget}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/10 hover:bg-[var(--color-accent)] hover:text-white hover:shadow-[0_15px_30px_-10px_rgba(82,61,255,0.4)] disabled:opacity-40"
          >
            <PlusCircle size={18} strokeWidth={2.5} />
            <span className="text-sm md:block hidden">
              {canCreateBudget ? "Create Budget" : "Creation Locked"}
            </span>
            <span className="text-sm block md:hidden">
              {canCreateBudget ? "Create" : "Locked"}
            </span>
          </button> */}
        </div>

        <div className="flex items-center justify-between md:justify-start gap-1 py-0.5 w-full md:w-auto">
          <button
            onClick={() =>
              setMonth((prev) => {
                const d = new Date(prev);
                d.setMonth(d.getMonth() - 1);
                return d;
              })
            }
            className="bg-[var(--color-accent)] text-[var(--color-surface)] transition-colors p-2 rounded-lg border border-[var(--border)] shrink-0"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-black uppercase text-[var(--color-accent)] tracking-widest text-center flex-1 md:flex-none md:mx-4">
            {month.toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
          <button
            onClick={() =>
              setMonth((prev) => {
                const d = new Date(prev);
                d.setMonth(d.getMonth() + 1);
                return d;
              })
            }
            disabled={!canGoToNextMonth}
            className="bg-[var(--color-accent)] text-[var(--color-surface)] transition-colors p-2 rounded-lg border border-[var(--border)] shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="relative w-full" style={{ isolation: 'isolate' }}>
        <div
          className="
      relative group rounded-[2.5rem] p-6 md:p-12 
      bg-gradient-to-br from-[#7c6cff] via-[#9c7cff] to-[#c084fc] 
      transition-all duration-500 
      shadow-2xl/50
      z-10
    "
        >
          <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-[60px] md:blur-[80px] -mr-20 -mt-20 md:-mr-32 md:-mt-32" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 text-center md:text-left">
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

      <div className="relative z-10 flex flex-col gap-6 md:gap-8">
        {riskyBudgets.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-success)]/20 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)] shadow-inner">
                <Sparkles size={20} />
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
                <Flame size={20} />
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
                      <div
                        className="h-full rounded-full shadow-sm transition-all duration-300"
                        style={{ background: color, width: `${percent}%` }}
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
