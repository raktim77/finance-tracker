import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

type Props = {
  data?: { day: string; amount: number }[];
  isLoading: boolean;
};

export const ExpenseTrend = ({ data, isLoading }: Props) => {

  // 🔥 SKELETON (matches your UI)
  if (isLoading) {
    return (
     <div className="rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-6 h-full">
  {/* Header Skeleton */}
  <div className="flex items-center justify-between">
    <div className="flex flex-col gap-2">
      <div className="h-4 w-32 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
      <div className="h-3 w-40 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
    </div>

    <div className="flex gap-2 items-center">
      <div className="h-2 w-2 rounded-full bg-black/10 dark:bg-white/20 animate-pulse" />
      <div className="h-3 w-16 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
    </div>
  </div>

  {/* High-Impact Area Chart Skeleton */}
  <div className="flex-1 flex flex-col justify-end min-h-[240px] w-full relative overflow-hidden">
    <svg
      viewBox="0 0 400 100" 
      preserveAspectRatio="none"
      className="w-full h-[200px] animate-pulse mt-auto"
    >
      {/* Area Fill - Coordinates raised to fill upward space */}
      <path
        d="M0,100 L0,60 C40,55 80,85 120,60 C160,35 200,90 260,45 C320,5 360,25 400,5 L400,100 Z"
        className="fill-[var(--color-text-secondary)] opacity-10"
      />
      
      {/* Line Stroke - Peaks moved closer to Y:0 to reduce top gap */}
      <path
        d="M0,60 C40,55 80,85 120,60 C160,35 200,90 260,45 C320,5 360,25 400,5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-[var(--color-text-secondary)] opacity-10"
      />
    </svg>

    {/* Subtle Grid Lines */}
    <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="w-[1px] h-full bg-[var(--color-text-secondary)]/5" />
      ))}
    </div>
  </div>
</div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6 h-full">
      
      {/* Header */}
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

      {/* Chart */}
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