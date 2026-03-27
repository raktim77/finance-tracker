import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    Legend
} from "recharts";

import type { MonthlyBarPoint } from "../data/types";

type QuarterlyBarChartProps = {
    barData: MonthlyBarPoint[];
};

export function QuarterlyBarChart({ barData }: QuarterlyBarChartProps) {
    return (<div className="lg:col-span-2 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm"> <div className="flex flex-col mb-8"> <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight text-left">
        Transactional Velocity </h3> <p className="text-xs text-[var(--color-text-secondary)] text-left">
            Income vs Expense comparison </p> </div>

        <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={barData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    barGap={6}
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
                        cursor={{ fill: "var(--color-accent-soft)", radius: 12 }}
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

                    {/* Optional Legend */}
                    <Legend
                        verticalAlign="top"
                        align="right"
                        height={20}
                        content={() => (
                            <div className="flex gap-4 justify-end text-xs my-[-20px] mx-[-10px]">
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                                    <span>Income</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                                    <span>Expense</span>
                                </div>
                            </div>
                        )}
                    />

                    {/* INCOME */}
                    <Bar
                        dataKey="income"
                        fill="#22c55e"
                        radius={[8, 8, 0, 0]}
                        barSize={16}
                    />

                    {/* EXPENSE */}
                    <Bar
                        dataKey="expense"
                        fill="#ef4444"
                        radius={[8, 8, 0, 0]}
                        barSize={16}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>

    );
}
