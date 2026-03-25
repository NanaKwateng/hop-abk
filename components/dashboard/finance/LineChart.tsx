// components/finance/LineChart.tsx
"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMonthlyPaymentTotals } from "@/actions/finance-dashboard";
import type { MonthlyPaymentChartData } from "@/lib/types/finance-dashboard";

const chartConfig = {
    totalAmount: {
        label: "Amount Collected",
        color: "var(--chart-1)",
    },
    membersPaid: {
        label: "Members Paid",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

export function ChartLineLabel() {
    const [data, setData] = React.useState<MonthlyPaymentChartData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setIsLoading(true);
                const result = await fetchMonthlyPaymentTotals();
                if (!cancelled) setData(result);
            } catch (err: any) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64 mt-1" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-[300px]">
                    <p className="text-sm text-muted-foreground">
                        {error ?? "Failed to load monthly payment data."}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const TrendIcon =
        data.monthOverMonthChange > 0
            ? TrendingUp
            : data.monthOverMonthChange < 0
                ? TrendingDown
                : Minus;

    const trendColor =
        data.monthOverMonthChange > 0
            ? "text-green-600"
            : data.monthOverMonthChange < 0
                ? "text-red-600"
                : "text-muted-foreground";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Payment Tracking — {data.year}</CardTitle>
                <CardDescription>
                    Total dues collected per month across all members ·{" "}
                    GH₵ {data.totalYearAmount.toLocaleString("en-GH", {
                        minimumFractionDigits: 2,
                    })}{" "}
                    year-to-date
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={data.months}
                        margin={{ top: 24, left: 12, right: 12 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="monthName"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={60}
                            tickFormatter={(value) =>
                                `GH₵${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
                            }
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="line"
                                    labelFormatter={(_value, payload) => {
                                        if (payload && payload.length > 0) {
                                            const item = payload[0]
                                                ?.payload as (typeof data.months)[0];
                                            return (
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        {item.monthName} {data.year}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.membersPaid}/{item.totalMembers}{" "}
                                                        members paid
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return _value;
                                    }}
                                    formatter={(value) => (
                                        <span>
                                            GH₵{" "}
                                            {(value as number).toLocaleString(
                                                "en-GH",
                                                { minimumFractionDigits: 2 }
                                            )}
                                        </span>
                                    )}
                                />
                            }
                        />
                        <Line
                            dataKey="totalAmount"
                            type="natural"
                            stroke="var(--color-totalAmount)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-totalAmount)" }}
                            activeDot={{ r: 6 }}
                        >
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={11}
                                formatter={(value: number) =>
                                    value > 0
                                        ? `₵${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
                                        : ""
                                }
                            />
                        </Line>
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className={`flex gap-2 leading-none font-medium ${trendColor}`}>
                    {data.monthOverMonthChange > 0 && "+"}
                    {data.monthOverMonthChange}% vs last month
                    <TrendIcon className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Average monthly: GH₵{" "}
                    {data.averageMonthly.toLocaleString("en-GH", {
                        minimumFractionDigits: 2,
                    })}
                </div>
            </CardFooter>
        </Card>
    );
}