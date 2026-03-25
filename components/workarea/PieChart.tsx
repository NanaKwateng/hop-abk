// components/dashboard/overview/PieChart.tsx
"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { type PieSectorDataItem } from "recharts/types/polar/Pie";
import { Users } from "lucide-react";

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
    ChartStyle,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { GroupDistributionData } from "@/lib/types/dashboard-analytics";

// ── Color assignments for each group ──
// These map to CSS variables in your theme.
const GROUP_COLORS: Record<string, string> = {
    youth: "var(--chart-1)",
    men: "var(--chart-2)",
    women: "var(--chart-3)",
    children: "var(--chart-4)",
    seniors: "var(--chart-5)",
    young_adults: "var(--chart-1)",
    couples: "var(--chart-2)",
    singles: "var(--chart-3)",
    unassigned: "var(--muted)",
};

interface ChartPieInteractiveProps {
    data: GroupDistributionData;
}

export function ChartPieInteractive({ data }: ChartPieInteractiveProps) {
    const chartId = "pie-group-distribution";

    // Build ChartConfig dynamically from actual groups in the data.
    // If you add a new group to the DB, it shows up automatically.
    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {
            members: {
                label: "Members",
            },
        };

        data.groups.forEach((g) => {
            config[g.group] = {
                label: g.label,
                color: GROUP_COLORS[g.group] || "var(--chart-4)",
            };
        });

        return config;
    }, [data.groups]);

    // Transform data for recharts Pie component
    const pieData = React.useMemo(
        () =>
            data.groups.map((g) => ({
                group: g.group,
                count: g.count,
                fill: GROUP_COLORS[g.group] || "var(--chart-4)",
            })),
        [data.groups]
    );

    // Track which group is selected in the dropdown
    const [activeGroup, setActiveGroup] = React.useState(
        data.groups[0]?.group ?? ""
    );

    // Find the index of the active group for the pie highlight
    const activeIndex = React.useMemo(
        () => pieData.findIndex((item) => item.group === activeGroup),
        [activeGroup, pieData]
    );

    // Active group data for center label
    const activeGroupData = data.groups.find((g) => g.group === activeGroup);

    // Percentage for footer
    const activePercentage =
        activeGroupData && data.totalMembers > 0
            ? Math.round((activeGroupData.count / data.totalMembers) * 100)
            : 0;

    return (
        <Card data-chart={chartId} className="flex flex-col">
            <ChartStyle id={chartId} config={chartConfig} />

            <CardHeader className="flex-row items-start space-y-0 pb-0">
                <div className="grid gap-1">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Group Distribution
                    </CardTitle>
                    <CardDescription>
                        {data.totalMembers} total members across{" "}
                        {data.groups.length} groups
                    </CardDescription>
                </div>

                {/* Group selector dropdown */}
                <Select value={activeGroup} onValueChange={setActiveGroup}>
                    <SelectTrigger
                        className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
                        aria-label="Select a group"
                    >
                        <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                        {data.groups.map((g) => (
                            <SelectItem
                                key={g.group}
                                value={g.group}
                                className="rounded-lg [&_span]:flex"
                            >
                                <div className="flex items-center gap-2 text-xs">
                                    <span
                                        className="flex h-3 w-3 shrink-0 rounded-xs"
                                        style={{
                                            backgroundColor:
                                                GROUP_COLORS[g.group] ||
                                                "var(--chart-4)",
                                        }}
                                    />
                                    {g.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>

            <CardContent className="flex flex-1 justify-center pb-0">
                <ChartContainer
                    id={chartId}
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-w-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(value, name) => {
                                        const group = data.groups.find(
                                            (g) => g.group === name
                                        );
                                        const pct =
                                            data.totalMembers > 0
                                                ? Math.round(
                                                    ((value as number) /
                                                        data.totalMembers) *
                                                    100
                                                )
                                                : 0;
                                        return (
                                            <span>
                                                {group?.label || name}:{" "}
                                                {(
                                                    value as number
                                                ).toLocaleString()}{" "}
                                                members ({pct}%)
                                            </span>
                                        );
                                    }}
                                />
                            }
                        />
                        <Pie
                            data={pieData}
                            dataKey="count"
                            nameKey="group"
                            innerRadius={60}
                            strokeWidth={5}
                            activeIndex={activeIndex}
                            activeShape={({
                                outerRadius = 0,
                                ...props
                            }: PieSectorDataItem) => (
                                <g>
                                    <Sector
                                        {...props}
                                        outerRadius={outerRadius + 10}
                                    />
                                    <Sector
                                        {...props}
                                        outerRadius={outerRadius + 25}
                                        innerRadius={outerRadius + 12}
                                    />
                                </g>
                            )}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (
                                        viewBox &&
                                        "cx" in viewBox &&
                                        "cy" in viewBox
                                    ) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {activeGroupData?.count.toLocaleString() ??
                                                        0}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={
                                                        (viewBox.cy || 0) + 24
                                                    }
                                                    className="fill-muted-foreground"
                                                >
                                                    {activeGroupData?.label ??
                                                        "Members"}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>

            <CardFooter className="flex-col gap-2 text-sm pt-4">
                <div className="flex items-center gap-2 leading-none font-medium">
                    {activeGroupData?.label} makes up {activePercentage}% of
                    all members
                </div>
                <div className="leading-none text-muted-foreground">
                    Distribution based on {data.totalMembers} currently
                    registered members
                </div>
            </CardFooter>
        </Card>
    );
}