import { useCreateTransaction, useTransactions } from "../features/transactions/hooks/useTransactions";
import type { Transaction as ApiTransaction } from "../features/transactions/types/transaction.types";
import { useState } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Dropdown from "../components/ui/Dropdown";
import DatePicker from "../components/ui/DatePicker";
import TransactionSheet from "../components/transactions/TransactionSheet";
import { useAuth } from "../lib/context/useAuth";
import { useAccounts } from "../features/accounts/hooks/useAccounts";
import { useCategories } from "../features/categories/hooks/useCategories";
import resolveLucideIcon from "../utils/LucideIconsResolver";

type FilterType = "all" | "income" | "expense";
type SortType = "latest" | "highest" | "lowest";
type DateRangeType = "30" | "60" | "90" | "custom";


function formatDisplayDate(dateString: string) {

const date = new Date(dateString);



if (Number.isNaN(date.getTime())) return dateString;



return new Intl.DateTimeFormat("en-IN", {

day: "2-digit",

month: "short",

year: "numeric",

}).format(date);

}

function getTransactionTitle(transaction: ApiTransaction) {
  return transaction.category_name || "Transaction";
}

function getTransactionCategoryLabel(transaction: ApiTransaction) {
  if (transaction.type == 'expense' || transaction.type == 'income') return transaction.account_id.name
  if (transaction.type == 'transfer') return 'Transfer'
  // return (transaction.note ? `• ${transaction.note}` : '');
}

