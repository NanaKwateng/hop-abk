// components/finance/chart-bar-yearly.tsx
"use client";

import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis, YAxis } from "recharts";
import {
    CardFooter,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import type { YearlyChartData } from "@/lib/types/finance-analytics";

interface ChartBarYearlyProps {
    data: YearlyChartData;
}

export function ChartBarYearly({ data }: ChartBarYearlyProps) {
    const { bars, currentYearIndex, yearOverYearChange } = data;

    // ── Build chart config dynamically from year data ──
    // Each year gets its own color in the config so ChartContainer
    // sets --color-YEAR CSS variables for the fill references.

    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {
            totalAmount: { label: "Total Collected (GH₵)" },
        };

        bars.forEach((bar, i) => {
            const isCurrentYear =
                bar.year === new Date().getFullYear().toString();
            config[bar.year] = {
                label: bar.year,
                color: isCurrentYear
                    ? "var(--chart-1)"
                    : CHART_COLORS[i % CHART_COLORS.length],
            };
        });

        return config;
    }, [bars]);

    if (bars.length === 0) {
        return (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                No payment data available yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                <BarChart accessibilityLayer data={bars}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="year"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        width={60}
                        tickFormatter={(value) =>
                            value >= 1000
                                ? `GH₵${(value / 1000).toFixed(0)}K`
                                : `GH₵${value}`
                        }
                    />
                    <ChartTooltip
                        cursor={false}
                        content={
                            <ChartTooltipContent
                                className="w-[200px]"
                                hideLabel
                                formatter={(value, _name, item) => {
                                    const payload = item?.payload;
                                    return (
                                        <div className="space-y-1">
                                            <p className="font-semibold">
                                                {payload?.year}
                                            </p>
                                            <p className="text-sm">
                                                GH₵{" "}
                                                {(
                                                    value as number
                                                ).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {payload?.totalPayments}{" "}
                                                payments •{" "}
                                                {payload?.memberCount} members
                                            </p>
                                        </div>
                                    );
                                }}
                            />
                        }
                    />
                    <Bar
                        dataKey="totalAmount"
                        strokeWidth={2}
                        radius={[8, 8, 0, 0]}
                        activeIndex={currentYearIndex}
                        activeBar={({ ...props }) => (
                            <Rectangle
                                {...props}
                                fillOpacity={0.9}
                                stroke={props.payload.fill}
                                strokeDasharray={4}
                                strokeDashoffset={4}
                            />
                        )}
                    />
                </BarChart>
            </ChartContainer>

            {/* ── Footer with trend ── */}
            <CardFooter className="flex-col items-start gap-2 text-sm p-0 pt-2">
                <div className="flex gap-2 leading-none font-medium">
                    {yearOverYearChange >= 0 ? (
                        <>
                            Trending up by {yearOverYearChange}% vs last
                            year
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </>
                    ) : (
                        <>
                            Down {Math.abs(yearOverYearChange)}% vs last
                            year
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing payment totals across {bars.length} year
                    {bars.length !== 1 ? "s" : ""}
                </div>
            </CardFooter>
        </div>
    );
}

// Colors for non-active years (cycle through these)
const CHART_COLORS = [
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-2)",
];