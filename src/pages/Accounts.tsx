import { useCallback } from "react";
import {
  Pencil,
  Trash2,
  PlusCircle,
  ChevronRight,
  Wallet,
  FileText,
  FileSpreadsheet,
  type LucideIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, PieChart, Pie, Cell, Area, ReferenceDot, Tooltip, XAxis, YAxis, AreaChart, type DotProps } from "recharts";
import AddAccountModal from "../components/accounts/AccountFormModal";
import AccountStatementModal from "../components/accounts/AccountStatementModal";
import {
  useAccounts,
  useAccountCategories,
  useCreateAccount,
  useUpdateAccount,
} from "../features/accounts/hooks/useAccounts";
import resolveLucideIcon from "../utils/LucideIconsResolver";
import { useConfirm } from "../components/ui/confirm-modal/useConfirm";
import { useToast } from "../components/ui/confirm-modal/useToast";
import { ThemeContext } from "../context/ThemeContext";
import { useHeaderConfig } from "../hooks/useHeaderConfig";
import { useExportAccountStatement } from "../features/accounts/hooks/useExportAccountStatement";
import { useExportAccountSummary } from "../features/accounts/hooks/useExportAccountSummary";
import { useAuth } from "../lib/context/useAuth";

type UiAccount = {
  _id: string;
  name: string;
  note?: string | null;
  type: string;
  group: string;
  balance: string;
  numericBalance: number;
  account_category_id: string;
  icon: LucideIcon;
  color: string;
  lastUpdated: string;
};

