import { useState } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Utensils,
  ShoppingBag,
  Car,
  Briefcase,
  PlusCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  type LucideIcon
} from "lucide-react";
import Dropdown from "../components/ui/Dropdown";
import DatePicker from "../components/ui/DatePicker";
import TransactionSheet from "../components/transactions/TransactionSheet";

type Transaction = {
  id: number;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense";
};

type FilterType = "all" | "income" | "expense";
type SortType = "latest" | "highest" | "lowest";
type DateRangeType = "30" | "60" | "90" | "custom";

const transactions: Transaction[] = [
  { id: 1, name: "Swiggy", category: "Food", date: "Today, 2:45 PM", amount: -420, type: "expense" },
  { id: 2, name: "Salary", category: "Income", date: "Yesterday", amount: 45000, type: "income" },
  { id: 3, name: "Amazon", category: "Shopping", date: "Mar 07, 2026", amount: -2199, type: "expense" },
  { id: 4, name: "Uber", category: "Transport", date: "Mar 06, 2026", amount: -340, type: "expense" }
];

const categoryIcons: Record<string, LucideIcon> = {
  Food: Utensils,
  Shopping: ShoppingBag,
  Transport: Car,
  Income: Briefcase
};

export default function Transactions() {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("latest");
  const [dateRange, setDateRange] = useState<DateRangeType>("30");
  const [currentPage, setCurrentPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const itemsPerPage = 5;

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  let filtered = transactions.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  if (filter !== "all") filtered = filtered.filter((t) => t.type === filter);
  if (sort === "highest") filtered = [...filtered].sort((a, b) => b.amount - a.amount);
  if (sort === "lowest") filtered = [...filtered].sort((a, b) => a.amount - b.amount);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (<div className="p-1 flex flex-col gap-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-700 w-full mx-auto box-border overflow-x-hidden">
    {/* HEADER */}
    <div className="flex items-start justify-between gap-2 w-full">

      <div className="flex flex-col min-w-0 gap-2">

        <h2 className="text-3xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tighter">
          <span className="hidden md:block">Transactions</span>
          <span className="md:hidden block">History</span>

        </h2>

        <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest opacity-70 truncate">
          {filtered.length} records found
        </p>

      </div>


      <button onClick={() => setSheetOpen(true)} className="flex group items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/10 hover:bg-[var(--color-accent)] hover:text-white hover:shadow-[0_15px_30px_-10px_rgba(82,61,255,0.4)]">
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

              <DatePicker value={startDate} onChange={setStartDate} />

              <span className="text-xs font-bold text-[var(--color-text-secondary)] opacity-60">
                →
              </span>

              <DatePicker value={endDate} onChange={setEndDate} />

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

    <div className="rounded-[1.5rem] bg-[var(--color-surface)] border border-[var(--border)] overflow-hidden shadow-sm w-full">

      <div className="flex flex-col p-1 md:p-4 gap-1">

        {currentItems.length === 0 ? (

          <div className="py-20 text-center text-sm font-bold text-[var(--color-text-secondary)]">
            No transactions found
          </div>

        ) : (

          currentItems.map((t) => {

            const Icon = categoryIcons[t.category] || Utensils;

            return (

              <div key={t.id} className="flex items-center justify-between p-3 md:p-4 hover:bg-[var(--color-background)] rounded-2xl transition-all group min-w-0">

                <div className="flex items-center gap-3 md:gap-4 min-w-0">

                  <div className="w-10 h-10 shrink-0 rounded-xl bg-[var(--color-background)] flex items-center justify-center text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">

                    <Icon size={18} />

                  </div>

                  <div className="flex flex-col min-w-0 gap-1">

                    <span className="font-bold text-sm text-[var(--color-text-primary)] truncate">
                      {t.name}
                    </span>

                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-tight truncate">
                      {t.category} • {t.date}
                    </span>

                  </div>

                </div>

                <div className={`font-black text-sm md:text-base shrink-0 ${t.amount < 0 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}>

                  {t.amount < 0 ? "-" : "+"}₹{Math.abs(t.amount).toLocaleString()}

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
  categories={[]} 
  accounts={[]}
  onSubmit={async (data) => {
    console.log("transaction", data);
  }}
/>
  </div>

  );
}
