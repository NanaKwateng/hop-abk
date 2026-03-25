// components/users/analytics/payment-analytics.tsx
"use client";

import * as React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    XCircle,
    Flame,
    DollarSign,
    Calendar,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import type { PaymentAnalytics } from "@/lib/types/payments";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

/** The two views the user can toggle between */
type ChartView = "monthly" | "yearly";

/** Shape of each data point in the monthly chart */
interface MonthlyDataPoint {
    /** Short month label for x-axis: "Jan", "Feb", etc. */
    month: string;
    /** Full month name for tooltip: "January", "February", etc. */
    fullMonth: string;
    /** Cumulative count of paid months up to and including this month.
     *  e.g., if Jan=paid, Feb=unpaid, Mar=paid → values are 1, 1, 2
     *  This makes the line RISE with each payment, showing momentum. */
    cumulativePaid: number;
    /** The amount paid for THIS specific month (0 if unpaid) */
    amount: number;
    /** Whether this specific month is paid */
    isPaid: boolean;
}

/** Shape of each data point in the yearly chart */
interface YearlyDataPoint {
    /** Year label for x-axis: "2020", "2021", etc. */
    year: string;
    /** Total months paid in that year (0-12) */
    totalPaid: number;
    /** Total months unpaid */
    totalUnpaid: number;
    /** Total amount paid in GH₵ */
    totalAmount: number;
}

// ═══════════════════════════════════════════════════════════
// CHART CONFIG
// ═══════════════════════════════════════════════════════════

/**
 * shadcn ChartConfig defines the visual mapping for each data series.
 * "monthly" and "yearly" are the two data keys we toggle between.
 * The colors use CSS variables from your theme (--chart-1, --chart-2).
 */
