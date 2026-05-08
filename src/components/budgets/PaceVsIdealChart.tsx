import {
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
    daysInMonth?: number;
    currentDay?: number;

    dailySpending?: {
        day: number;
        amount: number;
    }[];
};

type Formatter = NonNullable<TooltipProps["formatter"]>;

const formatter: Formatter = (value, name) => {
    if (value == null) return ["", name ?? ""];

    return [`₹${Math.round(Number(value))}`, name ?? ""];
};

export default function PaceVsIdealChart({
    totalBudget = 23548,
    daysInMonth = 31,
    currentDay = 12,
    dailySpending = [],
}: Props) {
    const data = useMemo(() => {

        const safeDaysInMonth =
            Math.max(daysInMonth, 1);

        const idealPerDay =
            totalBudget / safeDaysInMonth;

        const spendingMap = new Map(
            dailySpending.map(d => [d.day, d.amount])
        );

        let cumulativeActual = 0;

        return Array.from(
            { length: safeDaysInMonth },
            (_, i) => {

                const day = i + 1;

                const spentToday =
                    spendingMap.get(day) ?? 0;

                cumulativeActual += spentToday;

                return {
                    day,

                    ideal:
                        idealPerDay * day,

                    actual:
                        day <= currentDay
                            ? cumulativeActual
                            : null,
                };
            }
        );

    }, [
        totalBudget,
        daysInMonth,
        currentDay,
        dailySpending,
    ]);

    const latestActual =
        [...data]
            .reverse()
            .find(d => d.actual != null)?.actual ?? 0;

    const latestIdeal =
        [...data]
            .reverse()
            .find(d => d.ideal != null)?.ideal ?? 0;

    const isOver = latestActual > latestIdeal;

    return (
        <div className="w-full h-full relative">

            {/* LEGEND */}
            <div className="absolute -top-3 left-0 flex flex-col gap-1.5 text-[0.7rem] text-[var(--color-text-primary)]">

                <div className="flex items-center gap-1.5">
                    <span className="w-6 border-t-2 border-dashed border-[var(--color-text-primary)] opacity-60" />
                    Ideal Pace
                </div>

                <div className="flex items-center gap-1.5">
                    <span
                        className={`w-6 h-[2px] ${isOver
                            ? "bg-[var(--color-danger)]"
                            : "bg-[var(--color-success)]"
                            }`}
                    />
                    Actual Pace
                </div>

            </div>

            {/* CHART */}
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>

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

                    {/* IDEAL */}
                    <Line
                        type="monotone"
                        dataKey="ideal"
                        stroke="var(--color-text-secondary)"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        dot={false}
                    />

                    {/* AREA */}
                    <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="none"
                        fill={
                            isOver
                                ? "rgba(239,68,68,0.12)"
                                : "rgba(34,197,94,0.12)"
                        }
                        legendType="none"
                        tooltipType="none"
                        connectNulls={false}
                    />

                    {/* ACTUAL */}
                    <Line
                        type="monotone"
                        dataKey="actual"
                        stroke={
                            isOver
                                ? "var(--color-danger)"
                                : "var(--color-success)"
                        }
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 4 }}
                        connectNulls={false}
                    />

                </ComposedChart>
            </ResponsiveContainer>

        </div>
    );
}