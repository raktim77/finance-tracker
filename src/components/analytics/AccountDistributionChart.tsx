import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Cash", value: 2000 },
  { name: "Bank", value: 12000 },
  { name: "Credit Card", value: 5000 }
];

const COLORS = [
  "var(--color-primary)",
  "var(--color-accent-teal)",
  "var(--color-warm)"
];

export default function AccountDistributionChart() {

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-xl p-5">

      <h3 className="text-sm mb-4 text-[var(--color-text-secondary)]">
        Account Distribution
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            outerRadius={90}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip />

        </PieChart>
      </ResponsiveContainer>

    </div>
  );
}