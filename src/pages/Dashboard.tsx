import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Utensils,
  Briefcase,
  ShoppingBag,
  Car,
  ChevronRight,
  PlusCircle,
  CircleDollarSign,
  type LucideIcon
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { day: "Mon", amount: 2400 },
  { day: "Tue", amount: 1398 },
  { day: "Wed", amount: 9800 },
  { day: "Thu", amount: 3908 },
  { day: "Fri", amount: 4800 },
  { day: "Sat", amount: 3800 },
  { day: "Sun", amount: 4300 }
];

interface StatCardProps {
  label: string;
  amount: string;
  icon: LucideIcon;
  color: string;
}

interface TransactionItemProps {
  name: string;
  category: string;
  date: string;
  amount: string;
  icon: LucideIcon;
  negative?: boolean;
}

const StatCard = ({ label, amount, icon: Icon, color }: StatCardProps) => (

  <div
    className="group p-5 rounded-2xl bg-[var(--color-surface)]
border border-[var(--input-border)]
flex items-center gap-4
transition-all duration-200
hover:-translate-y-[2px]
hover:shadow-lg
hover:border-[var(--color-accent)]/30"
  >

    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner shrink-0"
      style={{ backgroundColor: `${color}15`, color: color }}
    >
      <Icon size={24} strokeWidth={2.5} />
    </div>

    <div className="flex flex-col min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] truncate">
        {label}
      </span>

      <span className="text-xl font-black text-[var(--color-text-primary)] truncate">
        {amount}
      </span>
    </div>

  </div>
);

const TransactionItem = ({
  name,
  category,
  date,
  amount,
  icon: Icon,
  negative
}: TransactionItemProps) => (

  <div className="flex items-center justify-between group cursor-pointer py-1">

    <div className="flex items-center gap-4 min-w-0">

      <div className="w-11 h-11 rounded-full bg-[var(--color-background)] border border-[var(--input-border)] flex items-center justify-center group-hover:bg-[var(--color-accent-soft)] transition-colors shrink-0">
        <Icon
          size={18}
          className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]"
        />
      </div>

      <div className="flex flex-col min-w-0">
        <span className="font-bold text-[var(--color-text-primary)] text-sm truncate">
          {name}
        </span>

        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-tighter truncate">
          {category} • {date}
        </span>
      </div>

    </div>

    <div className="flex items-center gap-2 shrink-0">

      <span
        className={`font-black text-sm ${negative
          ? "text-[var(--color-danger)]"
          : "text-[var(--color-success)]"
          }`}

      >

        {amount} </span>

      <ChevronRight
        size={14}
        className="text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
      />

    </div>
  </div>
);


import { PieChart, Pie, Cell } from "recharts";

const categoryData = [
  { name: "Food", value: 8200, color: "#f97316" },
  { name: "Shopping", value: 5100, color: "#8b5cf6" },
  { name: "Transport", value: 2400, color: "#06b6d4" },
  { name: "Bills", value: 2500, color: "#22c55e" }
];

import { useState } from "react";