const chartConfig = {
    /** Config for the monthly cumulative progress line */
    monthly: {
        label: "Monthly Progress",
        color: "var(--chart-1)",
    },
    /** Config for the yearly total paid line */
    yearly: {
        label: "Yearly History",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

// ═══════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════

interface PaymentAnalyticsViewProps {
    /** Member's display name, e.g. "James Mensah" */
    memberName: string;
    /** Full analytics data fetched from the server.
     *  This prop shape stays exactly the same as before —
     *  we just visualize it differently. */
    analytics: PaymentAnalytics;
    isAdminView?: boolean;
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function PaymentAnalyticsView({
    memberName,
    analytics,
    isAdminView = false
}: PaymentAnalyticsViewProps) {
    // Destructure the analytics data (same shape as before)
    const {
        currentYear,
        previousYears,
        overallPaidPercentage,
        totalAllTimeAmount,
        streakMonths,
    } = analytics;

    // ── Active chart toggle state ──
    // "monthly" = cumulative progress within the current year
    // "yearly" = total paid per year across all history
    const [activeChart, setActiveChart] = React.useState<ChartView>("monthly");

    // ═══════════════════════════════════════════════════════
    // MONTHLY CHART DATA
    // Transform the current year's months into cumulative progress.
    //
    // The idea: as the member pays each month, the line goes UP.
    // If they miss a month, the line stays flat (no rise).
    // This visually shows payment consistency at a glance.
    //
    // Example:
    //   Jan=paid, Feb=paid, Mar=unpaid, Apr=paid, May=unpaid, ...
    //   Cumulative: 1, 2, 2, 3, 3, ...
    //   The line rises at Jan, Feb, Apr — stays flat at Mar, May.
    // ═══════════════════════════════════════════════════════

    const monthlyChartData: MonthlyDataPoint[] = React.useMemo(() => {
        let cumulative = 0;

        return currentYear.months.map((m) => {
            // If this month is paid, increment the running total
            if (m.status === "paid") {
                cumulative += 1;
            }

            return {
                month: m.monthName.slice(0, 3),   // "Jan", "Feb", etc.
                fullMonth: m.monthName,             // "January", "February"
                cumulativePaid: cumulative,         // Running total
                amount: m.amount ?? 0,              // Amount for this month
                isPaid: m.status === "paid",        // Boolean for tooltip
            };
        });
    }, [currentYear.months]);

    // ═══════════════════════════════════════════════════════
    // YEARLY CHART DATA
    // Combine previous years + current year, sorted ascending.
    // Each point shows how many months were paid in that year.
    // This shows long-term compliance trends.
    // ═══════════════════════════════════════════════════════

    const yearlyChartData: YearlyDataPoint[] = React.useMemo(() => {
        const allYears = [
            // Map previous years
            ...previousYears.map((y) => ({
                year: y.year.toString(),
                totalPaid: y.totalPaid,
                totalUnpaid: y.totalUnpaid,
                totalAmount: y.totalAmount,
            })),
            // Add current year
            {
                year: currentYear.year.toString(),
                totalPaid: currentYear.totalPaid,
                totalUnpaid: currentYear.totalUnpaid,
                totalAmount: currentYear.totalAmount,
            },
        ];

        // Sort by year ascending so the chart reads left-to-right
        return allYears.sort(
            (a, b) => parseInt(a.year) - parseInt(b.year)
        );
    }, [currentYear, previousYears]);

    // ═══════════════════════════════════════════════════════
    // TOGGLE SUMMARY VALUES
    // These numbers appear in the toggle buttons at the top-right
    // of the chart card, giving a quick numeric summary.
    // ═══════════════════════════════════════════════════════

    const totals = React.useMemo(
        () => ({
            monthly: currentYear.totalPaid,
            yearly: yearlyChartData.reduce(
                (sum, y) => sum + y.totalPaid,
                0
            ),
        }),
        [currentYear.totalPaid, yearlyChartData]
    );

    // ═══════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════

    return (
        <div className="space-y-6">
            {/* ── Summary Cards ── */}
            {/* These 4 cards give an at-a-glance overview.
                They stay exactly the same as your original design. */}
            <div className={cn(
                "grid gap-4 sm:grid-cols-2",
                isAdminView ? "lg:grid-cols-4" : "lg:grid-cols-3"
            )}>
                <SummaryCard
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Paid This Year"
                    value={`${currentYear.totalPaid}/12`}
                    description={`${Math.round((currentYear.totalPaid / 12) * 100)}% completion`}
                    color="text-white"
                    bg="bg-[#ff7f50]"
                />
                <SummaryCard
                    icon={<XCircle className="h-4 w-4" />}
                    label="Unpaid This Year"
                    value={currentYear.totalUnpaid.toString()}
                    description={`${currentYear.totalUnpaid} months remaining`}
                    color="text-white"
                    bg="bg-[#ffbf00]"
                />
                <SummaryCard
                    icon={<Flame className="h-4 w-4" />}
                    label="Payment Streak"
                    value={`${streakMonths} mo`}
                    description={
                        streakMonths > 0
                            ? "Consecutive months paid"
                            : "No active streak"
                    }
                    color="text-white"
                    bg="bg-rose-600"
                />
                {isAdminView && (
                    <SummaryCard
                        icon={<DollarSign className="h-4 w-4" />}
                        label="Total All-Time"
                        value={`GH₵ ${totalAllTimeAmount.toFixed(2)}`}
                        description={`${overallPaidPercentage}% overall compliance`}
                        color="text-white"
                        bg="bg-indigo-600"
                    />
                )}
            </div>
            {/* ═══════════════════════════════════════════════ */}
            {/* INTERACTIVE LINE CHART WITH TOGGLE              */}
            {/* ═══════════════════════════════════════════════ */}
            <Card className="py-4 sm:py-0">
                {/* ── Header with toggle buttons ── */}
                <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                    {/* Left side: title + description */}
                    <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                        <CardTitle>Payment Tracking</CardTitle>
                        <CardDescription>
                            {activeChart === "monthly"
                                ? `${currentYear.year} cumulative progress — line rises with each payment`
                                : `Year-over-year payment history for ${memberName}`}
                        </CardDescription>
                    </div>

                    {/* Right side: Monthly / Yearly toggle buttons */}
                    <div className="flex">
                        {(["monthly", "yearly"] as const).map((view) => (
                            <button
                                key={view}
                                data-active={activeChart === view}
                                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                                onClick={() => setActiveChart(view)}
                            >
                                {/* Label: "Monthly Progress" or "Yearly History" */}
                                <span className="text-xs text-muted-foreground">
                                    {chartConfig[view].label}
                                </span>
                                {/* Summary number */}
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {view === "monthly"
                                        ? /* Show "X/12" for monthly */
                                        `${totals.monthly}/12`
                                        : /* Show total months paid across all years */
                                        totals.yearly.toLocaleString()}
                                </span>
                                {/* Sub-label */}
                                <span className="text-xs text-muted-foreground mt-1">
                                    {view === "monthly"
                                        ? "months paid"
                                        : "total months paid"}
                                </span>
                            </button>
                        ))}
                    </div>
                </CardHeader>

                {/* ── Chart Content ── */}
                <CardContent className="px-2 sm:p-6">
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        {/* ═══════════════════════════════════════ */}
                        {/* CONDITIONAL RENDERING BASED ON TOGGLE   */}
                        {/* ═══════════════════════════════════════ */}

                        {activeChart === "monthly" ? (
                            /* ── MONTHLY: Cumulative progress line ── */
                            <LineChart
                                accessibilityLayer
                                data={monthlyChartData}
                                margin={{ left: 12, right: 12, top: 8 }}
                            >
                                <CartesianGrid vertical={false} />

                                {/* X-axis: Jan, Feb, Mar, ... Dec */}
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />

                                {/* Y-axis: 0 to 12 (total possible paid months) */}
                                <YAxis
                                    domain={[0, 12]}
                                    ticks={[0, 3, 6, 9, 12]}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    width={30}
                                />

                                {/* Tooltip: shows month details on hover */}
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            className="w-[180px]"
                                            nameKey="monthly"
                                            labelFormatter={(
                                                _value,
                                                payload
                                            ) => {
                                                // payload is the array of data entries at this point
                                                // We access the original data to show the full month name
                                                if (
                                                    payload &&
                                                    payload.length > 0
                                                ) {
                                                    const data =
                                                        payload[0]
                                                            ?.payload as MonthlyDataPoint;
                                                    return (
                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                {
                                                                    data.fullMonth
                                                                }{" "}
                                                                {
                                                                    currentYear.year
                                                                }
                                                            </p>
                                                            <p
                                                                className={cn(
                                                                    "text-xs font-semibold",
                                                                    data.isPaid
                                                                        ? "text-green-600"
                                                                        : "text-red-500"
                                                                )}
                                                            >
                                                                {data.isPaid
                                                                    ? "✓ Paid"
                                                                    : "✗ Unpaid"}
                                                            </p>
                                                            {data.amount >
                                                                0 && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Amount:
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
                                            // Format the value shown next to the color dot
                                            formatter={(value) => {
                                                return (
                                                    <span>
                                                        {value as number}/12
                                                        paid
                                                    </span>
                                                );
                                            }}
                                        />
                                    }
                                />

                                {/* The actual line — cumulative paid count */}
                                <Line
                                    dataKey="cumulativePaid"
                                    type="monotone"
                                    stroke="var(--color-monthly)"
                                    strokeWidth={2}
                                    /* Dots at each month to show data points clearly */
                                    dot={(props: any) => {
                                        const { cx, cy, payload } = props;
                                        // Green dot for paid months, muted for unpaid
                                        return (
                                            <circle
                                                key={cx}
                                                cx={cx}
                                                cy={cy}
                                                r={4}
                                                fill={
                                                    payload.isPaid
                                                        ? "hsla(222, 89%, 43%, 1.00)"
                                                        : "hsl(var(--muted))"
                                                }
                                                stroke={
                                                    payload.isPaid
                                                        ? "hsla(216, 71%, 45%, 1.00)"
                                                        : "hsl(var(--muted-foreground))"
                                                }
                                                strokeWidth={2}
                                            />
                                        );
                                    }}
                                    activeDot={{
                                        r: 6,
                                        fill: "var(--color-monthly)",
                                    }}
                                />
                            </LineChart>
                        ) : (
                            /* ── YEARLY: Total paid per year ── */
                            <LineChart
                                accessibilityLayer
                                data={yearlyChartData}
                                margin={{ left: 12, right: 12, top: 8 }}
                            >
                                <CartesianGrid vertical={false} />

                                {/* X-axis: 2020, 2021, 2022, ... */}
                                <XAxis
                                    dataKey="year"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />

                                {/* Y-axis: 0 to 12 months */}
                                <YAxis
                                    domain={[0, 12]}
                                    ticks={[0, 3, 6, 9, 12]}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    width={30}
                                />

                                {/* Tooltip: shows year details on hover */}
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            className="w-[180px]"
                                            nameKey="yearly"
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
                                                            ?.payload as YearlyDataPoint;
                                                    return (
                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                {data.year}
                                                            </p>
                                                            <p className="text-xs text-green-600">
                                                                Paid:{" "}
                                                                {
                                                                    data.totalPaid
                                                                }{" "}
                                                                months
                                                            </p>
                                                            <p className="text-xs text-orange-600">
                                                                Unpaid:{" "}
                                                                {
                                                                    data.totalUnpaid
                                                                }{" "}
                                                                months
                                                            </p>
                                                            {data.totalAmount >
                                                                0 && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Total:
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
                                            formatter={(value) => {
                                                return (
                                                    <span>
                                                        {value as number}/12
                                                        paid
                                                    </span>
                                                );
                                            }}
                                        />
                                    }
                                />

                                {/* The actual line — total paid months per year */}
                                <Line
                                    dataKey="totalPaid"
                                    type="monotone"
                                    stroke="var(--color-yearly)"
                                    strokeWidth={2}
                                    dot={(props: any) => {
                                        const { cx, cy, payload } = props;
                                        // Color intensity based on compliance
                                        const compliance =
                                            payload.totalPaid / 12;
                                        return (
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={5}
                                                fill={
                                                    compliance >= 0.75
                                                        ? "hsl(142, 71%, 45%)" // Green: 75%+
                                                        : compliance >= 0.5
                                                            ? "hsl(45, 93%, 47%)" // Yellow: 50-74%
                                                            : "hsl(0, 84%, 60%)" // Red: <50%
                                                }
                                                stroke="hsl(var(--background))"
                                                strokeWidth={2}
                                            />
                                        );
                                    }}
                                    activeDot={{
                                        r: 7,
                                        fill: "var(--color-yearly)",
                                    }}
                                />
                            </LineChart>
                        )}
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════════ */}
            {/* PREVIOUS YEARS BREAKDOWN                        */}
            {/* Same as your original — mini month indicators   */}
            {/* ═══════════════════════════════════════════════ */}
            {previousYears.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Previous Years
                        </CardTitle>
                        <CardDescription>
                            Historical payment records breakdown.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {previousYears.map((year) => (
                                <div
                                    key={year.year}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {year.year}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {year.totalPaid}/12 months paid
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {year.totalAmount > 0 && (
                                            <span className="text-sm text-muted-foreground">
                                                GH₵{" "}
                                                {year.totalAmount.toFixed(2)}
                                            </span>
                                        )}
                                        <Badge
                                            variant={
                                                year.totalPaid === 12
                                                    ? "default"
                                                    : year.totalPaid >= 6
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                        >
                                            {Math.round(
                                                (year.totalPaid / 12) * 100
                                            )}
                                            %
                                        </Badge>
                                        {/* Mini month indicators: 12 tiny squares */}
                                        <div className="hidden sm:flex gap-0.5">
                                            {year.months.map((m) => (
                                                <div
                                                    key={m.month}
                                                    className={cn(
                                                        "h-3 w-3 rounded-sm",
                                                        m.status === "paid"
                                                            ? "bg-green-500"
                                                            : "bg-muted"
                                                    )}
                                                    title={`${m.monthName}: ${m.status}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* INSIGHTS                                        */}
            {/* Contextual text based on payment data           */}
            {/* ═══════════════════════════════════════════════ */}
            <Card>
                <CardHeader>
                    <CardTitle>Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    {currentYear.totalPaid === 12 && (
                        <p className="text-green-600 font-medium">
                            🎉 {memberName} has completed all payments for{" "}
                            {currentYear.year}! Excellent compliance.
                        </p>
                    )}
                    {currentYear.totalPaid >= 6 &&
                        currentYear.totalPaid < 12 && (
                            <p>
                                {memberName} is on track with{" "}
                                {currentYear.totalPaid} out of 12 months paid
                                this year.
                            </p>
                        )}
                    {currentYear.totalPaid < 6 &&
                        currentYear.totalPaid > 0 && (
                            <p className="text-orange-600">
                                ⚠️ {memberName} has only{" "}
                                {currentYear.totalPaid} month(s) paid this
                                year. Follow up may be needed.
                            </p>
                        )}
                    {currentYear.totalPaid === 0 && (
                        <p className="text-red-600">
                            ⚠️ No payments recorded for {currentYear.year} yet.
                            Consider reaching out to {memberName}.
                        </p>
                    )}
                    {streakMonths > 3 && (
                        <p>
                            🔥 Current streak: {streakMonths} consecutive months
                            paid.
                        </p>
                    )}
                    {/* New insight: year-over-year trend */}
                    {previousYears.length > 0 && (
                        <p>
                            📊 Overall compliance rate across all tracked years:{" "}
                            <span className="font-semibold">
                                {overallPaidPercentage}%
                            </span>
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// SUMMARY CARD (unchanged from your original)
// ═══════════════════════════════════════════════════════════

function SummaryCard({
    icon,
    label,
    value,
    description,
    color,
    bg,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    description: string;
    color: string;
    bg: string;
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg} ${color}`}
                    >
                        {icon}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">
                            {label}
                        </p>
                        <p className="text-lg font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}