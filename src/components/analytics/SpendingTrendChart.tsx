import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { day: "1", amount: 200 },
  { day: "2", amount: 450 },
  { day: "3", amount: 150 },
  { day: "4", amount: 500 },
  { day: "5", amount: 300 }
];

export default function SpendingTrendChart() {

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-xl p-5">

      <h3 className="text-sm mb-4 text-[var(--color-text-secondary)]">
        Spending Trend
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <XAxis dataKey="day" stroke="var(--color-text-secondary)" />
          <YAxis stroke="var(--color-text-secondary)" />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="amount"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={false}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}