function SpendingDonut() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = categoryData.reduce((sum, item) => sum + item.value, 0);

  const activeItem =
    activeIndex !== null ? categoryData[activeIndex] : null;

  return (<div className="h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--input-border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6">

    <h2 className="font-bold text-lg text-[var(--color-text-primary)]">
      Spending Categories
    </h2>

    <div className="flex flex-col md:flex-row items-center gap-6">

      {/* Donut */}
      <div className="relative w-[380px] h-[200px] flex items-center justify-center">

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>

            <Pie
              className="focus:outline-none"
              data={categoryData}
              innerRadius={65}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              animationDuration={900}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  style={{
                    filter:
                      activeIndex === index
                        ? "brightness(1.15)"
                        : "brightness(0.9)",
                    transition: "all .25s"
                  }}
                />
              ))}
            </Pie>

          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">

          {activeItem ? (
            <>
              <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {activeItem.name}
              </span>

              <span className="text-lg font-black text-[var(--color-text-primary)]">
                ₹{activeItem.value.toLocaleString()}
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Total
              </span>

              <span className="text-xl font-black text-[var(--color-text-primary)]">
                ₹{total.toLocaleString()}
              </span>
            </>
          )}

        </div>

      </div>


      {/* Legend */}
      <div className="flex flex-col gap-4 w-full">

        {categoryData.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between text-sm transition-all ${activeIndex === i ? "opacity-100" : "opacity-70"
              }`}
          >

            <div className="flex items-center gap-3">

              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />

              <span className="text-[var(--color-text-primary)] font-semibold">
                {item.name}
              </span>

            </div>

            <span className="text-[var(--color-text-secondary)] font-bold">
              ₹{item.value.toLocaleString()}
            </span>

          </div>
        ))}

      </div>

    </div>

  </div>

  );
}




import { Sparkles, AlertTriangle, Brain } from "lucide-react";

function AIInsights() {
  return (<div className="h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--input-border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6">

    {/* Header */}
    <div className="flex items-center gap-3">

      <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center">
        <Sparkles size={18} className="text-[var(--color-accent)]" />
      </div>

      <div className="flex flex-col">
        <span className="font-bold text-[var(--color-text-primary)]">
          AI Insights
        </span>

        <span className="text-xs text-[var(--color-text-secondary)]">
          Smart spending analysis
        </span>
      </div>

    </div>


    {/* Insights List */}
    <div className="flex flex-col gap-5 text-sm">

      <div className="flex gap-3">

        <TrendingUp size={18} className="text-[var(--color-success)] mt-[2px]" />

        <p className="text-[var(--color-text-primary)] leading-relaxed">
          Your <strong>food spending increased 32%</strong> compared to last week.
        </p>

      </div>


      <div className="flex gap-3">

        <Brain size={18} className="text-[var(--color-accent)] mt-[2px]" />

        <p className="text-[var(--color-text-primary)] leading-relaxed">
          Your <strong>highest spending day was Wednesday</strong> with ₹9,800 spent.
        </p>

      </div>


      <div className="flex gap-3">

        <AlertTriangle size={18} className="text-[var(--color-warm)] mt-[2px]" />

        <p className="text-[var(--color-text-primary)] leading-relaxed">
          At this pace your <strong>monthly spending may reach ₹41,200</strong>.
        </p>

      </div>

    </div>


    {/* Monthly Forecast (Highlighted Section) */}

    <div className="p-5 rounded-xl bg-gradient-to-r from-[var(--color-accent-soft)] to-transparent border border-[var(--color-accent)]/20 flex flex-col gap-2">

      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
        Monthly Forecast
      </span>

      <span className="text-2xl font-black text-[var(--color-text-primary)]">
        ₹18,400
      </span>

      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
        Estimated remaining balance by the end of this month based on current spending trends.
      </p>

    </div>

  </div>

  );
}






export default function Dashboard() {
  return (

    <div className="flex flex-col gap-8 pb-24 animate-in fade-in duration-700 mx-auto md:px-0">

      {/* HERO BALANCE CARD */}

      <div
        className="
relative group overflow-hidden rounded-[2.5rem] p-8
bg-gradient-to-r from-[#7c6cff] via-[#9c7cff] to-[#c084fc]
shadow-[0_20px_50px_rgba(124,108,255,0.25)]
dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
transition-transform duration-500 hover:scale-[1.005]
"
      >

        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-8">

          <div className="flex items-center gap-6">

            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner shrink-0">
              <Wallet size={28} className="text-white" />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                Total Balance
              </span>

              <span className="text-2xl md:text-5xl font-black text-white tracking-tight">
                ₹1,24,500
              </span>
            </div>

          </div>

          <div className="hidden lg:flex gap-3">

            <button className="flex items-center gap-2 bg-white text-[var(--color-accent)] px-6 py-3 rounded-2xl text-sm font-black shadow-xl hover:shadow-2xl active:scale-95 transition-all">

              <PlusCircle size={18} strokeWidth={2.5} />

              Record Transaction

            </button>

          </div>

        </div>

      </div>

      {/* MINI STAT CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-5">

        <StatCard
          label="Income"
          amount="₹45,000"
          icon={TrendingUp}
          color="#16A34A"
        />

        <StatCard
          label="Expenses"
          amount="₹18,200"
          icon={TrendingDown}
          color="#EF4444"
        />

        <StatCard
          label="Savings"
          amount="92%"
          icon={Target}
          color="#9333EA"
        />

        <StatCard
          label="Budget Left"
          amount="₹26,800"
          icon={CircleDollarSign}
          color="#32a59e"
        />

      </div>

      {/* ANALYTICS + TRANSACTIONS */}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
        {/* CHART */}

        <div className="lg:col-span-3 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--input-border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6">

          <div className="flex items-center justify-between">

            <div className="flex flex-col">
              <h2 className="font-bold text-lg text-[var(--color-text-primary)]">
                Expense Trend
              </h2>

              <span className="text-xs opacity-70 text-[var(--color-text-secondary)]">
                Weekly spending overview
              </span>
            </div>

            <div className="flex gap-2">

              <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] my-auto animate-pulse"></span>

              <span className="text-[10px] font-black uppercase text-[var(--color-text-secondary)] tracking-widest">
                Live Feed
              </span>

            </div>

          </div>

          <div className="flex-1 min-h-[240px] w-full">

            <ResponsiveContainer width="100%" height="100%">

              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

                <defs>

                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">

                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />

                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />

                  </linearGradient>

                </defs>

                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "12px",
                    border: "1px solid var(--input-border)",
                    fontSize: "12px"
                  }}
                  itemStyle={{
                    color: "var(--color-text-primary)",
                    fontWeight: "bold"
                  }}
                />

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--input-border)"
                  opacity={0.5}
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }}
                />

                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-accent)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* TRANSACTIONS */}

        <div className="lg:col-span-2 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--input-border)] shadow-sm hover:shadow-md transition-all">

          <div className="flex items-center justify-between mb-8">

            <h2 className="font-bold text-lg text-[var(--color-text-primary)]">
              Recent History
            </h2>

            <button className="px-3 py-1.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[10px] font-black uppercase tracking-widest hover:brightness-95 transition-all">

              See All

            </button>

          </div>

          <div className="flex flex-col gap-6">

            <TransactionItem
              name="Swiggy"
              category="Food"
              date="Today, 2:45 PM"
              amount="-₹420"
              icon={Utensils}
              negative
            />

            <TransactionItem
              name="Salary"
              category="Work"
              date="Yesterday"
              amount="+₹45,000"
              icon={Briefcase}
            />

            <TransactionItem
              name="Amazon"
              category="Shopping"
              date="Mar 07, 2026"
              amount="-₹2,199"
              icon={ShoppingBag}
              negative
            />

            <TransactionItem
              name="Uber"
              category="Transport"
              date="Mar 06, 2026"
              amount="-₹340"
              icon={Car}
              negative
            />

          </div>

        </div>

        {/* NEW Spending Donut */}
        <div className="lg:col-span-3 h-full">
          <SpendingDonut />
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-2 h-full">
          <AIInsights />
        </div>


      </div>

    </div>
  );
}
