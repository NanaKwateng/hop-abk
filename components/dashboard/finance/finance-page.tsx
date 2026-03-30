// components/finance/finance-page.tsx
"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, PieChart } from "lucide-react";
import { ChartBarYearly } from "./chart-bar-yearly";
import { ChartLineMonthly } from "./chart-line-monthly";
import { ChartPieGroups } from "./chart-pie-groups";
import {
    PaidMembersAvatar,
    MembersProgressTable,
} from "./paid-members-view";
import type {
    YearlyChartData,
    MonthlyChartData,
    GroupChartData,
    MembersProgressData,
} from "@/lib/types/finance-analytics";
import { cn } from "@/lib/utils";

interface FinancePageProps {
    yearlyData: YearlyChartData;
    monthlyData: MonthlyChartData;
    groupData: GroupChartData;
    membersData: MembersProgressData;
}

export function FinancePage({
    yearlyData,
    monthlyData,
    groupData,
    membersData,
}: FinancePageProps) {
    return (
        <div className="space-y-6">
            {/* ── Page header ── */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Finance & Payments
                </h1>
                <p className="text-sm text-muted-foreground">
                    Track payment collection, member compliance, and group
                    performance.
                </p>
            </div>

            {/* ── Summary cards ── */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    label="Collected This Year"
                    value={`GH₵ ${monthlyData.totalCollectedYTD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    description={`Avg. GH₵ ${monthlyData.averageMonthly.toFixed(2)}/month`}
                    trend={yearlyData.yearOverYearChange}
                    variant="amber"
                />
                <SummaryCard
                    label="Total Members"
                    value={membersData.totalCount.toString()}
                    description={`${membersData.fullyPaidCount} fully paid this year`}
                    variant="indigo"
                />
                <SummaryCard
                    label="Compliance Rate"
                    value={`${membersData.totalCount > 0 ? Math.round((membersData.fullyPaidCount / membersData.totalCount) * 100) : 0}%`}
                    description={`Through ${membersData.currentMonthName}`}
                    variant="violet"
                />
                <SummaryCard
                    label="Groups Active"
                    value={groupData.slices.length.toString()}
                    description={`Best: ${groupData.bestGroup}`}
                    variant="coral"
                />
            </div>

            {/* ── Tabs ── */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="overview" className="gap-2">
                        <BarChart3 className="h-4 w-4 hidden sm:inline" />
                        <span>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2">
                        <TrendingUp className="h-4 w-4 hidden sm:inline" />
                        <span>Analytics</span>
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="gap-1.5">
                        <PaidMembersAvatar
                            members={membersData.fullyPaidMembers}
                        />
                    </TabsTrigger>
                    <TabsTrigger value="groups" className="gap-2">
                        <PieChart className="h-4 w-4 hidden sm:inline" />
                        <span className="hidden sm:inline">Groups</span>
                        <span className="sm:hidden">Grp</span>
                    </TabsTrigger>
                </TabsList>

                {/* ── Overview: Bar Chart ── */}
                <TabsContent value="overview" className="mt-6">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Yearly Payment Overview</CardTitle>
                            <CardDescription>
                                Total payments collected across all years.
                                The highlighted bar shows{" "}
                                {new Date().getFullYear()}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartBarYearly data={yearlyData} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Analytics: Line Chart ── */}
                <TabsContent value="analytics" className="mt-6">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Monthly Payment Trends</CardTitle>
                            <CardDescription>
                                Monthly collection for{" "}
                                {monthlyData.currentYear}. Track which
                                months have the highest collection rates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartLineMonthly data={monthlyData} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Reports: Members Progress Table ── */}
                <TabsContent value="reports" className="mt-6">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Member Payment Progress</CardTitle>
                            <CardDescription>
                                {membersData.fullyPaidCount} out of{" "}
                                {membersData.totalCount} members are fully
                                paid through{" "}
                                {membersData.currentMonthName}{" "}
                                {membersData.currentYear}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MembersProgressTable data={membersData} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Groups: Pie Chart ── */}
                <TabsContent value="groups" className="mt-6">
                    <Card className="border-none shadow-md">
                        <CardHeader className="items-center">
                            <CardTitle>Group Payment Distribution</CardTitle>
                            <CardDescription>
                                Payment participation by member group for{" "}
                                {groupData.currentYear}. Labels show paid
                                vs total members.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartPieGroups data={groupData} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ── Small summary card ──

const VARIANTS = {
    amber: "bg-[#FBBF24] text-[#451a03]",
    indigo: "bg-[#6366F1] text-white",
    violet: "bg-[#A78BFA] text-white",
    coral: "bg-[#FB7185] text-white",
} as const;

function SummaryCard({
    label,
    value,
    description,
    trend,
    variant = "indigo"
}: {
    label: string;
    value: string;
    description: string;
    trend?: number;
    variant?: keyof typeof VARIANTS;
}) {
    return (
        <Card className={cn("border-none shadow-sm", VARIANTS[variant])}>
            <CardContent className="p-4">
                <p className="text-xs font-medium opacity-80">
                    {label}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-xl font-bold tabular-nums">{value}</p>
                    {trend !== undefined && trend !== 0 && (
                        <span className="text-xs font-medium bg-white/20 px-1 rounded">
                            {trend > 0 ? "+" : ""}{trend}%
                        </span>
                    )}
                </div>
                <p className="text-xs mt-0.5 opacity-80">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}