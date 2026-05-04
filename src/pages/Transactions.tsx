import { useCreateTransaction, useDeleteTransaction, useTransactions, useUpdateTransaction } from "../features/transactions/hooks/useTransactions";
import type { Transaction as ApiTransaction, Transaction } from "../features/transactions/types/transaction.types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  PlusCircle,
  Calendar,
  Wallet,
  CircleAlert,
  ChartColumn,
  ChevronRight,
  ChevronLeft,
  FileDown,
  ArrowRight,
} from "lucide-react";
import Dropdown from "../components/ui/Dropdown";
import DatePicker from "../components/ui/DatePicker";
import TransactionSheet, { type TransactionDraft } from "../components/transactions/TransactionSheet";
import { useAuth } from "../lib/context/useAuth";
import { useAccounts } from "../features/accounts/hooks/useAccounts";
import { useCategories } from "../features/categories/hooks/useCategories";
import TransactionDetails from "../components/transactions/TransactionDetails";
import { useToast } from "../components/ui/confirm-modal/useToast";
import { useConfirm } from "../components/ui/confirm-modal/useConfirm";
import { useNavigate, useParams } from "react-router-dom";
import TransactionListItem from "../components/transactions/TransactionListItem";
import {
  formatTransactionDisplayDate,
  getTransactionCategoryLabel,
  getTransactionDisplayAmount,
  getTransactionTitle,
} from "../features/transactions/utils/transactionDisplay";
import { useHeaderConfig } from "../hooks/useHeaderConfig";
import resolveLucideIcon from "../utils/LucideIconsResolver";
import useInfiniteScroll from "react-infinite-scroll-hook";

type FilterType = "all" | "income" | "expense" | "transfer";
type SortType = "latest" | "highest" | "lowest";
type DateRangeType = "30" | "60" | "90" | "custom";

function formatApiDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPresetDateRange(range: Exclude<DateRangeType, "custom">) {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (Number(range) - 1));
  return { startDate, endDate };
}

function typeBadgeClass(type: Transaction["type"]) {
  if (type === "income") return "bg-[var(--color-success)]/10 text-[var(--color-success)]";
  if (type === "expense") return "bg-[var(--color-danger)]/10 text-[var(--color-danger)]";
  return "bg-[#0d9488]/15 text-[#0d9488]";
}

