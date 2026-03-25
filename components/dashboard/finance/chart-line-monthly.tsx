// components/finance/chart-line-monthly.tsx
"use client";

import { TrendingUp } from "lucide-react";
import {
    CartesianGrid,
    LabelList,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from "recharts";
import { CardFooter } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import type { MonthlyChartData } from "@/lib/types/finance-analytics";

const chartConfig = {
    totalAmount: {
        label: "Total Collected",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

interface ChartLineMonthlyProps {
    data: MonthlyChartData;
}

export function ChartLineMonthly({ data }: ChartLineMonthlyProps) {
    const {
        points,
        totalCollectedYTD,
        averageMonthly,
        bestMonth,
        bestMonthAmount,
        currentYear,
    } = data;

    // Format amounts for the chart label list
    // Only show labels on points with > 0 so the chart stays clean
    const chartData = points.map((p) => ({
        ...p,
        label:
            p.totalAmount > 0
                ? p.totalAmount >= 1000
                    ? `${(p.totalAmount / 1000).toFixed(1)}K`
                    : p.totalAmount.toFixed(0)
                : "",
    }));

    if (totalCollectedYTD === 0) {
        return (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                No payments collected in {currentYear} yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[300px] w-full"
            >
                <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ top: 24, left: 12, right: 12 }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="shortMonth"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
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
                                className="w-[190px]"
                                indicator="line"
                                labelFormatter={(_val, payload) => {
                                    if (payload?.[0]) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className="space-y-0.5">
                                                <p className="font-semibold">
                                                    {d.month} {currentYear}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {d.membersPaid} member
                                                    {d.membersPaid !== 1
                                                        ? "s"
                                                        : ""}{" "}
                                                    paid
                                                </p>
                                            </div>
                                        );
                                    }
                                    return _val;
                                }}
                                formatter={(value) => (
                                    <span>
                                        GH₵{" "}
                                        {(value as number).toLocaleString(
                                            undefined,
                                            { minimumFractionDigits: 2 }
                                        )}
                                    </span>
                                )}
                            />
                        }
                    />
                    <Line
                        dataKey="totalAmount"
                        type="monotone"
                        stroke="var(--color-totalAmount)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-totalAmount)", r: 4 }}
                        activeDot={{ r: 6 }}
                    >
                        <LabelList
                            dataKey="label"
                            position="top"
                            offset={12}
                            className="fill-foreground"
                            fontSize={11}
                        />
                    </Line>
                </LineChart>
            </ChartContainer>

            {/* ── Footer ── */}
            <CardFooter className="flex-col items-start gap-2 text-sm p-0 pt-2">
                <div className="flex gap-2 leading-none font-medium">
                    Best month: {bestMonth} (GH₵{" "}
                    {bestMonthAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                    })}
                    )
                    <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    YTD average: GH₵ {averageMonthly.toFixed(2)}/month •
                    Total: GH₵{" "}
                    {totalCollectedYTD.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                    })}
                </div>
            </CardFooter>
        </div>
    );
}