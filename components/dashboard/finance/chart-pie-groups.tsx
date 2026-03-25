// components/finance/chart-pie-groups.tsx
"use client";

import * as React from "react";
import { Pie, PieChart, Cell } from "recharts";
import { CardFooter } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import type { GroupChartData } from "@/lib/types/finance-analytics";

const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
];

interface ChartPieGroupsProps {
    data: GroupChartData;
}

export function ChartPieGroups({ data }: ChartPieGroupsProps) {
    const { slices, totalMembers, totalPaidMembers, bestGroup, currentYear } =
        data;

    // ── Build chart config dynamically for group colors ──
    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {
            paidMembers: { label: "Paid Members" },
        };

        slices.forEach((slice, i) => {
            config[slice.group] = {
                label: slice.label,
                color: COLORS[i % COLORS.length],
            };
        });

        return config;
    }, [slices]);

    // Assign fill references to each slice
    const chartData = React.useMemo(
        () =>
            slices.map((s, i) => ({
                ...s,
                fill: COLORS[i % COLORS.length],
            })),
        [slices]
    );

    if (slices.length === 0) {
        return (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                No group data available.
            </div>
        );
    }

    const complianceRate =
        totalMembers > 0
            ? Math.round((totalPaidMembers / totalMembers) * 100)
            : 0;

    return (
        <div className="space-y-4">
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[300px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
            >
                <PieChart>
                    <ChartTooltip
                        content={
                            <ChartTooltipContent
                                className="w-[200px]"
                                hideLabel
                                formatter={(value, _name, item) => {
                                    const payload = item?.payload;
                                    return (
                                        <div className="space-y-1">
                                            <p className="font-semibold">
                                                {payload?.label}
                                            </p>
                                            <p className="text-sm text-green-600">
                                                Paid: {payload?.paidMembers}{" "}
                                                members
                                            </p>
                                            <p className="text-sm text-orange-600">
                                                Unpaid:{" "}
                                                {payload?.totalMembers -
                                                    payload?.paidMembers}{" "}
                                                members
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Total: {payload?.totalMembers}{" "}
                                                • GH₵{" "}
                                                {payload?.totalAmount?.toFixed(
                                                    2
                                                )}
                                            </p>
                                        </div>
                                    );
                                }}
                            />
                        }
                    />
                    <Pie
                        data={chartData}
                        dataKey="paidMembers"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        strokeWidth={2}
                        label={({ payload, x, y, textAnchor, dominantBaseline }) => {
                            const s = payload;
                            const labelText = `${s.label}: ${s.paidMembers}/${s.totalMembers}`;
                            return (
                                <text
                                    x={x}
                                    y={y}
                                    textAnchor={textAnchor}
                                    dominantBaseline={dominantBaseline}
                                    className="fill-foreground text-[11px]"
                                >
                                    {labelText}
                                </text>
                            );
                        }}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={entry.group}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>

            {/* ── Footer ── */}
            <CardFooter className="flex-col items-center gap-2 text-sm p-0 pt-2">
                <div className="flex gap-2 leading-none font-medium">
                    Highest participation: {bestGroup}
                </div>
                <div className="leading-none text-muted-foreground text-center">
                    Overall: {totalPaidMembers}/{totalMembers} members ({complianceRate}%) made payments in {currentYear}
                </div>
            </CardFooter>
        </div>
    );
}
