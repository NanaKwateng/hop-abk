// components/finance/PieChart.tsx
"use client";

import * as React from "react";
import { Pie, PieChart, Cell } from "recharts";
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
import { Badge } from "@/components/ui/badge";
import { fetchGroupPaymentDistribution } from "@/actions/finance-dashboard";
import type { GroupPaymentChartData } from "@/lib/types/finance-dashboard";

export function ChartPieLabel() {
    const [data, setData] = React.useState<GroupPaymentChartData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setIsLoading(true);
                const result = await fetchGroupPaymentDistribution();
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
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64 mt-1" />
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <Skeleton className="mx-auto h-[250px] w-[250px] rounded-full" />
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card className="flex flex-col">
                <CardContent className="flex items-center justify-center h-[300px]">
                    <p className="text-sm text-muted-foreground">
                        {error ?? "Failed to load group distribution."}
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Build chart config from dynamic group data
    const chartConfig: ChartConfig = {
        paidCount: { label: "Paid" },
    };

    for (const group of data.groups) {
        chartConfig[group.group] = {
            label: group.label,
            color: group.fill,
        };
    }

    // Pie data: each slice is a group, value = paidCount
    // Label shows "X/Y" (paid/total)
    const pieData = data.groups.map((g) => ({
        name: g.group,
        label: g.label,
        value: g.paidCount,
        total: g.totalCount,
        unpaid: g.unpaidCount,
        fill: g.fill,
    }));

    const overallRate =
        data.totalMembersAllGroups > 0
            ? Math.round(
                (data.totalPaidAllGroups / data.totalMembersAllGroups) * 100
            )
            : 0;

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Payment by Group</CardTitle>
                <CardDescription>
                    {data.currentMonth} {data.currentYear} · {data.totalPaidAllGroups}/
                    {data.totalMembersAllGroups} members paid
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
                >
                    <PieChart>
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(_value, _name, item) => {
                                        const payload = item?.payload?.payload;
                                        if (!payload) return null;
                                        return (
                                            <div className="space-y-1">
                                                <p className="font-semibold">
                                                    {payload.label}
                                                </p>
                                                <p className="text-green-600 text-xs">
                                                    Paid: {payload.value} members
                                                </p>
                                                <p className="text-orange-600 text-xs">
                                                    Unpaid: {payload.unpaid} members
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Total: {payload.total} members
                                                </p>
                                            </div>
                                        );
                                    }}
                                />
                            }
                        />
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            label={({ payload, ...props }) => {
                                const d = payload;
                                return (
                                    <text
                                        {...props}
                                        className="fill-foreground text-[11px]"
                                        textAnchor={props.textAnchor}
                                        dominantBaseline="central"
                                    >
                                        {`${d.value}/${d.total}`}
                                    </text>
                                );
                            }}
                            outerRadius={100}
                        >
                            {pieData.map((entry) => (
                                <Cell
                                    key={entry.name}
                                    fill={entry.fill}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {data.groups.map((g) => (
                        <Badge
                            key={g.group}
                            variant="outline"
                            className="text-xs gap-1.5"
                        >
                            <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: g.fill }}
                            />
                            {g.label}: {g.paidCount}/{g.totalCount}
                        </Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm pt-4">
                <div className="flex items-center gap-2 leading-none font-medium">
                    Overall compliance: {overallRate}%
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing payment status for {data.currentMonth} {data.currentYear}
                </div>
            </CardFooter>
        </Card>
    );
}