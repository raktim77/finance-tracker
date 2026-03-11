import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { month: "Jan", amount: 1200 },
  { month: "Feb", amount: 1800 },
  { month: "Mar", amount: 900 },
  { month: "Apr", amount: 2100 }
];

export default function MonthlyBarChart() {

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-xl p-5">

      <h3 className="text-sm mb-4 text-[var(--color-text-secondary)]">
        Monthly Comparison
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>

          <XAxis dataKey="month" stroke="var(--color-text-secondary)" />
          <YAxis stroke="var(--color-text-secondary)" />

          <Tooltip />

          <Bar dataKey="amount" fill="var(--color-primary)" />

        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}