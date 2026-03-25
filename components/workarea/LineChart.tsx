// components/dashboard/overview/LineChart.tsx
"use client";

import { TrendingUp, TrendingDown, Users } from "lucide-react";
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
import type { RegistrationChartData } from "@/lib/types/dashboard-analytics";

const chartConfig = {
    registered: {
        label: "New Registrations",
        color: "var(--chart-1)",
    },
    cumulative: {
        label: "Total Members",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

interface ChartLineLabelProps {
    data: RegistrationChartData;
}

export function ChartLineLabel({ data }: ChartLineLabelProps) {
    const {
        year,
        months,
        totalActiveMembers,
        registeredThisYear,
        yearOverYearChange,
    } = data;

    // Transform server data into recharts format
    const chartData = months.map((m) => ({
        month: m.monthName,
        registered: m.totalRegistered,
        cumulative: m.cumulativeTotal,
    }));

    const isPositiveTrend = yearOverYearChange >= 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Member Registrations
                </CardTitle>
                <CardDescription>
                    January – December {year} · {totalActiveMembers} active
                    members total
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 24,
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={35}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="line"
                                    labelFormatter={(value) =>
                                        `${value} ${year}`
                                    }
                                />
                            }
                        />

                        {/* Cumulative total — dashed background line */}
                        <Line
                            dataKey="cumulative"
                            type="monotone"
                            stroke="var(--color-cumulative)"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            dot={false}
                        />

                        {/* New registrations — primary line with labels */}
                        <Line
                            dataKey="registered"
                            type="natural"
                            stroke="var(--color-registered)"
                            strokeWidth={2}
                            dot={{
                                fill: "var(--color-registered)",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        >
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value: number) =>
                                    value > 0 ? value : ""
                                }
                            />
                        </Line>
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    {isPositiveTrend ? (
                        <>
                            Up {yearOverYearChange}% vs last year{" "}
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </>
                    ) : (
                        <>
                            Down {Math.abs(yearOverYearChange)}% vs last year{" "}
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    {registeredThisYear} new member
                    {registeredThisYear !== 1 ? "s" : ""} registered in {year}.
                    Dashed line shows cumulative total.
                </div>
            </CardFooter>
        </Card>
    );
}