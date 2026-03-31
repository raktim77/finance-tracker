import { useCreateTransaction, useDeleteTransaction, useTransactions, useUpdateTransaction } from "../features/transactions/hooks/useTransactions";
import type { Transaction as ApiTransaction, Transaction } from "../features/transactions/types/transaction.types";
import { useEffect, useState } from "react";
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  PlusCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
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
  getTransactionTitle,
} from "../features/transactions/utils/transactionDisplay";

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
  const displayTitle = isScopedToAccount
    ? scopedAccount?.name || "Transactions"
    : "Transactions";

  const mappedAccounts = accounts.map(acc => ({
    _id: acc._id,
    name: acc.name,
    type: acc.account_category_group || "account", // or fallback
    balance: acc.current_balance,
    icon: acc.account_category_icon || 'help',
  }));
  const defaultTransactionDraft: Partial<TransactionDraft> | null =
    isScopedToAccount && scopedAccount
      ? {
        account_id: scopedAccount._id,
      }
      : null;

  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();
  useEffect(() => {
    if (dateRange === "custom") {
      setStartDate(undefined);
      setEndDate(undefined);
      return;
    }

    const { startDate: nextStartDate, endDate: nextEndDate } =
      getPresetDateRange(dateRange);
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
  }, [dateRange]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
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
    console.log(payload);
    console.log(editingId);

    try {
      if (editingTx && editingId) {
        await updateTransactionMutation.mutateAsync({
          id: editingId,
          payload: payload,
        });
      } else {
        await createTransactionMutation.mutateAsync(payload);
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
  const isWaitingForCustomRange =
    dateRange === "custom" && (!formattedStartDate || !formattedEndDate);
  const canFetchTransactions =
    !loading && !!accessToken && !!formattedStartDate && !!formattedEndDate;

  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    type: filter === "all" ? undefined : filter,
    account_id,
    sort,
    startDate: formattedStartDate,
    endDate: formattedEndDate,
  };

  const {
    data,
    isLoading,
    isError,
    error,
  } = useTransactions(queryParams, {
    accessToken,
    enabled: canFetchTransactions,
  });

  const currentItems = data?.transactions ?? [];
  const totalPages = Math.max(data?.pages ?? 1, 1);
  const totalRecords = data?.total ?? 0;

  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  return (<div className="p-1 flex flex-col gap-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-700 w-full mx-auto box-border overflow-x-hidden">
  {/* HEADER */}
<div className="flex flex-col gap-4 w-full min-w-0 overflow-hidden">
  {/* TOP ROW: Back Button (Only shows when scoped) */}
  {isScopedToAccount && (
    <div className="flex animate-in slide-in-from-left-2 duration-500">
      <button
        onClick={() => navigate("/accounts")}
        className="group inline-flex items-center gap-2 rounded-xl border border-[var(--color-accent)]/10 bg-[var(--color-accent-soft)] px-3 py-1.5 text-[var(--color-accent)] transition-all active:scale-95 hover:bg-[var(--color-accent)] hover:text-white hover:shadow-[0_10px_20px_-5px_rgba(82,61,255,0.3)]"
        aria-label="Back to accounts"
      >
        <ChevronLeft size={14} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          Back to Accounts
        </span>
      </button>
    </div>
  )}

  {/* MAIN TITLE ROW */}
  <div className="flex w-full min-w-0 items-start justify-between gap-4 md:gap-6">
    <div className="flex min-w-0 max-w-[calc(100%-5.5rem)] flex-1 flex-col gap-1.5 md:max-w-[calc(100%-12rem)]">
      <h2 className="min-w-0 max-w-full text-3xl font-black leading-tight tracking-tighter text-[var(--color-text-primary)] md:text-5xl">
        <span className="block w-full break-words whitespace-normal md:hidden">
          {isScopedToAccount ? displayTitle : "History"}
        </span>
        <span className="hidden w-full break-words whitespace-normal md:block">
          {displayTitle}
        </span>
      </h2>

      <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest opacity-70 truncate">
        {totalRecords} records found
      </p>
    </div>

    <button
      onClick={() => {
        if (!hasAccounts) {
          navigate("/accounts");
          return;
        }
        setSheetOpen(true);
      }}
      className="flex shrink-0 group items-center justify-center gap-2 rounded-2xl border border-[var(--color-accent)]/10 bg-[var(--color-accent-soft)] px-5 py-2.5 text-xs font-black text-[var(--color-accent)] transition-all active:scale-95 hover:bg-[var(--color-accent)] hover:text-white hover:shadow-[0_15px_30px_-10px_rgba(82,61,255,0.4)] disabled:opacity-40 md:text-sm"
    >
      <PlusCircle size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform" />
      <span className="hidden md:block">
        {hasAccounts ? "Record transaction" : "Add Account"}
      </span>
      <span className="block md:hidden">
        {hasAccounts ? "Record" : "Add"}
      </span>
    </button>
  </div>
</div>

    {/* CONTROLS */}

    <div className="flex flex-col gap-5 w-full">

      {/* SEARCH */}

      <div className="relative w-full">

        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="w-full pl-11 pr-11 h-11 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={handleClearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X size={14} />
          </button>
        )}

      </div>

      {/* FILTER ROW */}

      {/* FILTER ROW */}

      <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">

        {/* LEFT SIDE (Date controls) */}

        <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1">

          {/* Date Range Dropdown */}
          <div className="w-full md:w-[220px]">
            <Dropdown
              icon={Calendar}
              value={dateRange}
              onChange={(v) => setDateRange(v as DateRangeType)}
              options={[
                { label: "Last 30 Days", value: "30" },
                { label: "Last 60 Days", value: "60" },
                { label: "Last 90 Days", value: "90" },
                { label: "Custom Range", value: "custom" }
              ]}
            />
          </div>

          {/* Custom Range Dates */}
          {dateRange === "custom" && (
            <div className="flex items-center gap-3 w-full md:w-auto animate-in slide-in-from-top-2">
              <div className="w-full flex items-center justify-between px-3 md:px-4 h-11 bg-[var(--color-surface)] border border-[var(--input-border)] rounded-xl text-[12px] font-bold transition-all hover:border-[var(--color-accent)]/30">
                <DatePicker value={startDate} onChange={setStartDate} />

              </div>

              <span className="text-xs font-bold text-[var(--color-text-secondary)] opacity-60">
                →
              </span>
              <div className="w-full flex items-center justify-between px-3 md:px-4 h-11 bg-[var(--color-surface)] border border-[var(--input-border)] rounded-xl text-[12px] font-bold transition-all hover:border-[var(--color-accent)]/30">
                <DatePicker value={endDate} onChange={setEndDate} />

              </div>

            </div>
          )}

        </div>

        {/* RIGHT SIDE (Filter + Sort) */}

        <div className="grid grid-cols-2 md:flex md:items-center gap-8 md:w-auto">

          {/* Filter */}
          <div className="w-full md:w-[180px]">
            <Dropdown
              icon={Filter}
              value={filter}
              onChange={(v) => setFilter(v as FilterType)}
              options={[
                { label: "All Types", value: "all" },
                { label: "Income", value: "income" },
                { label: "Expense", value: "expense" },
                { label: "Transfer", value: "transfer" }
              ]}
            />
          </div>

          {/* Sort */}
          <div className="w-full md:w-[180px]">
            <Dropdown
              icon={ArrowUpDown}
              value={sort}
              onChange={(v) => setSort(v as SortType)}
              options={[
                { label: "Latest", value: "latest" },
                { label: "Highest", value: "highest" },
                { label: "Lowest", value: "lowest" }
              ]}
            />
          </div>

        </div>

      </div>



    </div>



    {/* TRANSACTION LIST */}

    <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--border)] overflow-hidden shadow-sm w-full">

      <div className="flex flex-col p-2 gap-1">

        {isLoading ? (
          <div className="flex flex-col gap-1 p-1">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="relative flex items-center justify-between gap-3 md:gap-8 rounded-2xl p-3 md:p-4"
              >
                {index !== 7 && (
                  <div className="absolute bottom-0 left-4 right-4 border-b border-dashed border-[var(--border)]" />
                )}

                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--color-text-secondary)]/10 animate-pulse" />

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 mb-2 min-w-0">
                      <div className="h-4 w-32 md:w-44 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
                      <div className="h-4 w-16 md:hidden bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
                    </div>

                    <div className="flex items-center justify-between min-w-0 md:justify-start md:gap-2">
                      <div className="h-3 w-20 md:w-28 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
                      <div className="hidden md:block w-1 h-1 rounded-full bg-[var(--color-text-secondary)]/10 animate-pulse" />
                      <div className="h-3 w-16 bg-[var(--color-text-secondary)]/10 rounded animate-pulse ml-4 md:ml-0" />
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2 shrink-0">
                  <div className="h-5 w-20 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
                  <div className="w-3 h-3 rounded-full bg-[var(--color-text-secondary)]/10 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

        ) : isError ? (

          <div className="py-20 text-center text-sm font-bold text-[var(--color-danger)]">
            {error instanceof Error ? error.message : "Failed to load transactions"}
          </div>

        ) : isWaitingForCustomRange ? (

          <div className="py-20 text-center text-sm font-bold text-[var(--color-text-secondary)]">
            Select both start and end dates
          </div>

        ) : currentItems.length === 0 ? (
          <div className="p-8 md:p-12">
            <div className="relative overflow-hidden rounded-[2rem] text-center">
              {/* <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(124,108,255,0.08),transparent_35%)]" /> */}
              <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-4">
                {/* <div className="w-16 h-16 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shadow-inner">
                  <PlusCircle size={28} />
                </div> */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
                    {hasAccounts ? "No Transactions Yet" : "Add an Account First"}
                  </h3>
                  <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed opacity-80">
                    {hasAccounts
                      ? "Start recording income, expenses, or transfers to build your transaction history here."
                      : "You need at least one account before you can record transactions. Add an account to get started."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (hasAccounts) {
                      setSheetOpen(true);
                      return;
                    }
                    navigate("/accounts");
                  }}
                  className="group mt-2 inline-flex items-center gap-2 rounded-2xl border border-[var(--color-accent)]/10 bg-[var(--color-accent-soft)] px-5 py-3 text-xs font-black text-[var(--color-accent)] transition-all active:scale-95 hover:bg-[var(--color-accent)] hover:text-white hover:shadow-[0_15px_30px_-10px_rgba(82,61,255,0.4)] disabled:opacity-40 md:text-sm"
                >
                  <PlusCircle
                    size={18}
                    strokeWidth={2.5}
                    className="group-hover:rotate-90 transition-transform"
                  />
                  {hasAccounts ? "Record Your First Transaction" : "Add Your First Account"}
                </button>
              </div>
            </div>
          </div>

        ) : (

          currentItems.map((t, index) => {
            const isLast = index === currentItems.length - 1;
            const categoryLabel = getTransactionCategoryLabel(t);
            const title = getTransactionTitle(t);
            const displayDate = formatTransactionDisplayDate(t.date);

            return (
              <TransactionListItem
                key={t._id}
                transaction={t}
                title={title}
                categoryLabel={categoryLabel}
                displayDate={displayDate}
                showDivider={!isLast}
                onClick={() => {
                  setSelectedTx(t);
                  setDetailsOpen(true);
                }}
              />
            );
          })

        )}

      </div>


      {/* Pagination */}
      {totalPages > 1 && (

        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--color-surface)]">

          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex gap-2">

            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--color-background)] transition-colors text-[var(--color-text-primary)] active:scale-90"
            >

              <ChevronLeft size={16} />

            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--color-background)] transition-colors text-[var(--color-text-primary)] active:scale-90"
            >

              <ChevronRight size={16} />

            </button>

          </div>

        </div>

      )}

    </div>

    <TransactionSheet
      open={sheetOpen}
      onClose={() => {
        setSheetOpen(false);
        setEditingTx(null); // reset after close
      }}
      categories={categories}
      accounts={mappedAccounts}
      onSubmit={handleSubmitTransaction}
      loading={
        createTransactionMutation.isPending ||
        updateTransactionMutation.isPending
      }
      initialData={editingTx} // 👈 IMPORTANT
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
        //  setDetailsOpen(false);
        setEditingTx(mapToDraft(tx));
        setEditingId(tx._id); // 👈 IMPORTANT
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
          // 🔥 Optimistic delete (already handled in hook)
          await deleteTransactionMutation.mutateAsync(tx._id);

          // close details modal
          setDetailsOpen(false);
          setSelectedTx(null);

          // 🔥 success toast
          toast.success("Transaction deleted successfully");
        } catch (err) {
          console.error(err);

          // 🔥 error toast
          toast.error("Failed to delete transaction");
        }
      }}
    />
  </div>

  );
}
