import {
    // LineChart,
    Line,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    type TooltipProps,
    Area,
    ComposedChart,
} from "recharts";
import { useMemo } from "react";


type Props = {
    totalBudget?: number;
    totalSpent?: number;
    daysInMonth?: number;
    currentDay?: number;
};

type Formatter = NonNullable<TooltipProps["formatter"]>;

const formatter: Formatter = (value, name) => {
    if (value == null) return ["", name ?? ""];

    return [`₹${Math.round(Number(value))}`, name ?? ""];
};

export default function PaceVsIdealChart({
    totalBudget = 23548,
    totalSpent = 5520,
    daysInMonth = 31,
    currentDay = 12,
}: Props) {
    const data = useMemo(() => {
        const idealPerDay = totalBudget / daysInMonth;

        let cumulativeActual = 0;

        const raw = Array.from({ length: currentDay }, (_, i) => {
            const variance = 0.6 + Math.random() * 0.8;
            const daily = (totalSpent / currentDay) * variance;

            cumulativeActual += daily;

            return {
                day: i + 1,
                actual: cumulativeActual,
                ideal: idealPerDay * (i + 1),
            };
        });

        // normalize actual to match totalSpent exactly
        const scale = totalSpent / cumulativeActual;

        return raw.map(d => ({
            ...d,
            actual: d.actual * scale,
        }));
    }, [totalBudget, totalSpent, daysInMonth, currentDay]);

    const isOver =
        data[data.length - 1].actual > data[data.length - 1].ideal;

    return (
        <div className="w-full h-full relative">

            {/* LEGEND (TOP LEFT) */}
            <div className="absolute -top-3 left-0 flex flex-col gap-1.5 text-[0.7rem] text-[var(--color-text-primary)] z-10">

                <div className="flex items-center gap-1.5">
                    <span className="w-6 border-t-2 border-dashed border-[var(--color-text-primary)] opacity-60" />
                    Ideal Pace
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="w-6 h-[2px] bg-[var(--color-success)]" />
                    Actual Pace
                </div>

            </div>

            {/* CHART */}
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>  {/* ← was LineChart */}
                    <CartesianGrid
                        vertical={false}
                        stroke="var(--border)"
                        strokeOpacity={0.3}
                    />
                    <XAxis
                        dataKey="day"
                        tick={false}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={false}
                        contentStyle={{
                            background: "var(--color-surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "10px",
                            fontSize: "12px",
                        }}
                        formatter={formatter}
                    />
                    {/* Ideal */}
                    <Line
                        type="monotone"
                        dataKey="ideal"
                        stroke="var(--color-text-secondary)"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        dot={false}
                    />
                    {/* AREA FILL — must come before the actual Line so line renders on top */}
                    <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="none"
                        fill={isOver ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)"}
                        legendType="none"
                        tooltipType="none"
                    />
                    {/* Actual line on top */}
                    <Line
                        type="monotone"
                        dataKey="actual"
                        stroke={isOver ? "var(--color-danger)" : "var(--color-success)"}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                </ComposedChart>  {/* ← was LineChart */}
            </ResponsiveContainer>

        </div>
    );
}