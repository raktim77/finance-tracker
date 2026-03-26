import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid
} from "recharts";

import type { MonthlyBarPoint } from "../data/types";

type QuarterlyBarChartProps = {
    barData: MonthlyBarPoint[];
};

export function QuarterlyBarChart({ barData }: QuarterlyBarChartProps) {
    return (<div className="lg:col-span-2 rounded-[2.5rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm"> <div className="flex flex-col mb-8"> <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight text-left">
        Quarterly Velocity </h3> <p className="text-xs text-[var(--color-text-secondary)] text-left">
            Income vs Expense comparison </p> </div>

        <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={barData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    {/* Grid */}
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--border)"
                        opacity={0.3}
                    />

                    {/* X Axis */}
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fill: "var(--color-text-secondary)",
                            fontSize: 10,
                            fontWeight: "bold"
                        }}
                        dy={10}
                    />

                    {/* Y Axis */}
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }}
                        tickFormatter={(v) => `₹${v / 1000}k`}
                    />

                    {/* Tooltip */}
                    <Tooltip
                        cursor={{
                            fill: "var(--color-accent-soft)",
                            radius: 12
                        }}
                        formatter={(value, name) => {
                            const num = typeof value === "number" ? value : 0;

                            return [
                                `₹${num.toLocaleString()}`,
                                name === "income" ? "Income" : "Expense",
                            ];
                        }}
                        contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid var(--border)",
                            background: "var(--color-surface-elevated)"
                        }}
                    />

                    {/* EXPENSE (BOTTOM) */}
                    <Bar
                        dataKey="expense"
                        stackId="a"
                        fill="#ef4444" // red-500
                        radius={[0, 0, 8, 8]}
                        barSize={36}
                    />

                    {/* INCOME (TOP) */}
                    <Bar
                        dataKey="income"
                        stackId="a"
                        fill="#22c55e" // green-500
                        radius={[8, 8, 0, 0]}
                        barSize={36}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>

    );
}
