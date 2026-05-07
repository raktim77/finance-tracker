import React, { useCallback } from "react";
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
} from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddAccountModal from "../components/accounts/AccountFormModal";
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

export default function Accounts() {
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [desktopFilter, setDesktopFilter] = useState<AccountFilter>("all");
  const mobileTabsScrollRef = useRef<HTMLDivElement | null>(null);
  const [showLeftTabsFade, setShowLeftTabsFade] = useState(false);
  const [showRightTabsFade, setShowRightTabsFade] = useState(false);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const { data: categoriesData, isLoading: categoriesLoading } = useAccountCategories();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();

  const categories = categoriesData?.accountCategories ?? [];
  const rawAccounts = accountsData?.accounts ?? [];
  const editingAccount = rawAccounts.find((acc) => acc._id === editingAccountId) ?? null;

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

  const totalBalance = useMemo(() => rawAccounts.reduce((sum, acc) => sum + acc.current_balance, 0), [rawAccounts]);

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
        <div className="flex items-start justify-between px-2 pt-2 pb-3 mb-3">
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
        <div className="mx-2 rounded-[1.4rem] overflow-hidden" style={{
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
        <div className="mt-5">
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

        <div className="my-6 mx-3 relative h-px bg-[var(--border)] md:bottom-0 md:left-15 md:right-2" />

        {/* Account Insights Card */}
        <div className="mx-2 mt-4 rounded-2xl overflow-hidden p-5 bg-(--color-surface) border border-(--border)"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-[1.05rem] font-bold text-(--color-text-primary)">Account Insights</h3>
              <svg viewBox="0 0 180 60" className="mt-2 w-full">
                <path d="M5 35 C25 30, 35 38, 55 28 C70 20, 85 32, 100 22 C115 12, 130 28, 145 18 C158 10, 168 22, 175 10"
                  fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[1.3rem] font-bold text-(--color-primary) leading-tight">+₹28,740.20</p>
              <p className="text-[0.72rem] text-(--color-primary) mt-0.5">↑ 18.4% vs last month</p>
              <p className="text-[0.72rem] mt-0.5 text-(--color-text-secondary)" >This month's net flow</p>
            </div>
          </div>
        </div>

        {/* Account Distribution Card */}
        <div className="mx-2 mt-3 rounded-2xl overflow-hidden p-5 bg-(--color-surface) border border-(--border)"
        >
          <h3 className="text-[1.05rem] font-bold mb-4 text-(--color-text-primary)">Account Distribution</h3>
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0" style={{ width: "100px", height: "100px" }}>
              <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="38" fill="none" stroke={isDark ? "#1f2937" : "#f3f4f6"} strokeWidth="14" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="14"
                  strokeDasharray={`${37.1 * 2.388} ${100 * 2.388}`} strokeDashoffset="0" strokeLinecap="butt" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#7c3aed" strokeWidth="14"
                  strokeDasharray={`${44.4 * 2.388} ${100 * 2.388}`} strokeDashoffset={`-${37.1 * 2.388}`} strokeLinecap="butt" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" strokeWidth="14"
                  strokeDasharray={`${12.5 * 2.388} ${100 * 2.388}`} strokeDashoffset={`-${(37.1 + 44.4) * 2.388}`} strokeLinecap="butt" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#9ca3af" strokeWidth="14"
                  strokeDasharray={`${6.0 * 2.388} ${100 * 2.388}`} strokeDashoffset={`-${(37.1 + 44.4 + 12.5) * 2.388}`} strokeLinecap="butt" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[1.2rem] font-bold leading-none" style={{ color: isDark ? "#f0f0f0" : "#111318" }}>{accounts.length}</p>
                <p className="text-[0.62rem]" style={{ color: isDark ? "#6b7280" : "#9ca3af" }}>Accounts</p>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { color: "#3b82f6", label: "Savings", pct: "37.1%" },
                { color: "#7c3aed", label: "Investments", pct: "44.4%" },
                { color: "#22c55e", label: "Cash Wallet", pct: "12.5%" },
                { color: "#9ca3af", label: "Others", pct: "6.0%" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[0.82rem]" style={{ color: isDark ? "#d1d5db" : "#4b5563" }}>
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    {item.label}
                  </span>
                  <span className="text-[0.82rem] font-semibold" style={{ color: isDark ? "#d1d5db" : "#4b5563" }}>{item.pct}</span>
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
                <svg viewBox="0 0 360 120" className="mt-6 w-full">
                  <defs>
                    <linearGradient id="insightGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 72 C40 66, 52 60, 74 58 C95 55, 110 62, 126 51 C145 37, 162 42, 180 50 C198 61, 220 65, 238 57 C255 50, 275 39, 292 58 C308 76, 327 37, 350 14"
                    fill="none" stroke="url(#insightGrad)" strokeWidth="3" strokeLinecap="round"
                  />
                  <circle cx="350" cy="14" r="4" fill="#22c55e" />
                </svg>
                <p className="text-sm font-semibold text-(--color-text-secondary)">This month's net flow</p>
                <p className="mt-2 text-[24px] text-(--color-primary) font-bold">+₹28,740.20</p>
                <p className="mt-2 text-sm text-(--color-text-secondary) flex">
                  <span className="text-(--color-primary) font-semibold mr-2 flex items-center"><ArrowUp size={18} className="mr-1" /> 18.4%</span> vs last month
                </p>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl p-6 bg-(--color-surface) shadow-xs border border-[var(--border)]">
                <h3 className="font-semibold mb-5 text-base leading-none text-(--color-text-primary)">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-[var(--border)] p-3 text-center cursor-pointer hover:bg-[var(--color-background)]/40 transition-colors flex flex-col gap-3">
                    <FileText className="mx-auto text-[var(--color-success)] mb-1.5" size={22} />
                    <p className="text-[12px] font-semibold text-[var(--color-text-secondary)] leading-tight">Account Statement</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] p-3 text-center cursor-pointer hover:bg-[var(--color-background)]/40 transition-colors flex flex-col gap-3">
                    <FileSpreadsheet className="mx-auto text-[var(--color-warm)] mb-1.5" size={22} />
                    <p className="text-[12px] font-semibold text-[var(--color-text-secondary)] leading-tight">Export Summary</p>
                  </div>
                </div>
              </div>

              {/* Account Distribution */}
              <div className="rounded-2xl p-6 bg-(--color-surface) shadow-xs border border-[var(--border)]">
                <h3 className="font-semibold mb-5 text-base leading-none text-(--color-text-primary)">Account Distribution</h3>
                <div className="flex items-center gap-6">
                  <div className="relative flex-shrink-0" style={{ width: "160px", height: "160px" }}>
                    <svg viewBox="0 0 160 160" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                      <circle cx="80" cy="80" r="60" fill="none" stroke={isDark ? "#1f2937" : "#f3f4f6"} strokeWidth="22" />
                      <circle cx="80" cy="80" r="60" fill="none" stroke="#3b82f6" strokeWidth="22"
                        strokeDasharray={`${37.1 * 3.77} ${100 * 3.77}`} strokeDashoffset="0" />
                      <circle cx="80" cy="80" r="60" fill="none" stroke="#7c3aed" strokeWidth="22"
                        strokeDasharray={`${44.4 * 3.77} ${100 * 3.77}`} strokeDashoffset={`-${37.1 * 3.77}`} />
                      <circle cx="80" cy="80" r="60" fill="none" stroke="#22c55e" strokeWidth="22"
                        strokeDasharray={`${12.5 * 3.77} ${100 * 3.77}`} strokeDashoffset={`-${(37.1 + 44.4) * 3.77}`} />
                      <circle cx="80" cy="80" r="60" fill="none" stroke="#9ca3af" strokeWidth="22"
                        strokeDasharray={`${6.0 * 3.77} ${100 * 3.77}`} strokeDashoffset={`-${(37.1 + 44.4 + 12.5) * 3.77}`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-[2rem] leading-none font-semibold" style={{ color: isDark ? "#f5f5f5" : "#16181d" }}>{accounts.length}</p>
                      <p className="text-[0.9rem]" style={{ color: isDark ? "#9ca3af" : "#667085" }}>Accounts</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 text-sm" style={{ color: isDark ? "#d0d5dd" : "#4b5563" }}>
                    {[
                      { color: "#3b82f6", label: "Savings", pct: "37.1%" },
                      { color: "#7c3aed", label: "Investments", pct: "44.4%" },
                      { color: "#22c55e", label: "Cash Wallet", pct: "12.5%" },
                      { color: "#9ca3af", label: "Others", pct: "6.0%" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                          {item.label}
                        </span>
                        <span>{item.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
}
