import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Food", value: 400 },
  { name: "Shopping", value: 300 },
  { name: "Transport", value: 200 },
  { name: "Bills", value: 100 }
];

const COLORS = [
  "var(--color-primary)",
  "var(--color-accent-teal)",
  "var(--color-warm)",
  "var(--color-success)"
];

export default function CategoryPieChart() {

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-xl p-5">

      <h3 className="text-sm mb-4 text-[var(--color-text-secondary)]">
        Category Breakdown
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            outerRadius={90}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip />

        </PieChart>
      </ResponsiveContainer>

    </div>
  );
}