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

export const ExpenseTrend = () => {
  return (
    <div className="rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6 h-full">
      
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
                border: "1px solid var(--border)",
                fontSize: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
              }}
              itemStyle={{
                color: "var(--color-text-primary)",
                fontWeight: "bold"
              }}
            />

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
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
  );
};