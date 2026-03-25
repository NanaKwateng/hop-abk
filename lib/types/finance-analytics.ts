// lib/types/finance-analytics.ts

// ═══════════════════════════════════════════════════════════
// BAR CHART — Yearly totals across all members
// ═══════════════════════════════════════════════════════════

export interface YearlyPaymentBar {
    year: string;
    totalAmount: number;
    totalPayments: number;
    memberCount: number;
    fill: string;
}

export interface YearlyChartData {
    bars: YearlyPaymentBar[];
    currentYearIndex: number;
    currentYearAmount: number;
    previousYearAmount: number;
    yearOverYearChange: number;
}

// ═══════════════════════════════════════════════════════════
// LINE CHART — Monthly totals for the current year
// ═══════════════════════════════════════════════════════════

export interface MonthlyPaymentPoint {
    month: string;
    shortMonth: string;
    totalAmount: number;
    membersPaid: number;
}

export interface MonthlyChartData {
    points: MonthlyPaymentPoint[];
    totalCollectedYTD: number;
    averageMonthly: number;
    bestMonth: string;
    bestMonthAmount: number;
    currentYear: number;
}

// ═══════════════════════════════════════════════════════════
// PIE CHART — Payment participation by group
// ═══════════════════════════════════════════════════════════

export interface GroupPaymentSlice {
    group: string;
    label: string;
    paidMembers: number;
    totalMembers: number;
    totalAmount: number;
    fill: string;
}

export interface GroupChartData {
    slices: GroupPaymentSlice[];
    totalMembers: number;
    totalPaidMembers: number;
    bestGroup: string;
    currentYear: number;
}

// ═══════════════════════════════════════════════════════════
// TABLE — Member payment progress with progress bars
// ═══════════════════════════════════════════════════════════

export interface MemberPaymentProgress {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    membershipId: string | null;
    memberGroup: string | null;
    paidMonths: number;
    currentMonthNumber: number;
    totalAmount: number;
    isFullyPaid: boolean;
}

export interface MembersProgressData {
    allMembers: MemberPaymentProgress[];
    fullyPaidMembers: MemberPaymentProgress[];
    totalCount: number;
    fullyPaidCount: number;
    currentYear: number;
    currentMonthName: string;
    currentMonthNumber: number;
}