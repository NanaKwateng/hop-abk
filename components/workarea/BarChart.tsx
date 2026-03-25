// components/dashboard/overview/BarChart.tsx
"use client";

import { TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    XAxis,
    YAxis,
} from "recharts";

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
import { Badge } from "@/components/ui/badge";
import type { PaymentCollectionData } from "@/lib/types/dashboard-analytics";

const chartConfig = {
    membersPaid: {
        label: "Members Paid",
        color: "var(--chart-2)",
    },
    label: {
        color: "var(--background)",
    },
} satisfies ChartConfig;

interface ChartBarLabelCustomProps {
    data: PaymentCollectionData;
}

export function ChartBarLabelCustom({ data }: ChartBarLabelCustomProps) {
    const {
        year,
        months,
        totalYearAmount,
        averageMonthly,
        overallComplianceRate,
        monthOverMonthChange,
    } = data;

    // Transform data for horizontal bar chart
    const chartData = months.map((m) => ({
        month: m.monthName,
        membersPaid: m.membersPaid,
        amountCollected: m.amountCollected,
        totalMembers: m.totalMembers,
        complianceRate:
            m.totalMembers > 0
                ? Math.round((m.membersPaid / m.totalMembers) * 100)
                : 0,
    }));

    const isPositiveTrend = monthOverMonthChange >= 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Collections
                        </CardTitle>
                        <CardDescription>
                            Monthly collection summary for {year}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                            GH₵{" "}
                            {totalYearAmount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                            })}
                        </Badge>
                        <Badge variant="outline">
                            {overallComplianceRate}% compliance
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            right: 48,
                        }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="month"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                            hide
                        />
                        <XAxis dataKey="membersPaid" type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="line"
                                    labelFormatter={(value) =>
                                        `${value} ${year}`
                                    }
                                    formatter={(_value, _name, props) => {
                                        const item = props.payload;
                                        return (
                                            <div className="space-y-1">
                                                <p>
                                                    <span className="font-medium">
                                                        {item.membersPaid}
                                                    </span>{" "}
                                                    of {item.totalMembers}{" "}
                                                    members paid (
                                                    {item.complianceRate}%)
                                                </p>
                                                {item.amountCollected > 0 && (
                                                    <p className="text-muted-foreground">
                                                        Collected: GH₵{" "}
                                                        {item.amountCollected.toFixed(
                                                            2
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    }}
                                />
                            }
                        />
                        <Bar
                            dataKey="membersPaid"
                            layout="vertical"
                            fill="var(--color-membersPaid)"
                            radius={4}
                        >
                            {/* Month name inside the bar */}
                            <LabelList
                                dataKey="month"
                                position="insideLeft"
                                offset={8}
                                className="fill-[--color-label]"
                                fontSize={12}
                            />
                            {/* Count to the right of the bar */}
                            <LabelList
                                dataKey="membersPaid"
                                position="right"
                                offset={8}
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value: number) =>
                                    value > 0 ? `${value} paid` : "0"
                                }
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    {isPositiveTrend ? (
                        <>
                            Collections up {monthOverMonthChange}% vs last
                            month{" "}
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </>
                    ) : (
                        <>
                            Collections down{" "}
                            {Math.abs(monthOverMonthChange)}% vs last month{" "}
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    Average monthly collection: GH₵{" "}
                    {averageMonthly.toFixed(2)}. Showing all 12 months of{" "}
                    {year}.
                </div>
            </CardFooter>
        </Card>
    );
}