export default function Transactions() {
  const { account_id } = useParams<{ account_id?: string }>();
  const navigate = useNavigate();
  const { accessToken, loading } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("latest");
  const [dateRange, setDateRange] = useState<DateRangeType>("30");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionDraft | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const confirm = useConfirm();
  const toast = useToast();
  const itemsPerPage = 20;

  const [startDate, setStartDate] = useState<Date | undefined>(
    getPresetDateRange("30").startDate
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    getPresetDateRange("30").endDate
  );

  const { data: categoriesData } = useCategories();
  const { data: accountsData } = useAccounts();

  const categories = categoriesData?.categories ?? [];
  const accounts = accountsData?.accounts ?? [];
  const hasAccounts = accounts.length > 0;
  const isScopedToAccount = !!account_id;
  const scopedAccount = accounts.find((account) => account._id === account_id);
  const displayTitle = isScopedToAccount ? scopedAccount?.name || "History" : "History";

  const mappedAccounts = accounts.map((acc) => ({
    _id: acc._id,
    name: acc.name,
    type: acc.account_category_group || "account",
    balance: acc.current_balance,
    icon: acc.account_category_icon || "help",
    iconColor: acc.account_category_color || "#ddd",
  }));

  const defaultTransactionDraft: Partial<TransactionDraft> | null =
    isScopedToAccount && scopedAccount ? { account_id: scopedAccount._id } : null;

  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  useEffect(() => {
    if (dateRange === "custom") return;
    const { startDate: nextStartDate, endDate: nextEndDate } = getPresetDateRange(dateRange);
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
  }, [dateRange]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => { window.clearTimeout(timeoutId); };
  }, [search]);

  function mapToDraft(tx: ApiTransaction): TransactionDraft {
    return {
      amount: tx.amount,
      type: tx.type,
      account_id: tx.account_id?._id || null,
      to_account_id: tx.to_account_id?._id || null,
      category_id: tx.category_id || null,
      note: tx.note || "",
      date: new Date(tx.date),
    };
  }

  const handleSubmitTransaction = async (payload: {
    amount: number;
    type: "expense" | "income" | "transfer";
    account_id: string;
    to_account_id?: string;
    category_id?: string;
    note?: string;
    date: Date;
  }) => {
    try {
      if (editingTx && editingId) {
        await updateTransactionMutation.mutateAsync({ id: editingId, payload });
      } else {
        await createTransactionMutation.mutateAsync(payload);
        toast.success("Transaction recorded successfully");
      }
      setSheetOpen(false);
      setEditingTx(null);
      setSelectedTx(null);
      setEditingId(null);
    } catch (err) {
      console.error("Transaction failed", err);
    }
  };

  const formattedStartDate = startDate ? formatApiDate(startDate) : undefined;
  const formattedEndDate = endDate ? formatApiDate(endDate) : undefined;
  const canFetchTransactions = !loading && !!accessToken && !!formattedStartDate && !!formattedEndDate;

  const mobileCriteriaKey = [
    debouncedSearch || "",
    filter,
    sort,
    formattedStartDate || "",
    formattedEndDate || "",
    account_id || "",
  ].join("|");
  const previousMobileCriteriaRef = useRef(mobileCriteriaKey);
  const mobileCriteriaChanged = previousMobileCriteriaRef.current !== mobileCriteriaKey;
  const pageForQuery = mobileCriteriaChanged ? 1 : currentPage;

  const queryParams = {
    page: pageForQuery,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    type: filter === "all" ? undefined : filter,
    account_id,
    sort,
    startDate: formattedStartDate,
    endDate: formattedEndDate,
  };

  const { data, isLoading, isError, error } = useTransactions(queryParams, {
    accessToken,
    enabled: canFetchTransactions,
  });

  const currentItems = data?.transactions ?? [];
  const totalPages = Math.max(data?.pages ?? 1, 1);
  const totalRecords = data?.total ?? 0;


  const handleOpenTransactionSheet = useCallback(() => {
    if (!hasAccounts) {
      toast.error("Please add an account first");
      navigate("/accounts");
      return;
    }
    setSheetOpen(true);
  }, [hasAccounts, navigate, toast]);

  useHeaderConfig({
    heroColor: null,
    heroHeight: 92,
    showLogo: true,
    scrollTitle: displayTitle,
    scrollAction: "+",
    onAction: handleOpenTransactionSheet,
  });

  const desktopSpendingByType = [
    { label: "Investment", value: "₹2,145 (44%)", width: 44, color: "#8b5cf6" },
    { label: "Bills & Utilities", value: "₹1,020 (21%)", width: 21, color: "#f97316" },
    { label: "Food & Dining", value: "₹730 (15%)", width: 15, color: "#22c55e" },
    { label: "Transfer", value: "₹480 (10%)", width: 10, color: "#06b6d4" },
    { label: "Others", value: "₹478 (10%)", width: 10, color: "#64748b" },
  ];

  const activeDateLabel = useMemo(() => {
    if (!startDate || !endDate) return "";
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    return `${fmt(startDate)} – ${fmt(endDate)}`;
  }, [startDate, endDate]);

  // Build pagination pages array
  const getPaginationPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const isCustomRange = dateRange === "custom";

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const mobileItems = allTransactions.length ? allTransactions : (data?.transactions ?? []);

  useEffect(() => {
    if (!mobileCriteriaChanged) return;
    setAllTransactions([]);
    setCurrentPage(1);
    setHasMore(true);
    setLoadingMore(false);
    previousMobileCriteriaRef.current = mobileCriteriaKey;
  }, [mobileCriteriaChanged, mobileCriteriaKey]);

  useEffect(() => {
    if (!data) return;

    if (pageForQuery === 1) {
      setAllTransactions(data.transactions ?? []);
    } else {
      setAllTransactions((prev) => [...prev, ...(data.transactions ?? [])]);
    }

    setHasMore(pageForQuery < (data.pages ?? 1));
    setLoadingMore(false);
  }, [data, pageForQuery]);

  const [sentryRef] = useInfiniteScroll({
    loading: loadingMore || isLoading,
    hasNextPage: hasMore,
    onLoadMore: () => {
      setLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    },
    disabled: isError,
    rootMargin: "0px 0px 200px 0px",
  });
  // Group by "Month Year" — same logic for both mobile and desktop
  const groupedTransactions = mobileItems.reduce((acc, tx) => {
    const date = new Date(tx.date);
    const key = date.toLocaleString("default", { month: "short", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {} as Record<string, typeof mobileItems>);

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="p-2 flex flex-col gap-6 pb-24 w-full mx-auto box-border overflow-x-hidden md:hidden">
        <div className="flex w-full items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-[1.5rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">{isScopedToAccount ? displayTitle : "History"}</h2>
            <p className="mt-2 text-[0.8rem] font-semibold text-(--color-text-secondary)">
              {totalRecords} records found
            </p>
          </div>
          <button
            onClick={handleOpenTransactionSheet}
            className="text-[var(--color-primary)] flex shrink-0 group items-center justify-center gap-2 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold"
          // inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors
          // text-[var(--color-primary)] hover:bg-[var(--color-accent-soft)]
          // border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)]
          >
            <PlusCircle size={16} className="group-hover:rotate-90 transition-transform" />
            {hasAccounts ? "Record" : "Add"}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            <div className="relative w-[60%] group">
              <Search size={14} className="absolute text-[var(--color-text-secondary)] left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions"
                className="w-full pl-9 pr-8 h-11 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border)] text-sm"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="w-[40%]">
              <Dropdown
                icon={Calendar}
                value={dateRange}
                onChange={(v) => setDateRange(v as DateRangeType)}
                options={[
                  { label: "30 Days", value: "30" },
                  { label: "60 Days", value: "60" },
                  { label: "90 Days", value: "90" },
                  { label: "Custom", value: "custom" },
                ]}
              />
            </div>
          </div>

          {isCustomRange && (
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1">
              <div className="min-w-0 h-11 rounded-xl border border-[var(--input-border)] px-3 flex items-center gap-2 bg-[var(--color-surface)] text-sm">
                <DatePicker value={startDate} onChange={(d) => setStartDate(d)} />
              </div>
              <ArrowRight
                size={12}
                strokeWidth={2.25}
                className="shrink-0 text-[var(--color-text-secondary)] opacity-55"
              />
              <div className="min-w-0 h-11 rounded-xl border border-[var(--input-border)] px-3 flex items-center gap-2 bg-[var(--color-surface)] text-sm">
                <DatePicker value={endDate} onChange={(d) => setEndDate(d)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Dropdown
              icon={Filter}
              value={filter}
              onChange={(v) => setFilter(v as FilterType)}
              options={[
                { label: "All Types", value: "all" },
                { label: "Income", value: "income" },
                { label: "Expense", value: "expense" },
                { label: "Transfer", value: "transfer" },
              ]}
            />
            <Dropdown
              icon={ArrowUpDown}
              value={sort}
              onChange={(v) => setSort(v as SortType)}
              options={[
                { label: "Latest", value: "latest" },
                { label: "Highest", value: "highest" },
                { label: "Lowest", value: "lowest" },
              ]}
            />
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="flex flex-col gap-2">
            {isLoading && mobileItems.length === 0 ? (
              <div className="py-20 text-center text-sm font-bold text-[var(--color-text-secondary)]">Loading...</div>
            ) : isError ? (
              <div className="py-20 text-center text-sm font-bold text-[var(--color-danger)]">
                {error instanceof Error ? error.message : "Failed to load transactions"}
              </div>
            ) : mobileItems.length === 0 ? (
              <div className="py-20 text-center text-sm font-bold text-[var(--color-text-secondary)]">No transactions</div>
            ) : (
              <>
                {Object.entries(groupedTransactions).map(([month, items], groupIndex, arr) => {
                  const isLastGroup = groupIndex === arr.length - 1;

                  return (
                    <div key={month} className="flex flex-col pl-1">
                      <div className="mb-2 pt-3 pb-1 text-sm font-bold tracking-widest text-[var(--color-text-secondary)] uppercase opacity-80">
                        {month}
                      </div>
                      {items.map((t, index) => (
                        <TransactionListItem
                          key={t._id}
                          transaction={t}
                          title={getTransactionTitle(t)}
                          categoryLabel={getTransactionCategoryLabel(t)}
                          displayDate={formatTransactionDisplayDate(t.date)}
                          showDivider={index !== items.length - 1}
                          onClick={() => {
                            setSelectedTx(t);
                            setDetailsOpen(true);
                          }}
                        />
                      ))}
                      {!isLastGroup && (
                        <div className="md:hidden relative my-3">
                          <div className="absolute -bottom-3 left-0 right-0 h-px bg-[var(--border)]" />
                        </div>
                      )}
                    </div>
                  );
                })}

                <div ref={sentryRef} />

                {loadingMore && (
                  <div className="flex justify-center">
                    <svg
                      className="animate-spin"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-text-secondary)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                )}

                {!hasMore && mobileItems.length > 0 && (
                  <div className="py-6 text-center text-xs text-[var(--color-text-secondary)]">
                    No more transactions
                  </div>
                )}
              </>

            )}
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:flex md:flex-col gap-5 pb-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-[2.1rem] leading-[1.1] font-bold text-[var(--color-text-primary)]">{isScopedToAccount ? displayTitle : "Transactions"}</h2>
            <p className="mt-2 text-[1rem] font-semibold text-(--color-text-secondary)">{totalRecords} transactions found</p>
          </div>
          <button
            onClick={handleOpenTransactionSheet}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors
            text-[var(--color-primary)] hover:bg-[var(--color-accent-soft)]
            border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)]
            "
          >
            <PlusCircle size={16} />
            {hasAccounts ? "Record transaction" : "Add Account"}
          </button>
        </div>

        {/* Filter Bar */}
        <div className="rounded-2xl border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)]/80 px-3 py-4">
          <div className="flex items-end gap-3 flex-wrap">

            {/* Date range preset — always visible */}
            <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
              <Dropdown
                icon={Calendar}
                value={dateRange}
                onChange={(v) => setDateRange(v as DateRangeType)}
                options={[
                  { label: "Last 30 days", value: "30" },
                  { label: "Last 60 days", value: "60" },
                  { label: "Last 90 days", value: "90" },
                  { label: "Custom range", value: "custom" },
                ]}
              />
            </div>

            {/* From date — only when custom */}
            {isCustomRange && (
              <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                <div className="h-10 rounded-lg border border-[var(--input-border)] px-3 flex items-center gap-2 bg-[var(--color-surface)] text-sm">
                  {/* <Calendar size={14} className="text-[var(--color-text-secondary)] shrink-0" /> */}
                  <DatePicker value={startDate} onChange={(d) => setStartDate(d)} />
                  {/* {startDate && (
                    <button type="button" onClick={() => setStartDate(undefined)} className="ml-auto">
                      <X size={13} className="text-[var(--color-text-secondary)]" />
                    </button>
                  )} */}
                </div>
              </div>
            )}

            {/* To date — only when custom */}
            {isCustomRange && (
              <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                <div className="h-10 rounded-lg border border-[var(--input-border)] px-3 flex items-center gap-2 bg-[var(--color-surface)] text-sm">
                  {/* <Calendar size={14} className="text-[var(--color-text-secondary)] shrink-0" /> */}
                  <DatePicker value={endDate} onChange={(d) => setEndDate(d)} />
                  {/* {endDate && (
                    <button type="button" onClick={() => setEndDate(undefined)} className="ml-auto">
                      <X size={13} className="text-[var(--color-text-secondary)]" />
                    </button>
                  )} */}
                </div>
              </div>
            )}

            {/* Type filter */}
            <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
              <Dropdown
                icon={Filter}
                value={filter}
                onChange={(v) => setFilter(v as FilterType)}
                options={[
                  { label: "All Types", value: "all" },
                  { label: "Income", value: "income" },
                  { label: "Expense", value: "expense" },
                  { label: "Transfer", value: "transfer" },
                ]}
              />
            </div>

            {/* Accounts filter */}
            <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
              <Dropdown
                icon={Wallet}
                value="all_accounts"
                onChange={() => undefined}
                options={[{ label: "All Accounts", value: "all_accounts" }]}
              />
            </div>

            {/* Sort */}
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <Dropdown
                icon={ArrowUpDown}
                value={sort}
                onChange={(v) => setSort(v as SortType)}
                options={[
                  { label: "Latest", value: "latest" },
                  { label: "Highest", value: "highest" },
                  { label: "Lowest", value: "lowest" },
                ]}
              />
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1 flex-[2] min-w-[180px]">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search transactions"
                  className="h-11 w-full rounded-lg border border-[var(--input-border)] bg-[var(--color-surface)] pl-9 pr-9 text-sm"
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={14} className="text-[var(--color-text-secondary)]" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-12 gap-4">

          {/* Transaction List */}
          <div className="col-span-9 rounded-2xl border border-[var(--border)] bg-[var(--color-surface)]/60 overflow-hidden shadow-xs">

            {/* Table header */}
            {/* <div className="grid items-center px-4 py-3 border-b border-[var(--border)] bg-[var(--color-surface)]/40"
              style={{ gridTemplateColumns: "90px 1fr 140px 150px 130px" }}>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-text-secondary)]">Date</span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-text-secondary)]">Transaction</span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-text-secondary)]">Type</span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-text-secondary)]">Date</span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-text-secondary)] text-right">Amount</span>
            </div> */}

            {isLoading ? (
              <div className="py-20 text-center text-sm text-[var(--color-text-secondary)]">Loading transactions...</div>
            ) : isError ? (
              <div className="py-20 text-center text-sm font-semibold text-[var(--color-danger)]">
                {error instanceof Error ? error.message : "Failed to load transactions"}
              </div>
            ) : currentItems.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-base font-semibold text-[var(--color-text-primary)]">No Transactions Yet</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Start recording transactions to build your history.</p>
              </div>
            ) : (
              <>
                {/* Month-grouped timeline */}
                <div className="relative">
                  {Object.entries(groupedTransactions).map(([month, items]) => (
                    <div className="p-2" key={month}>


                      {/* Rows for this month */}
                      {items.map((t, idx) => {
                        const Icon =
                          t.type === "income" || t.type === "expense"
                            ? resolveLucideIcon(t.category_icon)
                            : resolveLucideIcon("arrow-left-right");

                        const amount = getTransactionDisplayAmount(t);
                        const isSignedType =
                          t.type === "expense" || t.type === "income";

                        // const dateObj = new Date(t.date);
                        const amountColor =
                          t.type === "expense"
                            ? "text-[var(--color-danger)]"
                            : t.type === "income"
                              ? "text-[var(--color-success)]"
                              : "text-[var(--color-text-primary)]";

                        // Show date label only when date differs from previous row within this month
                        // const prevTx = items[idx - 1];
                        // const prevDay = prevTx ? new Date(prevTx.date).getDate() : null;
                        // const showDateLabel = prevDay !== dateObj.getDate();
                        // console.log(showDateLabel);

                        const dotColor = t.category_color ?? "#0d9488";
                        const showMonthLabel = idx === 0;
                        // Hide the vertical line after the very last row of the last group
                        // const isLastItem = groupIdx === groupsArr.length - 1 && idx === items.length - 1;
                        // console.log(isLastItem);

                        return (
                          <button
                            key={t._id}
                            type="button"
                            onClick={() => {
                              setSelectedTx(t);
                              setDetailsOpen(true);
                            }}
                            className="group w-full flex items-center hover:bg-[var(--color-background)]/40 transition-colors border-b border-[var(--border)]/50 last:border-b-0"
                          >
                            {/* Date column with timeline */}
                            <div className="relative flex items-center shrink-0" style={{ width: "72px", minHeight: "92px" }}>
                              {/* Vertical line */}
                              <div className="absolute left-[67px] top-0 bottom-0 w-px bg-[var(--border)]" />
                              {/* {!isLastItem && (
                              )} */}
                              {/* Date label */}
                              <div className="pl-4 pr-2 text-left w-[80px]">
                                {showMonthLabel ? (
                                  <div className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                                    {month}
                                  </div>
                                ) : null}
                              </div>
                              {/* Dot */}
                              <div
                                className="relative z-10 shrink-0 rounded-full"
                                style={{ width: 8, height: 8, backgroundColor: dotColor }}
                              />
                            </div>

                            {/* Row content */}
                            <div
                              className="flex items-center flex-1 gap-4 px-4 py-6"
                              style={{ display: "grid", gridTemplateColumns: "1fr 140px 150px 130px" }}
                            >
                              {/* Transaction title + icon */}
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                                  style={
                                    t.type === "income" || t.type === "expense"
                                      ? {
                                        backgroundColor: `${t.category_color}15`,
                                        color: t.category_color,
                                      }
                                      : {
                                        backgroundColor: "#0d948815",
                                        color: "#0d9488",
                                      }
                                  }
                                >
                                  <Icon size={22} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-[15px] font-bold text-[var(--color-text-primary)] text-left">{getTransactionTitle(t)}</p>
                                  <p className="truncate text-[13px] font-semibold text-[var(--color-text-secondary)] mt-1 text-left">{getTransactionCategoryLabel(t)}</p>
                                </div>
                              </div>

                              {/* Type badge */}
                              <div>
                                <span className={`inline-flex rounded-full px-3 py-0.5 text-[13px] font-medium ${typeBadgeClass(t.type)}`}>
                                  {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                                </span>
                              </div>

                              {/* Date */}
                              <div className="text-[13px] text-[var(--color-text-secondary)]">
                                {formatTransactionDisplayDate(t.date)}
                              </div>

                              {/* Amount */}
                              <div className={`text-right text-base font-bold ${amountColor}`}>
                                {isSignedType
                                  ? amount < 0
                                    ? "-"
                                    : amount > 0
                                      ? "+"
                                      : ""
                                  : ""}
                                ₹{Math.abs(amount).toLocaleString()}
                              </div>
                            </div>
                            <ChevronRight
                              size={16}
                              strokeWidth={2.5}
                              className="
                              ml-2 shrink-0
                              text-[var(--color-text-secondary)]
                              opacity-0 translate-x-[-6px]
                              transition-all duration-200
                              group-hover:opacity-100 group-hover:translate-x-0
                            "
                            />
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center border-t border-[var(--border)] px-4 py-3 gap-12">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="flex items-center gap-1 rounded-lg border border border-[var(--color-accent)]/20 px-3 py-2 text-sm text-[var(--color-primary)] disabled:text-[var(--color-text-secondary)] disabled:opacity-40 hover:bg-[var(--color-accent-soft)]/80"
                    >
                      <ChevronLeft
                        size={16}
                        strokeWidth={2.5}
                        className="
                              shrink-0
                            "
                      /> Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {getPaginationPages().map((page, i) =>
                        page === "..." ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-sm text-[var(--color-text-secondary)]">...</span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`h-10 w-10 rounded-lg text-sm font-medium  ${currentPage === page
                              ? "bg-[var(--color-accent-soft)] text-(--color-primary) border border-[var(--color-accent-soft)]"
                              : "text-[var(--color-text-primary)] hover:bg-[var(--color-accent-soft)]/80 "
                              }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="flex items-center gap-1 rounded-lg border border border-[var(--color-accent)]/20 px-3 py-2 text-sm text-[var(--color-primary)] disabled:text-[var(--color-text-secondary)] disabled:opacity-40 hover:bg-[var(--color-accent-soft)]/80"
                    >
                      Next
                      <ChevronRight
                        size={16}
                        strokeWidth={2.5}
                        className="
                              shrink-0
                            "
                      />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3 flex flex-col gap-4">

            {/* Summary */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--color-surface)]/60 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Summary</h3>
                <div className="rounded-lg border border-[var(--border)] p-1.5">
                  <ChartColumn size={15} className="text-[var(--color-text-secondary)]" />
                </div>
              </div>
              <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">{activeDateLabel}</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--color-text-secondary)]">Total Spent</span>
                  <span className="text-sm font-semibold text-(--color-danger)">₹4,853</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--color-text-secondary)]">Total Received</span>
                  <span className="text-sm font-semibold text-(--color-success)">₹33,900</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--color-text-secondary)]">Net Flow</span>
                  <span className="text-sm font-semibold text-(--color-success)">₹29,047</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--color-surface)]/60 p-6 shadow-xs">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-5">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-[var(--border)] p-3 text-center cursor-pointer hover:bg-[var(--color-background)]/40 transition-colors flex flex-col gap-2">
                  <FileDown className="mx-auto text-[var(--color-success)] mb-1.5" size={22} />
                  <p className="text-[12px] font-semibold text-[var(--color-text-secondary)] leading-tight">Export CSV</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] p-3 text-center cursor-pointer hover:bg-[var(--color-background)]/40 transition-colors flex flex-col gap-2">
                  <CircleAlert className="mx-auto text-[var(--color-text-primary)] mb-1.5" size={22} />
                  <p className="text-[12px] font-semibold text-[var(--color-text-secondary)] leading-tight">Report issue</p>
                </div>
              </div>
            </div>

            {/* Spending by Type */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--color-surface)]/60 p-6 shadow-xs">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-5">Spending by Type</h3>
              <div className="space-y-5">
                {desktopSpendingByType.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-[var(--color-text-secondary)]">{item.label}</span>
                      <span className="text-xs text-[var(--color-text-secondary)]">{item.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--color-background)]">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${item.width}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <TransactionSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditingTx(null);
        }}
        categories={categories}
        accounts={mappedAccounts}
        onSubmit={handleSubmitTransaction}
        loading={createTransactionMutation.isPending || updateTransactionMutation.isPending}
        initialData={editingTx}
        defaultData={editingTx ? null : defaultTransactionDraft}
      />

      <TransactionDetails
        transaction={selectedTx}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedTx(null);
        }}
        onEdit={(tx) => {
          setEditingTx(mapToDraft(tx));
          setEditingId(tx._id);
          setSheetOpen(true);
        }}
        onDelete={async (tx) => {
          const ok = await confirm({
            title: "Delete Transaction?",
            message: "This transaction will be permanently deleted from your history. This action is irreversible.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger",
          });

          if (!ok) return;

          try {
            await deleteTransactionMutation.mutateAsync(tx._id);
            setDetailsOpen(false);
            setSelectedTx(null);
            toast.success("Transaction deleted successfully");
          } catch (err) {
            console.error(err);
            toast.error("Failed to delete transaction");
          }
        }}
      />
    </>
  );
}
