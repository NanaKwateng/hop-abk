// components/users/payment-analytics.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    IoCheckmarkCircleOutline,
    IoCloseCircleOutline,
    IoFlameOutline,
    IoWalletOutline,
    IoCalendarOutline,
    IoTrendingUpOutline,
    IoBarChartOutline,
} from "react-icons/io5";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import type { PaymentAnalytics } from "@/lib/types/payments";
import { cn } from "@/lib/utils";

const SPRING_SNAPPY = { type: "spring" as const, stiffness: 400, damping: 30 };
const SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 25 };

interface MonthlyDataPoint {
    month: string;
    fullMonth: string;
    cumulativePaid: number;
    amount: number;
    isPaid: boolean;
}

interface YearlyDataPoint {
    year: string;
    totalPaid: number;
    totalUnpaid: number;
    totalAmount: number;
}

const chartConfig = {
    monthly: {
        label: "Monthly Progress",
        color: "var(--chart-1)",
    },
    yearly: {
        label: "Yearly History",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

interface PaymentAnalyticsViewProps {
    memberName: string;
    analytics: PaymentAnalytics;
    isAdminView?: boolean;
}

export function PaymentAnalyticsView({
    memberName,
    analytics,
    isAdminView = false,
}: PaymentAnalyticsViewProps) {
    const {
        currentYear,
        previousYears,
        overallPaidPercentage,
        totalAllTimeAmount,
        streakMonths,
    } = analytics;

    const [activeTab, setActiveTab] = React.useState("overview");

    // Monthly chart data
    const monthlyChartData: MonthlyDataPoint[] = React.useMemo(() => {
        let cumulative = 0;
        return currentYear.months.map((m) => {
            if (m.status === "paid") cumulative += 1;
            return {
                month: m.monthName.slice(0, 3),
                fullMonth: m.monthName,
                cumulativePaid: cumulative,
                amount: m.amount ?? 0,
                isPaid: m.status === "paid",
            };
        });
    }, [currentYear.months]);

    // Yearly chart data
    const yearlyChartData: YearlyDataPoint[] = React.useMemo(() => {
        const allYears = [
            ...previousYears.map((y) => ({
                year: y.year.toString(),
                totalPaid: y.totalPaid,
                totalUnpaid: y.totalUnpaid,
                totalAmount: y.totalAmount,
            })),
            {
                year: currentYear.year.toString(),
                totalPaid: currentYear.totalPaid,
                totalUnpaid: currentYear.totalUnpaid,
                totalAmount: currentYear.totalAmount,
            },
        ];
        return allYears.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    }, [currentYear, previousYears]);

    const totalYearlyPaid = yearlyChartData.reduce(
        (sum, y) => sum + y.totalPaid,
        0
    );

    // Card configs with vibrant solid backgrounds and high-contrast text
    const summaryCards = [
        {
            icon: IoCheckmarkCircleOutline,
            label: "Paid",
            value: `${currentYear.totalPaid}/12`,
            sub: `${Math.round((currentYear.totalPaid / 12) * 100)}%`,
            bg: "bg-emerald-50 dark:bg-emerald-950/40",
            border: "border-emerald-200 dark:border-emerald-800/50",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            valueColor: "text-emerald-900 dark:text-emerald-100",
            labelColor: "text-emerald-700 dark:text-emerald-300",
            subColor: "text-emerald-600/70 dark:text-emerald-400/70",
        },
        {
            icon: IoCloseCircleOutline,
            label: "Unpaid",
            value: currentYear.totalUnpaid.toString(),
            sub: "remaining",
            bg: "bg-orange-50 dark:bg-orange-950/40",
            border: "border-orange-200 dark:border-orange-800/50",
            iconColor: "text-orange-600 dark:text-orange-400",
            valueColor: "text-orange-900 dark:text-orange-100",
            labelColor: "text-orange-700 dark:text-orange-300",
            subColor: "text-orange-600/70 dark:text-orange-400/70",
        },
        {
            icon: IoFlameOutline,
            label: "Streak",
            value: `${streakMonths}`,
            sub: streakMonths > 0 ? "months" : "no streak",
            bg: "bg-rose-50 dark:bg-rose-950/40",
            border: "border-rose-200 dark:border-rose-800/50",
            iconColor: "text-rose-600 dark:text-rose-400",
            valueColor: "text-rose-900 dark:text-rose-100",
            labelColor: "text-rose-700 dark:text-rose-300",
            subColor: "text-rose-600/70 dark:text-rose-400/70",
        },
        ...(isAdminView
            ? [
                {
                    icon: IoWalletOutline,
                    label: "Total",
                    value: `GH₵${totalAllTimeAmount.toFixed(0)}`,
                    sub: `${overallPaidPercentage}%`,
                    bg: "bg-violet-50 dark:bg-violet-950/40",
                    border: "border-violet-200 dark:border-violet-800/50",
                    iconColor: "text-violet-600 dark:text-violet-400",
                    valueColor: "text-violet-900 dark:text-violet-100",
                    labelColor: "text-violet-700 dark:text-violet-300",
                    subColor: "text-violet-600/70 dark:text-violet-400/70",
                },
            ]
            : [
                {
                    icon: IoTrendingUpOutline,
                    label: "Rate",
                    value: `${overallPaidPercentage}%`,
                    sub: "compliance",
                    bg: "bg-blue-50 dark:bg-blue-950/40",
                    border: "border-blue-200 dark:border-blue-800/50",
                    iconColor: "text-blue-600 dark:text-blue-400",
                    valueColor: "text-blue-900 dark:text-blue-100",
                    labelColor: "text-blue-700 dark:text-blue-300",
                    subColor: "text-blue-600/70 dark:text-blue-400/70",
                },
            ]),
    ];

    return (
        <div className="space-y-5">
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 gap-3">
                {summaryCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ ...SPRING_GENTLE, delay: i * 0.06 }}
                    >
                        <div
                            className={cn(
                                "rounded-2xl border p-4",
                                card.bg,
                                card.border
                            )}
                        >
                            <div className="flex items-center gap-2 mb-2.5">
                                <card.icon
                                    className={cn("h-4 w-4", card.iconColor)}
                                />
                                <span
                                    className={cn(
                                        "text-[10px] font-semibold uppercase tracking-wider",
                                        card.labelColor
                                    )}
                                >
                                    {card.label}
                                </span>
                            </div>
                            <p
                                className={cn(
                                    "text-2xl font-bold tracking-tight",
                                    card.valueColor
                                )}
                            >
                                {card.value}
                            </p>
                            <p
                                className={cn(
                                    "text-[11px] font-medium mt-0.5",
                                    card.subColor
                                )}
                            >
                                {card.sub}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Tabbed Content ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_GENTLE, delay: 0.3 }}
            >
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="w-full max-w-sm h-10 rounded-2xl bg-muted/60 p-1 grid grid-cols-3 mt-12">
                        <TabsTrigger
                            value="overview"
                            className="rounded-xl text-xs font-semibold data-[state=active]:shadow-sm gap-1.5"
                        >
                            <IoBarChartOutline className="h-3.5 w-3.5" />
                            This Year
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="rounded-xl text-xs font-semibold data-[state=active]:shadow-sm gap-1.5"
                        >
                            <IoCalendarOutline className="h-3.5 w-3.5" />
                            History
                        </TabsTrigger>
                        <TabsTrigger
                            value="insights"
                            className="rounded-xl text-xs font-semibold data-[state=active]:shadow-sm gap-1.5"
                        >
                            <IoTrendingUpOutline className="h-3.5 w-3.5" />
                            Insights
                        </TabsTrigger>
                    </TabsList>

                    {/* ── TAB: This Year ── */}
                    <TabsContent value="overview" className="mt-4 space-y-4">
                        {/* Month grid */}
                        <div className="grid grid-cols-6 gap-1.5">
                            {currentYear.months.map((m, i) => (
                                <motion.div
                                    key={m.month}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        ...SPRING_SNAPPY,
                                        delay: i * 0.03,
                                    }}
                                    className={cn(
                                        "flex flex-col items-center justify-center py-2 rounded-xl text-[10px] font-medium transition-colors",
                                        m.status === "paid"
                                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700/50"
                                            : "bg-muted/30 text-muted-foreground border border-transparent"
                                    )}
                                >
                                    <span>{m.monthName.slice(0, 3)}</span>
                                    {m.status === "paid" && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                ...SPRING_SNAPPY,
                                                delay: 0.3 + i * 0.03,
                                            }}
                                        >
                                            <IoCheckmarkCircleOutline className="h-3 w-3 mt-0.5" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Chart */}
                        <Card className="rounded-2xl border-muted/60">
                            <CardHeader className="pb-2 px-4 pt-4">
                                <CardTitle className="text-sm font-semibold">
                                    Cumulative Progress
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {currentYear.year} — line rises with each
                                    payment
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-2 pb-4">
                                <ChartContainer
                                    config={chartConfig}
                                    className="aspect-auto h-[200px] w-full"
                                >
                                    <LineChart
                                        accessibilityLayer
                                        data={monthlyChartData}
                                        margin={{
                                            left: 8,
                                            right: 8,
                                            top: 8,
                                        }}
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            strokeDasharray="3 3"
                                            className="stroke-muted/40"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tick={{ fontSize: 10 }}
                                        />
                                        <YAxis
                                            domain={[0, 12]}
                                            ticks={[0, 3, 6, 9, 12]}
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={4}
                                            width={24}
                                            tick={{ fontSize: 10 }}
                                        />
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    className="w-[160px] rounded-xl"
                                                    nameKey="monthly"
                                                    labelFormatter={(
                                                        _value,
                                                        payload
                                                    ) => {
                                                        if (
                                                            payload &&
                                                            payload.length > 0
                                                        ) {
                                                            const data =
                                                                payload[0]
                                                                    ?.payload as MonthlyDataPoint;
                                                            return (
                                                                <div className="space-y-0.5">
                                                                    <p className="font-semibold text-xs">
                                                                        {
                                                                            data.fullMonth
                                                                        }{" "}
                                                                        {
                                                                            currentYear.year
                                                                        }
                                                                    </p>
                                                                    <p
                                                                        className={cn(
                                                                            "text-[10px] font-semibold",
                                                                            data.isPaid
                                                                                ? "text-emerald-600"
                                                                                : "text-red-500"
                                                                        )}
                                                                    >
                                                                        {data.isPaid
                                                                            ? "✓ Paid"
                                                                            : "✗ Unpaid"}
                                                                    </p>
                                                                    {data.amount >
                                                                        0 && (
                                                                            <p className="text-[10px] text-muted-foreground">
                                                                                GH₵{" "}
                                                                                {data.amount.toFixed(
                                                                                    2
                                                                                )}
                                                                            </p>
                                                                        )}
                                                                </div>
                                                            );
                                                        }
                                                        return _value;
                                                    }}
                                                    formatter={(value) => (
                                                        <span className="text-xs">
                                                            {value as number}
                                                            /12 paid
                                                        </span>
                                                    )}
                                                />
                                            }
                                        />
                                        <Line
                                            dataKey="cumulativePaid"
                                            type="monotone"
                                            stroke="var(--color-monthly)"
                                            strokeWidth={2.5}
                                            dot={(props: any) => {
                                                const { cx, cy, payload } =
                                                    props;
                                                return (
                                                    <circle
                                                        key={cx}
                                                        cx={cx}
                                                        cy={cy}
                                                        r={3.5}
                                                        fill={
                                                            payload.isPaid
                                                                ? "hsl(142, 71%, 45%)"
                                                                : "hsl(var(--muted))"
                                                        }
                                                        stroke={
                                                            payload.isPaid
                                                                ? "hsl(142, 71%, 35%)"
                                                                : "hsl(var(--muted-foreground))"
                                                        }
                                                        strokeWidth={1.5}
                                                    />
                                                );
                                            }}
                                            activeDot={{
                                                r: 5,
                                                fill: "var(--color-monthly)",
                                            }}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── TAB: History ── */}
                    <TabsContent value="history" className="mt-4 space-y-4">
                        {yearlyChartData.length > 1 && (
                            <Card className="rounded-2xl border-muted/60">
                                <CardHeader className="pb-2 px-4 pt-4">
                                    <CardTitle className="text-sm font-semibold">
                                        Year-over-Year
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        {totalYearlyPaid} total months paid
                                        across all years
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-2 pb-4">
                                    <ChartContainer
                                        config={chartConfig}
                                        className="aspect-auto h-[200px] w-full"
                                    >
                                        <LineChart
                                            accessibilityLayer
                                            data={yearlyChartData}
                                            margin={{
                                                left: 8,
                                                right: 8,
                                                top: 8,
                                            }}
                                        >
                                            <CartesianGrid
                                                vertical={false}
                                                strokeDasharray="3 3"
                                                className="stroke-muted/40"
                                            />
                                            <XAxis
                                                dataKey="year"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                                tick={{ fontSize: 10 }}
                                            />
                                            <YAxis
                                                domain={[0, 12]}
                                                ticks={[0, 3, 6, 9, 12]}
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={4}
                                                width={24}
                                                tick={{ fontSize: 10 }}
                                            />
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent
                                                        className="w-[160px] rounded-xl"
                                                        nameKey="yearly"
                                                        labelFormatter={(
                                                            _value,
                                                            payload
                                                        ) => {
                                                            if (
                                                                payload &&
                                                                payload.length >
                                                                0
                                                            ) {
                                                                const data =
                                                                    payload[0]
                                                                        ?.payload as YearlyDataPoint;
                                                                return (
                                                                    <div className="space-y-0.5">
                                                                        <p className="font-semibold text-xs">
                                                                            {
                                                                                data.year
                                                                            }
                                                                        </p>
                                                                        <p className="text-[10px] text-emerald-600">
                                                                            {
                                                                                data.totalPaid
                                                                            }{" "}
                                                                            paid
                                                                        </p>
                                                                        <p className="text-[10px] text-orange-500">
                                                                            {
                                                                                data.totalUnpaid
                                                                            }{" "}
                                                                            unpaid
                                                                        </p>
                                                                        {data.totalAmount >
                                                                            0 && (
                                                                                <p className="text-[10px] text-muted-foreground">
                                                                                    GH₵{" "}
                                                                                    {data.totalAmount.toFixed(
                                                                                        2
                                                                                    )}
                                                                                </p>
                                                                            )}
                                                                    </div>
                                                                );
                                                            }
                                                            return _value;
                                                        }}
                                                        formatter={(
                                                            value
                                                        ) => (
                                                            <span className="text-xs">
                                                                {
                                                                    value as number
                                                                }
                                                                /12 paid
                                                            </span>
                                                        )}
                                                    />
                                                }
                                            />
                                            <Line
                                                dataKey="totalPaid"
                                                type="monotone"
                                                stroke="var(--color-yearly)"
                                                strokeWidth={2.5}
                                                dot={(props: any) => {
                                                    const {
                                                        cx,
                                                        cy,
                                                        payload,
                                                    } = props;
                                                    const compliance =
                                                        payload.totalPaid / 12;
                                                    return (
                                                        <circle
                                                            cx={cx}
                                                            cy={cy}
                                                            r={4}
                                                            fill={
                                                                compliance >=
                                                                    0.75
                                                                    ? "hsl(142, 71%, 45%)"
                                                                    : compliance >=
                                                                        0.5
                                                                        ? "hsl(45, 93%, 47%)"
                                                                        : "hsl(0, 84%, 60%)"
                                                            }
                                                            stroke="hsl(var(--background))"
                                                            strokeWidth={2}
                                                        />
                                                    );
                                                }}
                                                activeDot={{
                                                    r: 6,
                                                    fill: "var(--color-yearly)",
                                                }}
                                            />
                                        </LineChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        )}

                        {/* Previous years list */}
                        {previousYears.length > 0 ? (
                            <div className="space-y-2">
                                {previousYears.map((year, i) => (
                                    <motion.div
                                        key={year.year}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            ...SPRING_GENTLE,
                                            delay: i * 0.05,
                                        }}
                                        className="flex items-center justify-between rounded-2xl border bg-card p-3.5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60">
                                                <IoCalendarOutline className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {year.year}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {year.totalPaid}/12 months ·
                                                    GH₵{" "}
                                                    {year.totalAmount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="hidden sm:flex gap-0.5">
                                                {year.months.map((m) => (
                                                    <div
                                                        key={m.month}
                                                        className={cn(
                                                            "h-2.5 w-2.5 rounded-full transition-colors",
                                                            m.status === "paid"
                                                                ? "bg-emerald-500"
                                                                : "bg-muted"
                                                        )}
                                                        title={`${m.monthName}: ${m.status}`}
                                                    />
                                                ))}
                                            </div>
                                            <Badge
                                                variant={
                                                    year.totalPaid === 12
                                                        ? "default"
                                                        : year.totalPaid >= 6
                                                            ? "secondary"
                                                            : "destructive"
                                                }
                                                className="text-[10px] h-5 px-2 rounded-lg"
                                            >
                                                {Math.round(
                                                    (year.totalPaid / 12) * 100
                                                )}
                                                %
                                            </Badge>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <IoCalendarOutline className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    No previous year records yet.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {/* ── TAB: Insights ── */}
                    <TabsContent value="insights" className="mt-4">
                        <div className="space-y-2.5">
                            {currentYear.totalPaid === 12 && (
                                <InsightCard
                                    emoji="🎉"
                                    text={`${memberName} has completed all payments for ${currentYear.year}! Outstanding commitment.`}
                                    variant="success"
                                    delay={0}
                                />
                            )}
                            {currentYear.totalPaid >= 6 &&
                                currentYear.totalPaid < 12 && (
                                    <InsightCard
                                        emoji="📈"
                                        text={`Great progress — ${currentYear.totalPaid} of 12 months paid this year.`}
                                        variant="info"
                                        delay={0}
                                    />
                                )}
                            {currentYear.totalPaid < 6 &&
                                currentYear.totalPaid > 0 && (
                                    <InsightCard
                                        emoji="⚠️"
                                        text={`Only ${currentYear.totalPaid} month(s) paid so far. A gentle follow-up may help.`}
                                        variant="warning"
                                        delay={0.05}
                                    />
                                )}
                            {currentYear.totalPaid === 0 && (
                                <InsightCard
                                    emoji="🚨"
                                    text={`No payments recorded for ${currentYear.year} yet. Consider reaching out.`}
                                    variant="danger"
                                    delay={0}
                                />
                            )}
                            {streakMonths > 3 && (
                                <InsightCard
                                    emoji="🔥"
                                    text={`${streakMonths} consecutive months paid — excellent consistency!`}
                                    variant="success"
                                    delay={0.1}
                                />
                            )}
                            {previousYears.length > 0 && (
                                <InsightCard
                                    emoji="📊"
                                    text={`Overall compliance rate: ${overallPaidPercentage}% across all tracked years.`}
                                    variant="info"
                                    delay={0.15}
                                />
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    );
}

// ── Insight Card ──

function InsightCard({
    emoji,
    text,
    variant,
    delay,
}: {
    emoji: string;
    text: string;
    variant: "success" | "info" | "warning" | "danger";
    delay: number;
}) {
    const styles = {
        success:
            "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-100",
        info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40 text-blue-900 dark:text-blue-100",
        warning:
            "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-100",
        danger: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40 text-red-900 dark:text-red-100",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_GENTLE, delay }}
            className={cn(
                "flex items-start gap-3 p-3.5 rounded-2xl border",
                styles[variant]
            )}
        >
            <span className="text-base shrink-0 mt-0.5">{emoji}</span>
            <p className="text-sm leading-relaxed">{text}</p>
        </motion.div>
    );
}