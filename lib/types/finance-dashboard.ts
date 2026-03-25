// lib/types/finance-dashboard.ts
// ═══════════════════════════════════════════════════════════
// All types for the finance dashboard.
// Follows the same camelCase convention as lib/types/payments.ts
// ═══════════════════════════════════════════════════════════

// ── Bar Chart: Yearly Payment Totals ──

export interface YearlyPaymentTotal {
    /** e.g. "2024" */
    year: string;
    /** Total GH₵ collected across ALL members for this year */
    totalAmount: number;
    /** Number of individual payment records (member-months) */
    totalPayments: number;
    /** Whether this is the current year (for active bar styling) */
    isCurrentYear: boolean;
    /** CSS color variable for this bar */
    fill: string;
}

export interface YearlyPaymentChartData {
    years: YearlyPaymentTotal[];
    currentYear: number;
    /** Percentage change: current year vs previous year */
    yearOverYearChange: number;
    /** Highest amount across all years (for context) */
    peakYear: string;
    peakAmount: number;
}

// ── Line Chart: Monthly Payment Totals (Current Year) ──

export interface MonthlyPaymentTotal {
    /** 1-12 */
    month: number;
    /** "January", "February", etc. */
    monthName: string;
    /** Total GH₵ collected from ALL members for this month */
    totalAmount: number;
    /** Count of members who paid this month */
    membersPaid: number;
    /** Total registered members at this point */
    totalMembers: number;
}

export interface MonthlyPaymentChartData {
    year: number;
    months: MonthlyPaymentTotal[];
    /** Total collected so far this year */
    totalYearAmount: number;
    /** Average per month (only counting elapsed months) */
    averageMonthly: number;
    /** Trend: current month vs previous month */
    monthOverMonthChange: number;
}

// ── Pie Chart: Group Payment Distribution ──

export interface GroupPaymentDistribution {
    /** Raw group key: "youth", "men", "women", etc. */
    group: string;
    /** Display label: "Youth", "Men's Fellowship", etc. */
    label: string;
    /** Members who have paid current month in this group */
    paidCount: number;
    /** Members who have NOT paid current month in this group */
    unpaidCount: number;
    /** Total members in this group */
    totalCount: number;
    /** CSS color fill */
    fill: string;
}

export interface GroupPaymentChartData {
    groups: GroupPaymentDistribution[];
    currentMonth: string;
    currentYear: number;
    totalPaidAllGroups: number;
    totalMembersAllGroups: number;
}

// ── Avatar + Table: Fully Paid Members ──

export interface FullyPaidMember {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    membershipId: string | null;
    memberGroup: string | null;
    /** How many months paid in the current year (up to current month) */
    monthsPaid: number;
    /** How many months have elapsed so far (1-12) */
    monthsElapsed: number;
    /** Total GH₵ paid this year */
    totalAmount: number;
}

export interface FullyPaidMembersData {
    /** Members who have paid ALL months up to and including current month */
    fullyPaidMembers: FullyPaidMember[];
    /** Total count (for the +N display) */
    totalFullyPaid: number;
    /** For context */
    totalMembers: number;
    currentMonth: string;
    currentYear: number;
    monthsElapsed: number;
}