export default function Transactions() {
  const { accessToken, loading } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("latest");
  const [dateRange, setDateRange] = useState<DateRangeType>("30");
  const [currentPage, setCurrentPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const itemsPerPage = 5;

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);


  const { data: categoriesData } = useCategories();
  const { data: accountsData } = useAccounts();

  const categories = categoriesData?.categories ?? [];
  const accounts = accountsData?.accounts ?? [];

  const mappedAccounts = accounts.map(acc => ({
    _id: acc._id,
    name: acc.name,
    type: acc.account_category_group || "account", // or fallback
    balance: acc.current_balance,
  }));

  const isReady = categories.length > 0 && accounts.length > 0;

  const createTransactionMutation = useCreateTransaction();

  const handleCreateTransaction = async (payload: {
    amount: number;
    type: "expense" | "income" | "transfer";
    account_id: string;
    to_account_id?: string;
    category_id?: string;
    note?: string;
    date: Date;
  }) => {
    try {
      await createTransactionMutation.mutateAsync(payload);
      setSheetOpen(false); // ✅ FIXED
    } catch (err) {
      console.error("Transaction failed", err);
    }
  };

  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: search || undefined,
    type: filter === "all" ? undefined : filter,
    sort,
    from:
      dateRange === "custom" && startDate
        ? startDate.toISOString()
        : undefined,
    to:
      dateRange === "custom" && endDate
        ? endDate.toISOString()
        : undefined,
  };

  const {
    data,
    isLoading,
    isError,
    error,
  } = useTransactions(queryParams, {
    accessToken,
    enabled: !loading && !!accessToken,
  });

  const currentItems = data?.transactions ?? [];
  const totalPages = Math.max(data?.pages ?? 1, 1);
  const totalRecords = data?.total ?? 0;

  return (<div className="p-1 flex flex-col gap-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-700 w-full mx-auto box-border overflow-x-hidden">
    {/* HEADER */}
    <div className="flex items-start justify-between gap-2 w-full">

      <div className="flex flex-col min-w-0 gap-2">

        <h2 className="text-3xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tighter">
          <span className="hidden md:block">Transactions</span>
          <span className="md:hidden block">History</span>

        </h2>

        <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest opacity-70 truncate">
          {totalRecords} records found
        </p>

      </div>


      <button disabled={!isReady}
        onClick={() => setSheetOpen(true)} className="flex group items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/10 hover:bg-[var(--color-accent)] hover:text-white hover:shadow-[0_15px_30px_-10px_rgba(82,61,255,0.4)] disabled:opacity-40">
        <PlusCircle size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform" />
        <span className="hidden md:block text-sm">Record transaction</span>
        <span className="block md:hidden text-sm">Record</span>
      </button>

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
          className="w-full pl-11 pr-4 h-11 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all outline-none"
        />

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
                { label: "Expense", value: "expense" }
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

          <div className="py-20 text-center text-sm font-bold text-[var(--color-text-secondary)]">
            Loading transactions...
          </div>

        ) : isError ? (

          <div className="py-20 text-center text-sm font-bold text-[var(--color-danger)]">
            {error instanceof Error ? error.message : "Failed to load transactions"}
          </div>

        ) : currentItems.length === 0 ? (

          <div className="py-20 text-center text-sm font-bold text-[var(--color-text-secondary)]">
            No transactions found
          </div>

        ) : (

          currentItems.map((t, index) => {
            const isLast = index === currentItems.length - 1;
            const categoryLabel = getTransactionCategoryLabel(t);
            const title = getTransactionTitle(t);
            const displayDate = formatDisplayDate(t.date);
            const Icon = resolveLucideIcon(t.category_icon);
            const displayAmount =
              t.type === "expense"
                ? -Math.abs(t.amount)
                : t.type === "income"
                  ? Math.abs(t.amount)
                  : Math.abs(t.amount);

            return (
              <div
                key={t._id}
                className="relative flex items-center justify-between p-3 md:p-4 hover:bg-[var(--color-background)] rounded-2xl transition-all group gap-1 min-w-0 cursor-pointer"
              >
                {!isLast && (
                  <div className="absolute bottom-0 left-4 right-4 border-b border-dashed border-[var(--border)]" />
                )}

                {/* LEFT SIDE: ICON + INFO */}
                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                  <div
                    className="w-10 h-10 shrink-0 rounded-full border border-[var(--border)]/10 flex items-center justify-center text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors"
                    style={{
                      backgroundColor: `${t.category_color}15`,
                      color: t.category_color,
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1 justify-center">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-[15px] text-[var(--color-text-primary)] tracking-tight truncate leading-tight">
                        {title}
                      </span>

                      {/* AMOUNT (mobile only) */}
                      <span
                        className={`md:hidden font-black text-sm shrink-0 ${displayAmount < 0
                          ? "text-[var(--color-danger)]"
                          : displayAmount > 0
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-text-secondary)]"
                          }`}
                      >
                        {displayAmount < 0 ? "-" : displayAmount > 0 ? "+" : ""}
                        ₹{Math.abs(displayAmount).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between md:justify-start md:gap-2 min-w-0">
                      <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase truncate flex-1 md:flex-none max-w-[120px] md:max-w-96 opacity-60">
                        {categoryLabel}
                      </span>
                      <span className="hidden md:block w-1 h-1 rounded-full bg-[var(--color-text-secondary)] opacity-20 shrink-0" />
                      <span className="shrink-0 text-[10px] font-black text-[var(--color-text-secondary)] uppercase opacity-40 ml-4 md:ml-0">
                        {displayDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: AMOUNT + INDICATOR */}
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                  <div
                    className={`font-black text-sm md:text-base shrink-0 ${displayAmount < 0
                      ? "text-[var(--color-danger)]"
                      : displayAmount > 0
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-text-secondary)]"
                      }`}
                  >
                    {/* Amount (hidden on mobile, shown on desktop as before) */}
                    <span className="hidden md:block">
                      {displayAmount < 0 ? "-" : displayAmount > 0 ? "+" : ""}
                      ₹{Math.abs(displayAmount).toLocaleString()}
                    </span>
                  </div>

                  {/* INDICATOR CHEVRON - Refined for minimal footprint */}
                  <ChevronRight
                    size={14} // Small footprint
                    strokeWidth={2.5}
                    className={`
                    text-[var(--color-text-secondary)] transition-all duration-300
                    opacity-20 md:opacity-0 
                    md:-translate-x-2 md:group-hover:translate-x-0 md:group-hover:opacity-100
                  `}
                  />
                </div>
              </div>
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
      onClose={() => setSheetOpen(false)}
      categories={categories}
      accounts={mappedAccounts}
      onSubmit={handleCreateTransaction}
      loading={createTransactionMutation.isPending}
    />
  </div>

  );
}
