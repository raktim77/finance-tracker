import React from "react";
import {
  Pencil,
  Trash2,
  PlusCircle,
  ArrowUpRight,
  ChevronRight,
  LayoutGrid,
  List,
  Wallet,
  FileText,
  FileSpreadsheet,
  type LucideIcon,
} from "lucide-react";
import { useContext, useMemo, useState } from "react";
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
type DesktopViewMode = "grid" | "list";

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
  const [desktopViewMode, setDesktopViewMode] = useState<DesktopViewMode>("grid");
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

  const cashTotal = useMemo(() => rawAccounts.filter(a => normalizeAccountGroup(a.account_category_group || a.account_category_name) === "cash").reduce((s, a) => s + a.current_balance, 0), [rawAccounts]);
  const savingsTotal = useMemo(() => rawAccounts.filter(a => normalizeAccountGroup(a.account_category_group || a.account_category_name) === "savings").reduce((s, a) => s + a.current_balance, 0), [rawAccounts]);
  const investTotal = useMemo(() => rawAccounts.filter(a => normalizeAccountGroup(a.account_category_group || a.account_category_name) === "investments").reduce((s, a) => s + a.current_balance, 0), [rawAccounts]);

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

  const desktopFilters: { key: AccountFilter; label: string }[] = [
    { key: "all", label: "All Accounts" },
    { key: "cash", label: "Cash Wallet" },
    { key: "savings", label: "Savings" },
    { key: "investments", label: "Investments" },
    { key: "cards", label: "Cards" },
    { key: "loans", label: "Loans" },
  ];

  const mobileFilters: { key: AccountFilter; label: string }[] = [
    { key: "all", label: "All Accounts" },
    { key: "cash", label: "Cash Wallet" },
    { key: "savings", label: "Savings" },
    { key: "investments", label: "Investments" },
    { key: "cards", label: "Cards" },
    { key: "loans", label: "Loans" },
  ];

  // ─── MOBILE ─────────────────────────────────────────────────────────────────
  const MobileView = () => (
    <div className="flex flex-col gap-0 pb-28 lg:hidden" style={{ background: isDark ? "#0a0a0a" : "#f5f5f5" }}>
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-5 pb-3">
        <div>
          <h1 className="text-[2rem] font-black tracking-[-0.03em]" style={{ color: isDark ? "#ffffff" : "#111318" }}>
            Accounts
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
            <span className="text-[0.72rem] font-bold tracking-[0.18em] uppercase" style={{ color: isDark ? "#6b7280" : "#6b7280" }}>
              {accounts.length} Active Accounts
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowAddAccountModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border font-bold text-sm text-[#22c55e] border-[#22c55e]"
          style={{ background: "transparent" }}
        >
          Add <span className="text-lg leading-none">+</span>
        </button>
      </div>

      {/* Hero Balance Card */}
      <div className="mx-4 rounded-[1.4rem] overflow-hidden" style={{
        background: isDark
          ? "linear-gradient(160deg, #071209 0%, #0a1f0e 40%, #0c2a12 100%)"
          : "#ffffff",
        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
        position: "relative",
      }}>
        {/* Dark mode: dot texture overlay */}
        {isDark && (
          <div style={{
            position: "absolute", inset: 0, opacity: 0.18,
            backgroundImage: "radial-gradient(circle, #22c55e 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            borderRadius: "inherit",
          }} />
        )}
        {/* Dark mode: green radial glow top-right */}
        {isDark && (
          <div style={{
            position: "absolute", top: "-30px", right: "-20px",
            width: "200px", height: "160px",
            background: "radial-gradient(ellipse at center, rgba(34,197,94,0.28) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
        )}

        <div className="relative px-6 pt-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[0.7rem] font-bold tracking-[0.22em] uppercase mb-2"
                style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#6b7280" }}>
                Total Balance
              </p>
              <h2 className="text-[2.1rem] font-bold tracking-[-0.03em] leading-none"
                style={{ color: isDark ? "#ffffff" : "#111318" }}>
                ₹6,20,684.30
              </h2>
              <p className="mt-2 text-[0.85rem]" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#6b7280" }}>
                across all accounts
              </p>
            </div>
            <div className="text-right">
              <p className="text-[2rem] font-bold leading-none text-[#22c55e]">
                {accounts.length}
              </p>
              <p className="text-[0.6rem] font-bold tracking-[0.16em] uppercase mt-1"
                style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#6b7280" }}>
                Accounts
              </p>
            </div>
          </div>
        </div>

        {/* Wave SVG */}
        <div className="relative mt-4" style={{ height: "64px" }}>
          <svg viewBox="0 0 390 64" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <defs>
              <linearGradient id="mobileWaveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDark ? "#22c55e" : "#22c55e"} stopOpacity={isDark ? "0.35" : "0.18"} />
                <stop offset="100%" stopColor={isDark ? "#22c55e" : "#22c55e"} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,32 C40,18 80,42 130,28 C170,16 210,38 260,24 C300,12 340,36 390,20 L390,64 L0,64 Z"
              fill="url(#mobileWaveGrad)"
            />
            <path
              d="M0,32 C40,18 80,42 130,28 C170,16 210,38 260,24 C300,12 340,36 390,20"
              fill="none"
              stroke={isDark ? "#22c55e" : "#22c55e"}
              strokeWidth="2"
              strokeOpacity={isDark ? "0.7" : "0.45"}
            />
          </svg>
        </div>
      </div>

      {/* Summary Strip */}
      {(() => {
        const dividerColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
        type StripItem = { icon: React.FC; label: string; amount: string; color: string };
        const SavingsIcon: React.FC = () => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
        const InvestIcon: React.FC = () => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
        const WalletIcon: React.FC = () => <Wallet size={18} />;
        const items: StripItem[] = [
          { icon: WalletIcon, label: "Cash Wallet", amount: formatCurrency(cashTotal), color: "#22c55e" },
          { icon: SavingsIcon, label: "Savings", amount: formatCurrency(savingsTotal), color: "#3b82f6" },
          { icon: InvestIcon, label: "Investments", amount: formatCurrency(investTotal), color: "#7c3aed" },
        ];
        return (
          <div className="mx-4 mt-3 rounded-[1.1rem] overflow-hidden"
            style={{ background: isDark ? "#141414" : "#ffffff", border: `1px solid ${dividerColor}` }}>
            <div className="flex">
              {items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex-1 flex items-center gap-2.5 px-3.5 py-3.5"
                    style={i > 0 ? { borderLeft: `1px solid ${dividerColor}` } : undefined}
                  >
                    <span style={{ color: item.color }}>
                      <Icon />
                    </span>
                    <div>
                      <p className="text-[0.65rem] font-medium" style={{ color: isDark ? "#6b7280" : "#9ca3af" }}>{item.label}</p>
                      <p className="text-[0.82rem] font-bold tracking-[-0.01em]" style={{ color: isDark ? "#f5f5f5" : "#111318" }}>{item.amount}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Filter Tabs */}
      <div className="mt-4 px-4">
        <div className="flex gap-0 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
          {mobileFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setDesktopFilter(f.key)}
              className="pb-2.5 px-0 mr-5 text-[0.85rem] font-semibold whitespace-nowrap transition-colors"
              style={{
                color: desktopFilter === f.key ? "#22c55e" : isDark ? "#6b7280" : "#9ca3af",
                borderBottom: desktopFilter === f.key ? "2px solid #22c55e" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Account List */}
      <div className="mt-1">
        {accountsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mx-4 mt-2 h-[72px] rounded-xl animate-pulse" style={{ background: isDark ? "#1a1a1a" : "#e5e7eb" }} />
          ))
        ) : filteredAccounts.map((acc) => {
          const Icon = acc.icon;
          return (
            <div
              key={acc._id}
              onClick={() => navigate(`/accounts/transactions/${acc._id}`)}
              className="flex items-center justify-between px-4 py-4 cursor-pointer"
              style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}
            >
              <div className="flex items-center gap-3.5">
                {/* Colored left border accent via colored icon container */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isDark ? `${acc.color}18` : `${acc.color}12`,
                    color: acc.color,
                    borderLeft: `3px solid ${acc.color}`,
                    borderRadius: "10px",
                  }}
                >
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-[0.95rem] font-semibold leading-tight" style={{ color: isDark ? "#f0f0f0" : "#111318" }}>
                    {acc.name}
                  </p>
                  <p className="text-[0.78rem] mt-0.5" style={{ color: isDark ? "#6b7280" : "#9ca3af" }}>
                    {acc.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[0.95rem] font-bold tracking-[-0.01em]" style={{ color: isDark ? "#f0f0f0" : "#111318" }}>
                    {acc.balance}
                  </p>
                  <p className="text-[0.72rem] mt-0.5" style={{ color: isDark ? "#6b7280" : "#9ca3af" }}>
                    Updated · {acc.lastUpdated}
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: isDark ? "#4b5563" : "#d1d5db" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Insights Card */}
      <div className="mx-4 mt-4 rounded-[1.3rem] overflow-hidden px-5 py-5"
        style={{ background: isDark ? "#141414" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-[1.05rem] font-bold" style={{ color: isDark ? "#f0f0f0" : "#111318" }}>Account Insights</h3>
            <svg viewBox="0 0 180 60" className="mt-2 w-full">
              <path d="M5 35 C25 30, 35 38, 55 28 C70 20, 85 32, 100 22 C115 12, 130 28, 145 18 C158 10, 168 22, 175 10"
                fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[1.3rem] font-bold text-[#22c55e] leading-tight">+₹28,740.20</p>
            <p className="text-[0.72rem] text-[#22c55e] mt-0.5">↑ 18.4% vs last month</p>
            <p className="text-[0.72rem] mt-0.5" style={{ color: isDark ? "#6b7280" : "#9ca3af" }}>This month's net flow</p>
          </div>
        </div>
      </div>

      {/* Account Distribution Card */}
      <div className="mx-4 mt-3 rounded-[1.3rem] overflow-hidden px-5 py-5"
        style={{ background: isDark ? "#141414" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)" }}>
        <h3 className="text-[1.05rem] font-bold mb-4" style={{ color: isDark ? "#f0f0f0" : "#111318" }}>Account Distribution</h3>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0" style={{ width: "100px", height: "100px" }}>
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="38" fill="none" stroke={isDark ? "#1f2937" : "#f3f4f6"} strokeWidth="14" />
              {/* Savings 37.1% */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="14"
                strokeDasharray={`${37.1 * 2.388} ${100 * 2.388}`} strokeDashoffset="0" strokeLinecap="butt" />
              {/* Investments 44.4% */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#7c3aed" strokeWidth="14"
                strokeDasharray={`${44.4 * 2.388} ${100 * 2.388}`} strokeDashoffset={`-${37.1 * 2.388}`} strokeLinecap="butt" />
              {/* Cash 12.5% */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" strokeWidth="14"
                strokeDasharray={`${12.5 * 2.388} ${100 * 2.388}`} strokeDashoffset={`-${(37.1 + 44.4) * 2.388}`} strokeLinecap="butt" />
              {/* Others 6% */}
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
  );

  // ─── DESKTOP ─────────────────────────────────────────────────────────────────
  const DesktopView = () => (
    <div className="hidden lg:block w-full">
      <div className="mx-auto w-full max-w-[1580px]">
        {/* Header row */}
        <div className="flex items-start justify-between gap-6 mb-7">
          <div>
            <h2 className="text-[2rem] leading-[1.1] font-bold tracking-[-0.03em] text-[var(--color-text-primary)]"
              >
              Accounts
            </h2>
            {/* <div className="mt-3 flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
              <p className="text-[0.95rem] font-semibold text-(--color-text-secondary)"
                >
                {accounts.length} Active Accounts
              </p>
            </div> */}
          </div>
          <button
            onClick={() => setShowAddAccountModal(true)}
            className="flex items-center gap-2.5 h-12 rounded-[1.1rem] border border-[#22c55e]/70 px-6 text-[1rem] font-semibold text-[#22c55e] hover:bg-[#22c55e]/6 transition"
          >
            <PlusCircle size={20} />
            Add New Account
          </button>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-8">
          {/* LEFT COLUMN */}
          <div>
            {/* Hero Card */}
            <div
              className="mb-7 overflow-hidden rounded-[2rem] border shadow-sm"
              style={{
                position: "relative",
                border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.05)",
                background: isDark
                  ? "linear-gradient(155deg, #060e08 0%, #071209 35%, #0b1e0e 65%, #0d2812 100%)"
                  : "#ffffff",
                minHeight: "180px",
              }}
            >
              {/* Dark: dot texture */}
              {isDark && (
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  backgroundImage: "radial-gradient(circle, rgba(34,197,94,0.22) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                  opacity: 0.6,
                }} />
              )}
              {/* Dark: green radial glow top-right */}
              {isDark && (
                <div style={{
                  position: "absolute", top: "-40px", right: "-40px",
                  width: "340px", height: "260px",
                  background: "radial-gradient(ellipse at center, rgba(34,197,94,0.32) 0%, transparent 65%)",
                  pointerEvents: "none",
                }} />
              )}
              {/* Light: subtle green radial bottom */}
              {!isDark && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "80px",
                  background: "radial-gradient(120% 100% at 50% 100%, rgba(34,197,94,0.08) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />
              )}

              <div className="relative px-10 pt-10 pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[0.8rem] uppercase tracking-[0.26em] font-semibold mb-4"
                      style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(35,38,45,0.7)" }}>
                      Total Balance
                    </p>
                    <h2 className="text-[3.55rem] leading-none font-semibold tracking-[-0.03em]"
                      style={{ color: isDark ? "#ffffff" : "#111318" }}>
                      {formatCurrency(totalBalance)}
                    </h2>
                    <p className="mt-5 text-[1rem]" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#4f5562" }}>
                      across all accounts
                    </p>
                  </div>
                  <div className="flex items-center gap-5 pr-2">
                    <div className="text-right">
                      <p className="text-[0.8rem] uppercase tracking-[0.22em] font-semibold mb-4"
                        style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(35,38,45,0.7)" }}>
                        Accounts
                      </p>
                      <p className="text-[3rem] leading-none font-semibold"
                        style={{ color: isDark ? "#ffffff" : "#16a34a" }}>
                        {accounts.length}
                      </p>
                    </div>
                    <span className={`flex h-16 w-16 items-center justify-center rounded-full ${isDark ? "bg-white/10" : "bg-[#eaf8ef]"}`}>
                      <ArrowUpRight size={28} className={isDark ? "text-white" : "text-[#16a34a]"} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Wave at bottom */}
              <div style={{ height: "72px", marginTop: "16px", position: "relative" }}>
                <svg viewBox="0 0 900 72" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
                  <defs>
                    <linearGradient id="deskWaveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={isDark ? "0.28" : "0.12"} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,42 C80,28 160,52 250,36 C330,22 420,46 510,30 C590,16 680,44 770,28 C830,18 870,38 900,24 L900,72 L0,72 Z"
                    fill="url(#deskWaveGrad)"
                  />
                  <path
                    d="M0,42 C80,28 160,52 250,36 C330,22 420,46 510,30 C590,16 680,44 770,28 C830,18 870,38 900,24"
                    fill="none"
                    stroke={isDark ? "#22c55e" : "#22c55e"}
                    strokeWidth="2.5"
                    strokeOpacity={isDark ? "0.65" : "0.35"}
                  />
                </svg>
              </div>
            </div>

            {/* Filter + View Toggle Bar */}
            <div
              className="mb-5 rounded-[1.5rem] border p-4"
              style={{
                background: isDark ? "#0d1117" : "#ffffff",
                border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {desktopFilters.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setDesktopFilter(item.key)}
                      className="rounded-[1rem] px-5 py-3 text-[1rem] font-medium transition"
                      style={
                        desktopFilter === item.key
                          ? isDark
                            ? { background: "#112b1a", color: "#2ee66d", boxShadow: "0 0 0 1px rgba(46,230,109,0.3)" }
                            : { background: "#effaf2", color: "#16a34a", boxShadow: "0 0 0 1px #d9f3df" }
                          : isDark
                            ? { background: "transparent", color: "#b7bcc6", border: "1px solid rgba(255,255,255,0.1)" }
                            : { background: "#ffffff", color: "#5f6775", border: "1px solid rgba(0,0,0,0.05)" }
                      }
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div
                  className="flex items-center overflow-hidden rounded-[1rem]"
                  style={{ border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.05)" }}
                >
                  <button
                    onClick={() => setDesktopViewMode("grid")}
                    className="flex h-12 w-14 items-center justify-center"
                    style={
                      desktopViewMode === "grid"
                        ? { background: isDark ? "#102416" : "#effaf2", color: isDark ? "#2ee66d" : "#16a34a" }
                        : { background: "transparent", color: isDark ? "#c6c9ce" : "#667085" }
                    }
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button
                    onClick={() => setDesktopViewMode("list")}
                    className="flex h-12 w-14 items-center justify-center"
                    style={
                      desktopViewMode === "list"
                        ? { background: isDark ? "#102416" : "#effaf2", color: isDark ? "#2ee66d" : "#16a34a" }
                        : { background: "transparent", color: isDark ? "#c6c9ce" : "#667085" }
                    }
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Account Rows */}
            <div className="space-y-3">
              {accountsLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-[72px] rounded-[1.6rem] border animate-pulse"
                    style={{ background: isDark ? "#0d1117" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.04)" }} />
                ))
              ) : filteredAccounts.length === 0 ? (
                <div className="rounded-[1.75rem] border p-10 text-base"
                  style={{ background: isDark ? "#0d1117" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.04)", color: isDark ? "#8a8f98" : "#68707d" }}>
                  No accounts found in this category.
                </div>
              ) : (
                filteredAccounts.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <div
                      key={acc._id}
                      onClick={() => navigate(`/accounts/transactions/${acc._id}`)}
                      className="cursor-pointer rounded-[1.6rem] px-7 py-5 shadow-sm transition grid items-center gap-5"
                      style={{
                        background: isDark ? "#0d1117" : "#ffffff",
                        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.04)",
                        gridTemplateColumns: "52px minmax(0,1.4fr) 220px 160px 120px",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.border = isDark ? "1px solid rgba(46,230,109,0.22)" : "1px solid rgba(22,163,74,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.border = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.04)";
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-[1rem]"
                        style={{ background: `${acc.color}1f`, color: acc.color }}
                      >
                        <Icon size={22} strokeWidth={2.1} />
                      </div>

                      {/* Name + Type */}
                      <div className="min-w-0">
                        <h3 className="truncate text-[1.1rem] leading-none font-semibold"
                          style={{ color: isDark ? "#f4f5f7" : "#16181d" }}>
                          {acc.name}
                        </h3>
                        <p className="mt-1.5 text-[0.9rem] leading-none"
                          style={{ color: isDark ? "#8c939e" : "#8a93a1" }}>
                          {acc.type}
                        </p>
                      </div>

                      {/* Balance */}
                      <div className="text-[1.1rem] font-semibold tracking-[-0.02em]"
                        style={{ color: isDark ? "#f5f5f5" : "#171a20" }}>
                        {acc.balance}
                      </div>

                      {/* Updated */}
                      <div>
                        <p className="text-[0.85rem]" style={{ color: isDark ? "#767c86" : "#8a93a1" }}>Updated</p>
                        <p className="mt-1 text-[0.9rem]" style={{ color: isDark ? "#a0a5af" : "#67707c" }}>{acc.lastUpdated}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setEditingAccountId(acc._id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-black/5 dark:hover:bg-white/6"
                          style={{ color: isDark ? "#a6acb6" : "#6b7280" }}
                          aria-label={`Edit ${acc.name}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => void handleArchiveAccount(acc)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#ef4444] hover:bg-[#ef4444]/10 transition"
                          aria-label={`Delete ${acc.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="flex h-9 w-9 items-center justify-center rounded-xl transition"
                          style={{ color: isDark ? "#a6acb6" : "#6b7280" }}
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
          <div className="space-y-5">
            {/* Account Insights */}
            <div
              className="rounded-[1.9rem] p-7 shadow-sm"
              style={{
                background: isDark ? "#0d1117" : "#ffffff",
                border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <h3 className="text-[2rem] leading-none font-semibold" style={{ color: isDark ? "#f5f5f5" : "#16181d" }}>
                Account Insights
              </h3>
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
                {/* endpoint dot */}
                <circle cx="350" cy="14" r="4" fill="#22c55e" />
              </svg>
              <p className="mt-5 text-[1rem]" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>This month's net flow</p>
              <p className="mt-2 text-[2.5rem] leading-none text-[#22c55e] font-semibold">+₹28,740.20</p>
              <p className="mt-2 text-[1rem]" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                <span className="text-[#22c55e] font-semibold">↑ 18.4%</span> vs last month
              </p>
            </div>

            {/* Quick Actions */}
            <div
              className="rounded-[1.9rem] p-7 shadow-sm"
              style={{
                background: isDark ? "#0d1117" : "#ffffff",
                border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <h3 className="text-[2rem] leading-none font-semibold mb-7" style={{ color: isDark ? "#f5f5f5" : "#16181d" }}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { icon: Wallet, label: "Add Account", bg: isDark ? "#10301d" : "#effaf2", color: isDark ? "#2ee66d" : "#16a34a" },
                  { icon: ArrowUpRight, label: "Transfer Money", bg: isDark ? "rgba(255,255,255,0.06)" : "#f4f7fb", color: isDark ? "#7aa2ff" : "#3b82f6" },
                  { icon: FileText, label: "Account Statement", bg: isDark ? "rgba(255,255,255,0.06)" : "#f7f2ff", color: isDark ? "#8b5cf6" : "#7c3aed" },
                  { icon: FileSpreadsheet, label: "Export Summary", bg: isDark ? "rgba(255,255,255,0.06)" : "#fff6eb", color: "#f59e0b" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{ background: item.bg, color: item.color }}>
                      <item.icon size={22} />
                    </div>
                    <p className="mt-3 text-[0.9rem] leading-snug"
                      style={{ color: isDark ? "#c5cad3" : "#667085" }}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Distribution */}
            <div
              className="rounded-[1.9rem] p-7 shadow-sm"
              style={{
                background: isDark ? "#0d1117" : "#ffffff",
                border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <h3 className="text-[2rem] leading-none font-semibold mb-7" style={{ color: isDark ? "#f5f5f5" : "#16181d" }}>
                Account Distribution
              </h3>
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0" style={{ width: "160px", height: "160px" }}>
                  <svg viewBox="0 0 160 160" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                    <circle cx="80" cy="80" r="60" fill="none" stroke={isDark ? "#1f2937" : "#f3f4f6"} strokeWidth="22" />
                    {/* Savings 37.1% */}
                    <circle cx="80" cy="80" r="60" fill="none" stroke="#3b82f6" strokeWidth="22"
                      strokeDasharray={`${37.1 * 3.77} ${100 * 3.77}`} strokeDashoffset="0" />
                    {/* Investments 44.4% */}
                    <circle cx="80" cy="80" r="60" fill="none" stroke="#7c3aed" strokeWidth="22"
                      strokeDasharray={`${44.4 * 3.77} ${100 * 3.77}`} strokeDashoffset={`-${37.1 * 3.77}`} />
                    {/* Cash 12.5% */}
                    <circle cx="80" cy="80" r="60" fill="none" stroke="#22c55e" strokeWidth="22"
                      strokeDasharray={`${12.5 * 3.77} ${100 * 3.77}`} strokeDashoffset={`-${(37.1 + 44.4) * 3.77}`} />
                    {/* Others 6% */}
                    <circle cx="80" cy="80" r="60" fill="none" stroke="#9ca3af" strokeWidth="22"
                      strokeDasharray={`${6.0 * 3.77} ${100 * 3.77}`} strokeDashoffset={`-${(37.1 + 44.4 + 12.5) * 3.77}`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-[2rem] leading-none font-semibold" style={{ color: isDark ? "#f5f5f5" : "#16181d" }}>{accounts.length}</p>
                    <p className="text-[0.9rem]" style={{ color: isDark ? "#9ca3af" : "#667085" }}>Accounts</p>
                  </div>
                </div>
                <div className="flex-1 space-y-3 text-[0.95rem]" style={{ color: isDark ? "#d0d5dd" : "#4b5563" }}>
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
  );

  return (
    <>
      <MobileView />
      <DesktopView />

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