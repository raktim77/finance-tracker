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
  type LucideIcon
} from "lucide-react";

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

  let filtered = transactions.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  if (filter !== "all") {
    filtered = filtered.filter((t) => t.type === filter);
  }

  if (sort === "highest") {
    filtered = [...filtered].sort((a, b) => b.amount - a.amount);
  }

  if (sort === "lowest") {
    filtered = [...filtered].sort((a, b) => a.amount - b.amount);
  }

  return (<div className="flex flex-col gap-6 pb-40 md:pb-32 animate-in fade-in slide-in-from-bottom-2 duration-700 w-full max-w-7xl mx-auto px-4 md:px-6 box-border overflow-x-hidden">
    {/* HEADER */}

    <div className="flex items-center justify-between gap-2 pt-2 w-full">

      <div className="flex flex-col min-w-0">

        <h1 className="text-xl md:text-2xl font-black text-[var(--color-text-primary)] tracking-tight truncate">
          Transactions
        </h1>

        <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest opacity-70 truncate">
          {filtered.length} records found
        </p>

      </div>

      <button className="flex items-center justify-center gap-2 bg-[var(--color-accent)] text-white p-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl font-black text-xs shadow-lg shadow-[var(--color-accent)]/20 active:scale-95 transition-all shrink-0">

        <PlusCircle size={18} strokeWidth={2.5} />

        <span className="hidden md:block">Add Transaction</span>

        <span className="md:hidden px-1">Add</span>

      </button>

    </div>


    {/* CONTROLS */}

    <div className="flex flex-col gap-3 w-full">

      {/* SEARCH */}

      <div className="relative w-full min-w-0">

        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="w-full min-w-0 pl-11 pr-4 h-11 rounded-xl bg-[var(--color-surface)] border border-[var(--input-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
        />

      </div>


      {/* FILTER + SORT */}

      <div className="grid grid-cols-2 gap-3 w-full min-w-0">

        {/* FILTER */}

        <div className="relative w-full min-w-0">

          <Filter
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="w-full min-w-0 pl-9 pr-2 h-11 bg-[var(--color-surface)] border border-[var(--input-border)] rounded-xl text-[12px] font-bold appearance-none transition-all outline-none"
          >

            <option value="all">All Types</option>

            <option value="income">Income</option>

            <option value="expense">Expense</option>

          </select>

        </div>


        {/* SORT */}

        <div className="relative w-full min-w-0">

          <ArrowUpDown
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="w-full min-w-0 pl-9 pr-2 h-11 bg-[var(--color-surface)] border border-[var(--input-border)] rounded-xl text-[12px] font-bold appearance-none transition-all outline-none"
          >

            <option value="latest">Latest</option>

            <option value="highest">Highest</option>

            <option value="lowest">Lowest</option>

          </select>

        </div>

      </div>

    </div>


    {/* TRANSACTION LIST */}

    <div className="rounded-[1.5rem] bg-[var(--color-surface)] border border-[var(--input-border)] overflow-hidden shadow-sm w-full min-w-0">

      <div className="flex flex-col p-1 md:p-4">

        {filtered.length === 0 ? (

          <div className="py-20 text-center text-sm font-bold text-[var(--color-text-secondary)]">
            No transactions found
          </div>

        ) : (

          filtered.map((t) => {

            const Icon = categoryIcons[t.category] || Utensils;

            return (

              <div
                key={t.id}
                className="flex items-center justify-between p-3 md:p-4 hover:bg-[var(--color-background)] rounded-2xl transition-all group min-w-0"
              >

                <div className="flex items-center gap-3 md:gap-4 min-w-0">

                  <div className="w-10 h-10 shrink-0 rounded-xl bg-[var(--color-background)] flex items-center justify-center text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">

                    <Icon size={18} />

                  </div>

                  <div className="flex flex-col min-w-0">

                    <span className="font-bold text-sm text-[var(--color-text-primary)] truncate">
                      {t.name}
                    </span>

                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-tight truncate">
                      {t.category} • {t.date}
                    </span>

                  </div>

                </div>


                <div
                  className={`font-black text-sm md:text-base shrink-0 ${t.amount < 0
                      ? "text-[var(--color-danger)]"
                      : "text-[var(--color-success)]"
                    }`}
                >

                  {t.amount < 0 ? "-" : "+"}₹
                  {Math.abs(t.amount).toLocaleString()}

                </div>

              </div>

            );

          })

        )}

      </div>

    </div>

  </div>

  );
}