type AccountFilter = "all" | "cash" | "savings" | "investments" | "cards" | "loans";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatRelativeUpdate(dateString: string) {
  const now = new Date();
  const updated = new Date(dateString);
  const diffMs = now.getTime() - updated.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return updated.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatShortDate(dateString: string) {
  const updated = new Date(dateString);
  return updated.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function normalizeAccountGroup(group?: string | null) {
  const value = (group || "").toLowerCase();
  if (value.includes("wallet") || value.includes("cash")) return "cash";
  if (value.includes("saving")) return "savings";
  if (value.includes("invest")) return "investments";
  if (value.includes("card")) return "cards";
  if (value.includes("loan")) return "loans";
  return "all";
}

function formatApiDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type TrendPoint = { month: string; value: number };
type DistributionPoint = { label: string; amount: number; percentage: number; color: string };

function Sparkline({
  points,
  stroke,
  height,
  pulse = true,
}: {
  points: TrendPoint[];
  stroke: string;
  height: number;
  pulse?: boolean;
}) {
  const lastPoint = points[points.length - 1];

  return (
    <div style={{ width: "100%", height, padding: "4px 0" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 12, right: 25, left: 10, bottom: 12 }}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={`spark-fill-${stroke}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis hide dataKey="month" />
          <YAxis hide domain={['auto', 'auto']} padding={{ top: 10, bottom: 10 }} />

          <Tooltip
            cursor={{ stroke, strokeOpacity: 0.15, strokeWidth: 1 }}
            contentStyle={{
              borderRadius: "14px",
              border: "1px solid var(--border)",
              background: "var(--color-surface)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            }}
            labelStyle={{ color: "var(--color-text-secondary)", fontSize: 12 }}
            formatter={(value) => [formatCurrency(Number(value ?? 0))]}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            fill={`url(#spark-fill-${stroke})`}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: stroke, strokeWidth: 0 }}
            isAnimationActive={true}
            animationDuration={1000}
          />

          {lastPoint && pulse && (
            <ReferenceDot
              x={lastPoint.month}
              y={lastPoint.value}
              r={0}
              stroke="none"
              // 2. USE DotProps AND FIX NULL RETURN
              shape={(props: DotProps) => {
                const { cx, cy } = props;
                
                // If coordinates aren't ready, return an empty group (not null)
                if (cx === undefined || cy === undefined) return <g />;

                return (
                  <g className="recharts-layer">
                    <circle
                      cx={cx}
                      cy={cy}
                      r={11}
                      fill={stroke}
                      className="animate-ping"
                      style={{
                        transformOrigin: `${cx}px ${cy}px`,
                        opacity: 0.3,
                        animationDuration: '2s'
                      }}
                    />
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={4} 
                      fill={stroke} 
                      stroke="var(--color-surface)" 
                      strokeWidth={2}
                    />
                  </g>
                );
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
function AccountDistributionDonut({
  data,
  activeIndex,
  setActiveIndex,
  idPrefix,
  sizeClass,
}: {
  data: DistributionPoint[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  idPrefix: string;
  sizeClass: string;
}) {
  const display = data.length
    ? activeIndex !== null
      ? data[activeIndex]
      : data.reduce((prev, current) => (prev.percentage > current.percentage ? prev : current))
    : null;

  return (
    <div
      className={`relative shrink-0 self-center overflow-visible ${sizeClass}`}
      style={{ aspectRatio: "1" }}
      onMouseLeave={() => setActiveIndex(null)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart style={{ overflow: "visible" }}>
          <defs>
            {data.map((entry, index) => (
              <radialGradient
                key={`${idPrefix}-grad-${index}`}
                id={`${idPrefix}-grad-${index}`}
                cx="50%"
                cy="50%"
                r="75%"
              >
                <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                <stop offset="65%" stopColor={entry.color} stopOpacity={0.95} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.85} />
              </radialGradient>
            ))}
            <filter id={`${idPrefix}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="rgba(0,0,0,0.18)" />
            </filter>
          </defs>

          <Pie
            data={data.map((item) => ({ ...item, value: item.percentage }))}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius="64%"
            outerRadius="95%"
            paddingAngle={2}
            cornerRadius={4}
            stroke="none"
            animationDuration={1000}
            animationEasing="ease-out"
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {data.map((_, index) => {
              const isActive = activeIndex === index;
              return (
                <Cell
                  key={`${idPrefix}-cell-${index}`}
                  fill={`url(#${idPrefix}-grad-${index})`}
                  filter={`url(#${idPrefix}-shadow)`}
                  style={{
                    opacity: activeIndex === null || isActive ? 1 : 0.28,
                    transform: isActive ? "scale(1.04)" : "scale(1)",
                    transformOrigin: "center",
                    transition: "transform 0.25s ease, opacity 0.25s ease, filter 0.25s ease",
                    filter: isActive
                      ? `url(#${idPrefix}-shadow) brightness(1.12)`
                      : `url(#${idPrefix}-shadow)`,
                  }}
                />
              );
            })}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {display ? (
          <>
            <span className="text-[8px] font-black uppercase text-[var(--color-text-secondary)] tracking-widest">
              {activeIndex !== null ? "Focusing" : "Top Share"}
            </span>
            <span className="text-[12px] md:text-sm font-black text-[var(--color-text-primary)] truncate max-w-[110px] md:max-w-[130px] text-center">
              {display.label}
            </span>
            <span className="text-base md:text-base font-black text-[var(--color-text-primary)]">
              {display.percentage.toFixed(1)}%
            </span>
          </>
        ) : (
          <>
            <span className="text-[10px] md:text-sm font-semibold text-[var(--color-text-secondary)]">No Data</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function Accounts() {
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [desktopFilter, setDesktopFilter] = useState<AccountFilter>("all");
  const mobileTabsScrollRef = useRef<HTMLDivElement | null>(null);
  const [showLeftTabsFade, setShowLeftTabsFade] = useState(false);
  const [showRightTabsFade, setShowRightTabsFade] = useState(false);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();
  const { accessToken } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const { data: accountsData, isLoading: accountsLoading } = useAccounts({ currentDate: today });
  const { data: categoriesData, isLoading: categoriesLoading } = useAccountCategories();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const exportMutation = useExportAccountStatement({ accessToken });
  const exportSummaryMutation = useExportAccountSummary({ accessToken });

  const categories = categoriesData?.accountCategories ?? [];
  const rawAccounts = accountsData?.accounts ?? [];
  const analytics = accountsData?.analytics;
  const editingAccount = rawAccounts.find((acc) => acc._id === editingAccountId) ?? null;
  const [activeMobileDistributionIndex, setActiveMobileDistributionIndex] = useState<number | null>(null);
  const [activeDesktopDistributionIndex, setActiveDesktopDistributionIndex] = useState<number | null>(null);

  const accounts: UiAccount[] = useMemo(() => {
    return rawAccounts.map((acc) => ({
      _id: acc._id,
      name: acc.name,
      note: acc.note,
      type: acc.account_category_name || acc.account_category_group || "Account",
      group: normalizeAccountGroup(acc.account_category_group || acc.account_category_name),
      account_category_id: acc.account_category_id,
      balance: formatCurrency(acc.current_balance),
      numericBalance: acc.current_balance,
      icon: resolveLucideIcon(acc.account_category_icon),
      color: acc.account_category_color || "#7c6cff",
      lastUpdated: formatRelativeUpdate(acc.updated_at),
      shortDate: formatShortDate(acc.updated_at),
    }));
  }, [rawAccounts]);

  const totalBalance = useMemo(
    () => analytics?.summary?.totalBalance ?? rawAccounts.reduce((sum, acc) => sum + acc.current_balance, 0),
    [analytics?.summary?.totalBalance, rawAccounts]
  );

  const monthlyNetFlow = analytics?.summary?.monthlyNetFlow ?? 0;
  const monthlyFlowChange = analytics?.summary?.monthlyFlowChange ?? 0;
  const isNetFlowPositive = monthlyNetFlow > 0;
  const isNetFlowNegative = monthlyNetFlow < 0;
  const isFlowChangePositive = monthlyFlowChange > 0;
  const isFlowChangeNegative = monthlyFlowChange < 0;
  const trendData = analytics?.insights?.trend ?? [];

  const distributionData: DistributionPoint[] = useMemo(() => {
    const input = analytics?.distribution ?? [];
    return input
      .map((item, index) => ({
        label: item.label || `Category ${index + 1}`,
        amount: Math.abs(item.amount ?? 0),
        percentage: Math.max(0, Math.min(100, item.percentage ?? 0)),
        color: item.color || "#94a3b8",
      }))
      .filter((item) => item.amount > 0 || item.percentage > 0);
  }, [analytics?.distribution]);

  // const cashTotal = useMemo(() => rawAccounts.filter(a => normalizeAccountGroup(a.account_category_group || a.account_category_name) === "cash").reduce((s, a) => s + a.current_balance, 0), [rawAccounts]);
  // const savingsTotal = useMemo(() => rawAccounts.filter(a => normalizeAccountGroup(a.account_category_group || a.account_category_name) === "savings").reduce((s, a) => s + a.current_balance, 0), [rawAccounts]);
  // const investTotal = useMemo(() => rawAccounts.filter(a => normalizeAccountGroup(a.account_category_group || a.account_category_name) === "investments").reduce((s, a) => s + a.current_balance, 0), [rawAccounts]);

  const filteredAccounts = useMemo(() => {
    if (desktopFilter === "all") return accounts;
    return accounts.filter((acc) => acc.group === desktopFilter);
  }, [accounts, desktopFilter]);

  const isDark =
    theme === "dark" ||
    (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleCreateAccount = async (payload: { name: string; opening_balance?: number; account_category_id: string; note?: string }) => {
    try {
      await createAccountMutation.mutateAsync({ name: payload.name, opening_balance: payload.opening_balance ?? 0, account_category_id: payload.account_category_id, note: payload.note });
      setShowAddAccountModal(false);
    } catch (error) { console.error("Create account failed:", error); }
  };

  const handleEditAccount = async (payload: { name: string; account_category_id: string; note?: string }) => {
    if (!editingAccountId) return;
    try {
      await updateAccountMutation.mutateAsync({ id: editingAccountId, payload });
      setEditingAccountId(null);
    } catch (error) { console.error("Update account failed:", error); }
  };

  const handleArchiveAccount = async (account: UiAccount) => {
    const ok = await confirm({ title: "Delete Account?", message: "This account will be deleted and removed from your active accounts list.", confirmText: "Delete", cancelText: "Cancel", variant: "danger" });
    if (!ok) return;
    try {
      await updateAccountMutation.mutateAsync({ id: account._id, payload: { name: account.name, account_category_id: account.account_category_id, note: account.note ?? "", is_archived: true } });
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Archive account failed:", error);
      toast.error("Failed to delete account");
    }
  };

  const allFilters: { key: AccountFilter; label: string }[] = [
    { key: "all", label: "All Accounts" },
    { key: "cash", label: "Cash Wallet" },
    { key: "savings", label: "Savings" },
    { key: "investments", label: "Investments" },
    { key: "cards", label: "Cards" },
    { key: "loans", label: "Loans" },
  ];

  const handleExportStatement = async (payload: {
    accountId: string;
    startDate: Date;
    endDate: Date;
    format: "csv" | "pdf";
  }) => {
    try {
      await exportMutation.mutateAsync({
        accountId: payload.accountId,
        format: payload.format,
        params: {
          startDate: formatApiDate(payload.startDate),
          endDate: formatApiDate(payload.endDate),
        },
      });
      toast.success("Your account statement export has started");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export account statement");
      throw error;
    }
  };

  const handleExportSummary = async () => {
    try {
      await exportSummaryMutation.mutateAsync({
        params: {
          currentDate: today,
        },
      });
      toast.success("Your account summary export has started");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export account summary");
    }
  };

  const isExportingData =
    exportMutation.isPending ||
    exportSummaryMutation.isPending;

  useEffect(() => {
    const el = mobileTabsScrollRef.current;
    if (!el) return;

    const updateFades = () => {
      const maxScrollLeft = Math.max(el.scrollWidth - el.clientWidth, 0);
      setShowLeftTabsFade(el.scrollLeft > 1);
      setShowRightTabsFade(el.scrollLeft < maxScrollLeft - 1);
    };

    updateFades();
    el.addEventListener("scroll", updateFades, { passive: true });
    window.addEventListener("resize", updateFades);
    return () => {
      el.removeEventListener("scroll", updateFades);
      window.removeEventListener("resize", updateFades);
    };
  }, []);

  const handleOpenAccountSheet = useCallback(() => {
    setShowAddAccountModal(true);
  }, []);

  useHeaderConfig({
    heroColor: null,
    heroHeight: 60,
    showLogo: false,
    scrollTitle: "Accounts",
    scrollAction: "+",
    onAction: handleOpenAccountSheet,
  });
  return (
    <>
      {/* ─── MOBILE ─────────────────────────────────────────────────────────── */}
      <div
        className="lg:hidden pb-24"
        style={{
          // background: isDark ? "#0a0a0a" : "#f5f5f5",
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-3 pb-3 mb-3">
          <div>
            <h2 className="text-[1.5rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">
              Accounts
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
              <span className=" text-[0.8rem] font-semibold text-(--color-text-secondary)">
                {accounts.length} Active Accounts
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowAddAccountModal(true)}
            className="text-[var(--color-primary)] flex shrink-0 group items-center justify-center gap-2 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold"
          >
            <PlusCircle size={16} className="group-hover:rotate-90 transition-transform" />

            Add
          </button>
        </div>

        {/* Hero Balance Card */}
        <div className="mx-3 rounded-[1.4rem] shadow-xs overflow-hidden" style={{
          background: isDark
            ? "linear-gradient(160deg, #071209 0%, #0a1f0e 40%, #0c2a12 100%)"
            : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
          position: "relative",
        }}>
          {isDark && (
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "radial-gradient(circle, rgba(34,197,94,0.22) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              opacity: 0.6,
            }} />
          )}
          {!isDark && (
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: `radial-gradient(circle, var(--color-primary) 1px, transparent 1px)`,
              backgroundSize: "22px 22px",
              opacity: 0.3,
              filter: "blur(0.8px)",
            }} />
          )}
          {isDark && (
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: `radial-gradient(60% 60% at 100% 0%, rgba(34,197,94,0.18) 0%, rgba(34,197,94,0.10) 25%, rgba(34,197,94,0.05) 40%, transparent 55%)`,
            }} />
          )}

          <div className="relative px-6 pt-6 pb-0">
            <div className="flex items-start justify-between">
              <div>
                {/* text-[0.8rem] uppercase tracking-[0.13em] font-semibold mb-4 text-(--color-text-primary) */}
                <p className="text-[0.7rem] font-semibold tracking-[0.13em] uppercase mb-3 text-(--color-text-primary)/80"
                >
                  Total Balance
                </p>
                <h2 className="text-[2.1rem] font-bold tracking-[-0.03em] leading-none truncate text-(--color-text-primary)"
                >
                  {formatCurrency(totalBalance)}
                </h2>
                <p className="mt-3 text-[0.85rem] text-(--color-text-primary)/80" >
                  across all accounts
                </p>
              </div>
              {/* <div className="text-right">
                <p className="text-[2rem] font-bold leading-none text-[#22c55e]">
                  {accounts.length}
                </p>
                <p className="text-[0.6rem] font-bold tracking-[0.16em] uppercase mt-1"
                  style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#6b7280" }}>
                  Accounts
                </p>
              </div> */}
            </div>
          </div>

          {/* Wave SVG */}
          <div style={{ height: "70px", position: "relative", marginTop: "2px", transform: "translateY(-10px)" }}>
            <svg viewBox="0 0 900 120" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
              <defs>
                <linearGradient id="deskWaveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.20" />
                  <stop offset="18%" stopColor="#22c55e" stopOpacity="0.17" />
                  <stop offset="32%" stopColor="#22c55e" stopOpacity="0.13" />
                  <stop offset="48%" stopColor="#22c55e" stopOpacity="0.09" />
                  <stop offset="62%" stopColor="#22c55e" stopOpacity="0.06" />
                  <stop offset="74%" stopColor="#22c55e" stopOpacity="0.045" />
                  <stop offset="84%" stopColor="#22c55e" stopOpacity="0.03" />
                  <stop offset="90%" stopColor="#22c55e" stopOpacity="0.02" />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity="0.012" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,120 L0,74 C70,70 120,50 170,38 C220,28 260,34 300,42 C350,52 390,70 440,68 C490,66 520,40 570,32 C620,28 660,40 700,52 C750,65 800,58 840,42 C870,28 890,18 900,16 L900,120 Z"
                fill="url(#deskWaveGrad)"
              />
              <path
                d="M0,74 C70,70 120,50 170,38 C220,28 260,34 300,42 C350,52 390,70 440,68 C490,66 520,40 570,32 C620,28 660,40 700,52 C750,65 800,58 840,42 C870,28 890,18 900,16"
                fill="none"
                stroke={isDark ? "#4ade80" : "#86efac"}
                strokeWidth="1.8"
                strokeOpacity={isDark ? "0.35" : "0.45"}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>



        {/* Filter Tabs — key fix: width strictly contained, scroll inside */}
        <div className="mt-6 w-full max-w-[100vw] overflow-x-hidden box-border">
          <div className="relative px-4 box-border">
            {/* Scrollable tab strip */}
            <div
              ref={mobileTabsScrollRef}
              style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}
              className="overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [scrollbar-gutter:stable] [scroll-snap-type:x_proximity] [scrollbar-color:transparent_transparent] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
            >
              <div className="inline-flex whitespace-nowrap pr-4 min-w-max">
                {allFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setDesktopFilter(f.key)}
                    className={`pb-2.5 px-0 mr-5 text-[0.85rem] font-bold whitespace-nowrap bg-transparent border-0 border-b-3 mb-[-1px] shrink-0 transition-colors ${desktopFilter === f.key
                      ? "text-[var(--color-primary)] border-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] border-transparent"
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Fade overlays */}
            {showLeftTabsFade && (
              <div
                className="pointer-events-none absolute left-4 top-0 h-full w-10"
                style={{ background: "linear-gradient(to right, var(--color-background) 20%, rgba(245,245,245,0))" }}
              />
            )}
            {showRightTabsFade && (
              <div
                className="pointer-events-none absolute right-4 top-0 h-full w-10"
                style={{ background: "linear-gradient(to left, var(--color-background) 20%, rgba(245,245,245,0))" }}
              />
            )}
          </div>
        </div>

        {/* Account List */}
        <div className="mt-5 mx-1">
          {accountsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="mx-2 mt-2 h-[72px] rounded-xl animate-pulse bg-(--color-surface)" />
            ))
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center mx-2 mt-2 rounded-2xl p-10 text-base bg-(--color-surface) border border-(--border)"
            >
              No accounts found in this category.
            </div>
          ) : filteredAccounts.map((acc) => {
            const Icon = acc.icon;

            return (
              <div
                key={acc._id}
                onClick={() => navigate(`/accounts/transactions/${acc._id}`)}
                className="mx-2 mt-4 rounded-2xl p-4 bg-(--color-surface) border border-(--border) shadow-xs"
              >
                {/* TOP ROW */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 w-0 flex-1 basis-0 overflow-hidden">
                    <div
                      className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{
                        background: isDark ? `${acc.color}22` : `${acc.color}15`,
                        color: acc.color,
                      }}
                    >
                      <Icon size={20} strokeWidth={2.2} />
                    </div>

                    <div className="min-w-0 w-0 flex-1 overflow-hidden">
                      <p
                        className="block max-w-full min-w-0 truncate text-[0.95rem] font-semibold text-(--color-text-primary)"
                      >
                        {acc.name}
                      </p>
                      <p
                        className="text-[0.75rem] mt-0.5 text-(--color-text-secondary)"
                      >
                        {acc.type}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-2 ml-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingAccountId(acc._id)}
                      className="p-2 rounded-lg text-(--color-text-secondary)"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => void handleArchiveAccount(acc)}
                      className="p-2 rounded-lg text-(--color-danger)"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* BALANCE */}
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p
                      className="text-[1.25rem] font-bold tracking-[-0.02em] text-(--color-text-primary)"
                    >
                      {acc.balance}
                    </p>
                    <p
                      className="text-[0.7rem] mt-1 text-(--color-text-secondary)"
                    >
                      Last updated · {acc.lastUpdated}
                    </p>
                  </div>

                  <button

                    className="flex items-center gap-1 text-[0.75rem] font-semibold"
                    style={{ color: "#22c55e" }}
                  >
                    View
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="my-6 mx-4 relative h-px bg-[var(--border)] md:bottom-0 md:left-15 md:right-2" />

        {/* Account Insights Card */}
        <div className="mx-3 mt-4 rounded-2xl overflow-hidden p-5 bg-(--color-surface) border border-(--border)"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-[1.05rem] font-bold text-(--color-text-primary)">Account Insights</h3>
              <div className="mt-2">
                {trendData.length > 0 ? (
                  <Sparkline points={trendData} stroke="#4ade80" height={80} pulse />
                ) : (
                  <p className="text-[0.75rem] mt-2 text-(--color-text-secondary)">No trend data available.</p>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-[1.3rem] font-bold leading-tight ${isNetFlowNegative ? "text-(--color-danger)" : "text-(--color-primary)"}`}>
                {isNetFlowPositive ? "+" : isNetFlowNegative ? "-" : ""}₹{Math.abs(monthlyNetFlow).toLocaleString("en-IN")}
              </p>
              <p className={`text-[0.72rem] mt-0.5 ${isFlowChangeNegative ? "text-(--color-danger)" : "text-(--color-primary)"}`}>
                {isFlowChangePositive ? "↑ " : isFlowChangeNegative ? "↓ " : ""}
                {Math.abs(monthlyFlowChange).toFixed(1)}% vs last month
              </p>
              <p className="text-[0.72rem] mt-0.5 text-(--color-text-secondary)" >This month's net flow</p>
            </div>
          </div>
        </div>

        {/* Account Distribution Card */}
        <div className="mx-3 mt-3 rounded-2xl overflow-hidden p-5 bg-(--color-surface) border border-(--border)"
        >
          <h3 className="text-[1.05rem] font-bold mb-4 text-(--color-text-primary)">Asset Distribution</h3>
          <div className="flex items-center gap-2">
            <AccountDistributionDonut
              data={distributionData}
              activeIndex={activeMobileDistributionIndex}
              setActiveIndex={setActiveMobileDistributionIndex}
              idPrefix="accounts-mobile-distribution"
              sizeClass="w-[140px] h-[140px]"
            />
            <div className="flex-1 space-y-2">
              {distributionData.length === 0 ? (
                <p className="text-[0.82rem] text-(--color-text-secondary)">No distribution data.</p>
              ) : distributionData.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className={`flex items-center justify-between rounded-lg px-2 py-1.5 transition-all duration-200 ${activeMobileDistributionIndex === index ? "bg-[var(--color-background)] border border-[var(--color-accent)]/40 shadow-sm" : ""}`}
                  onMouseEnter={() => setActiveMobileDistributionIndex(index)}
                  onMouseLeave={() => setActiveMobileDistributionIndex(null)}
                >
                  <span className="flex items-center gap-2 text-[0.82rem]" style={{ color: isDark ? "#d1d5db" : "#4b5563" }}>
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    {item.label}
                  </span>
                  <span className="text-[0.82rem] font-semibold" style={{ color: isDark ? "#d1d5db" : "#4b5563" }}>{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── DESKTOP ─────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block w-full md:pb-10">
        <div className="mx-auto w-full max-w-[1580px]">
          {/* Header row */}
          <div className="flex items-start justify-between gap-6 mb-7">
            <div>
              <h2 className="text-[2.1rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">
                Accounts
              </h2>
            </div>
            <button
              onClick={() => setShowAddAccountModal(true)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors
              text-[var(--color-primary)] hover:bg-[var(--color-accent-soft)]
              border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)]"
            >
              <PlusCircle size={20} />
              Add New Account
            </button>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-4">
            {/* LEFT COLUMN */}
            <div>
              {/* Hero Card */}
              <div
                className="mb-7 overflow-hidden rounded-2xl border shadow-sm"
                style={{
                  position: "relative",
                  border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.05)",
                  background: isDark
                    ? "linear-gradient(155deg, #060e08 0%, #071209 35%, #0b1e0e 65%, #0d2812 100%)"
                    : "var(--color-surface)",
                  minHeight: "180px",
                }}
              >
                {isDark && (
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    backgroundImage: "radial-gradient(circle, rgba(34,197,94,0.22) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                    opacity: 0.6,
                  }} />
                )}
                {!isDark && (
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    backgroundImage: `radial-gradient(circle, var(--color-primary) 1px, transparent 1px)`,
                    backgroundSize: "22px 22px",
                    opacity: 0.3,
                    filter: "blur(0.8px)",
                  }} />
                )}
                {isDark && (
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: `radial-gradient(60% 60% at 100% 0%, rgba(34,197,94,0.18) 0%, rgba(34,197,94,0.10) 25%, rgba(34,197,94,0.05) 40%, transparent 55%)`,
                  }} />
                )}

                <div className="relative px-10 pt-10 pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[0.8rem] uppercase tracking-[0.13em] font-semibold mb-4 text-(--color-text-primary)/80">
                        Total Balance
                      </p>
                      <h2 className="text-[2.7rem] leading-none font-bold tracking-[-0.03em] text-(--color-text-primary)">
                        {formatCurrency(totalBalance)}
                      </h2>
                      <p className="mt-5 text-[1rem] text-(--color-text-primary)/80">
                        across all accounts
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <div>
                        <p className="text-[0.8rem] uppercase tracking-[0.13em] font-semibold mb-2 text-(--color-text-primary)">
                          Accounts
                        </p>
                      </div>
                      <div className="text-right flex gap-6 items-center">
                        <p className="text-[3rem] leading-none font-semibold"
                          style={{ color: isDark ? "var(--color-text-primary)" : "var(--color-primary)" }}>
                          {accounts.length}
                        </p>
                        <span className={`flex h-14 w-14 items-center justify-center rounded-full ${isDark ? "bg-(--color-text-primary)/10" : "bg-(--color-primary)/10"}`}>
                          <Wallet size={28} className={isDark ? "text-(--color-text-primary)" : "text-(--color-primary)"} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wave at bottom */}
                <div style={{ height: "70px", position: "relative", marginTop: "2px", transform: "translateY(-10px)" }}>
                  <svg viewBox="0 0 900 120" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
                    <defs>
                      <linearGradient id="deskWaveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.20" />
                        <stop offset="18%" stopColor="#22c55e" stopOpacity="0.17" />
                        <stop offset="32%" stopColor="#22c55e" stopOpacity="0.13" />
                        <stop offset="48%" stopColor="#22c55e" stopOpacity="0.09" />
                        <stop offset="62%" stopColor="#22c55e" stopOpacity="0.06" />
                        <stop offset="74%" stopColor="#22c55e" stopOpacity="0.045" />
                        <stop offset="84%" stopColor="#22c55e" stopOpacity="0.03" />
                        <stop offset="90%" stopColor="#22c55e" stopOpacity="0.02" />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity="0.012" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,120 L0,74 C70,70 120,50 170,38 C220,28 260,34 300,42 C350,52 390,70 440,68 C490,66 520,40 570,32 C620,28 660,40 700,52 C750,65 800,58 840,42 C870,28 890,18 900,16 L900,120 Z"
                      fill="url(#deskWaveGrad)"
                    />
                    <path
                      d="M0,74 C70,70 120,50 170,38 C220,28 260,34 300,42 C350,52 390,70 440,68 C490,66 520,40 570,32 C620,28 660,40 700,52 C750,65 800,58 840,42 C870,28 890,18 900,16"
                      fill="none"
                      stroke={isDark ? "#4ade80" : "#86efac"}
                      strokeWidth="1.8"
                      strokeOpacity={isDark ? "0.35" : "0.45"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="mb-5">
                <div className="flex items-center gap-3 flex-wrap">
                  {allFilters.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setDesktopFilter(item.key)}
                      className="rounded-xl px-5 py-3 text-sm font-bold transition bg-(--color-surface) border border-(--border) text-(--color-text-secondary)"
                      style={
                        desktopFilter === item.key
                          ? { background: "var(--color-accent-soft)", color: "var(--color-primary)" }
                          : {}
                      }
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Rows */}
              <div className="space-y-3">
                {accountsLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="h-[72px] rounded-2xl animate-pulse bg-(--color-surface) border border-(--border)" />
                  ))
                ) : filteredAccounts.length === 0 ? (
                  <div className="rounded-2xl p-10 text-base bg-(--color-surface) border border-(--border)"
                  >
                    No accounts found in this category.
                  </div>
                ) : (
                  filteredAccounts.map((acc) => {
                    const Icon = acc.icon;
                    return (
                      <div
                        key={acc._id}
                        onClick={() => navigate(`/accounts/transactions/${acc._id}`)}
                        className="group cursor-pointer rounded-2xl pl-7 py-5 pr-3 transition grid items-center gap-5 bg-(--color-surface) border border-(--border) hover:border-(--color-accent)/40"
                        style={{
                          gridTemplateColumns: "52px minmax(0, 1fr) minmax(140px, 0.9fr) minmax(80px, 0.6fr) 120px",
                        }}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{ background: `${acc.color}1f`, color: acc.color }}>
                          <Icon size={24} strokeWidth={2.3} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-[1.1rem] font-semibold text-(--color-text-primary)">{acc.name}</h3>
                          <p className="mt-2 text-[0.85rem] leading-none text-(--color-text-secondary)">{acc.type}</p>
                        </div>
                        <div className="min-w-0 truncate text-[1.1rem] font-semibold tracking-[-0.02em] text-(--color-text-primary)" title={acc.balance}>
                          {acc.balance}
                        </div>
                        <div>
                          <p className="text-[0.85rem] text-(--color-text-secondary)">Updated</p>
                          <p className="mt-1 text-[0.9rem] text-(--color-text-secondary)">{acc.lastUpdated}</p>
                        </div>
                        <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setEditingAccountId(acc._id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl transition text-(--color-text-secondary) hover:bg-(--color-accent-soft) p-2"
                            aria-label={`Edit ${acc.name}`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => void handleArchiveAccount(acc)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-(--color-danger) hover:bg-(--color-danger)/10 transition p-2"
                            aria-label={`Delete ${acc.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/accounts/transactions/${acc._id}`)}
                            className="text-[var(--color-text-secondary)] opacity-30 translate-x-[-6px] transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 flex h-9 w-9 items-center justify-center rounded-xl"
                            aria-label={`View ${acc.name}`}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-4">
              {/* Account Insights */}
              <div className="rounded-2xl p-6 bg-(--color-surface) shadow-xs border border-[var(--border)]">
                <h3 className="text-base leading-none font-semibold text-(--color-text-primary)">Account Insights</h3>
                <div className="mt-6">
                  {trendData.length > 0 ? (
                    <Sparkline points={trendData} stroke="#22c55e" height={120} pulse />
                  ) : (
                    <p className="text-sm text-(--color-text-secondary)">No trend data available.</p>
                  )}
                </div>
                <p className="text-sm font-semibold text-(--color-text-secondary)">This month's net flow</p>
                <p className={`mt-2 text-[24px] font-bold ${isNetFlowNegative ? "text-(--color-danger)" : "text-(--color-primary)"}`}>
                  {isNetFlowPositive ? "+" : isNetFlowNegative ? "-" : ""}₹{Math.abs(monthlyNetFlow).toLocaleString("en-IN")}
                </p>
                <p className="mt-2 text-sm text-(--color-text-secondary) flex">
                  <span className={`font-semibold mr-2 flex items-center ${isFlowChangeNegative ? "text-(--color-danger)" : "text-(--color-primary)"}`}>
                    {isFlowChangePositive ? <ArrowUp size={18} className="mr-1" /> : null}
                    {isFlowChangeNegative ? <ArrowDown size={18} className="mr-1" /> : null}
                    {Math.abs(monthlyFlowChange).toFixed(1)}%
                  </span>
                  vs last month
                </p>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl p-6 bg-(--color-surface) shadow-xs border border-[var(--border)]">
                <h3 className="font-semibold mb-5 text-base leading-none text-(--color-text-primary)">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStatementModal(true)}
                    disabled={isExportingData}
                    className="rounded-xl border border-[var(--border)] p-3 text-center cursor-pointer hover:bg-[var(--color-background)]/40 transition-colors flex flex-col gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="mx-auto text-[var(--color-success)] mb-1.5" size={22} />
                    <p className="text-[12px] font-semibold text-[var(--color-text-secondary)] leading-tight">Account Statement</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleExportSummary()}
                    disabled={isExportingData}
                    className="rounded-xl border border-[var(--border)] p-3 text-center cursor-pointer hover:bg-[var(--color-background)]/40 transition-colors flex flex-col gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileSpreadsheet className="mx-auto text-[var(--color-warm)] mb-1.5" size={22} />
                    <p className="text-[12px] font-semibold text-[var(--color-text-secondary)] leading-tight">
                      {exportSummaryMutation.isPending ? "Exporting..." : "Export Summary"}
                    </p>
                  </button>
                </div>
              </div>

              {/* Account Distribution */}
              <div className="rounded-2xl p-6 bg-(--color-surface) shadow-xs border border-[var(--border)]">
                <h3 className="font-semibold mb-5 text-base leading-none text-(--color-text-primary)">Asset Distribution</h3>
                <div className="flex items-center gap-6">
                  <AccountDistributionDonut
                    data={distributionData}
                    activeIndex={activeDesktopDistributionIndex}
                    setActiveIndex={setActiveDesktopDistributionIndex}
                    idPrefix="accounts-desktop-distribution"
                    sizeClass="w-[160px] h-[160px]"
                  />
                  <div className="flex-1 space-y-3 text-sm" style={{ color: isDark ? "#d0d5dd" : "#4b5563" }}>
                    {distributionData.length === 0 ? (
                      <p className="text-sm text-(--color-text-secondary)">No distribution data.</p>
                    ) : distributionData.map((item, index) => (
                      <div
                        key={`${item.label}-${index}`}
                        className={`cursor-pointer flex items-center justify-between rounded-xl px-2.5 py-2 transition-all duration-200 ${activeDesktopDistributionIndex === index
                          ? "bg-[var(--color-background)] border border-[var(--color-accent)] shadow-sm"
                          : "border border-transparent"
                          }`}
                        onMouseEnter={() => setActiveDesktopDistributionIndex(index)}
                        onMouseLeave={() => setActiveDesktopDistributionIndex(null)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                          {item.label}
                        </span>
                        <span>{item.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AccountStatementModal
        open={showStatementModal}
        onClose={() => setShowStatementModal(false)}
        accounts={rawAccounts.map((acc) => ({ _id: acc._id, name: acc.name }))}
        onExport={handleExportStatement}
      />

      <AddAccountModal
        open={showAddAccountModal}
        mode="create"
        onClose={() => setShowAddAccountModal(false)}
        categories={categories}
        loading={createAccountMutation.isPending || categoriesLoading}
        onSubmit={handleCreateAccount}
      />

      <AddAccountModal
        key={editingAccount?._id ?? "edit-account"}
        open={!!editingAccount}
        mode="edit"
        onClose={() => setEditingAccountId(null)}
        categories={categories}
        loading={updateAccountMutation.isPending || categoriesLoading}
        initialValues={
          editingAccount
            ? {
              name: editingAccount.name,
              opening_balance: editingAccount.opening_balance,
              account_category_id: editingAccount.account_category_id,
              note: editingAccount.note ?? "",
            }
            : undefined
        }
        onSubmit={handleEditAccount}
      />
      <style>{`
  .recharts-wrapper svg,
  .recharts-surface {
    overflow: visible !important;
  }
`}</style>
    </>
  );
}
