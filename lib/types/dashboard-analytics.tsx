// lib/types/dashboard-analytics.ts
// ════════════════════════════════════════════════════════════
// Types for all four dashboard chart components.
// These define the exact shape of data each chart expects.
// The server actions in actions/dashboard-charts.ts return
// data matching these shapes.
// ════════════════════════════════════════════════════════════

/**
 * CHART 1: Member Registration Tracking (Line Chart)
 * Tracks how many members were registered each month.
 * If a member is deleted, the count for that month decreases
 * because we only count members still in the DB.
 */
export interface MonthlyRegistration {
    /** 1-12 */
    month: number;
    /** "January", "February", etc. */
    monthName: string;
    /** Members registered in this specific month who still exist */
    totalRegistered: number;
    /** Running total of all members from Jan up to and including this month */
    cumulativeTotal: number;
}

export interface RegistrationChartData {
    /** The year being viewed */
    year: number;
    /** Array of 12 months with registration data */
    months: MonthlyRegistration[];
    /** Total active members right now across all years */
    totalActiveMembers: number;
    /** How many were registered in this specific year */
    registeredThisYear: number;
    /** Percentage change vs same period last year (can be negative) */
    yearOverYearChange: number;
}

/**
 * CHART 2: Group Distribution (Pie Chart)
 * Shows how members are distributed across groups
 * (Youth, Men, Women, Children, Seniors, etc.)
 */
export interface GroupDistribution {
    /** Group key matching member_group column, e.g. "youth", "men", "women" */
    group: string;
    /** Human-readable label, e.g. "Youth", "Men", "Women" */
    label: string;
    /** Number of members in this group */
    count: number;
    /** CSS color variable for the pie slice, e.g. "var(--chart-1)" */
    fill: string;
}

export interface GroupDistributionData {
    /** Array of groups with their member counts, sorted by count descending */
    groups: GroupDistribution[];
    /** Total members across all groups */
    totalMembers: number;
}

/**
 * CHART 3: Payment Collection Overview (Bar Chart)
 * Tracks total payments collected from ALL members each month.
 */
export interface MonthlyPaymentCollection {
    /** 1-12 */
    month: number;
    /** "January", "February", etc. */
    monthName: string;
    /** Number of distinct members who paid this month */
    membersPaid: number;
    /** Total amount collected in GH₵ for this month */
    amountCollected: number;
    /** Total registered members at end of this month (for compliance %) */
    totalMembers: number;
}

export interface PaymentCollectionData {
    /** The year being viewed */
    year: number;
    /** Array of 12 months with collection data */
    months: MonthlyPaymentCollection[];
    /** Total amount collected for the entire year so far in GH₵ */
    totalYearAmount: number;
    /** Average monthly collection in GH₵ */
    averageMonthly: number;
    /** Percentage of all possible payments that were actually made */
    overallComplianceRate: number;
    /** Percentage change in members paid vs last month */
    monthOverMonthChange: number;
}

/**
 * CHART 4: Gender Distribution Over Time (Area Chart)
 * Tracks male vs female member counts at monthly intervals.
 */
export interface GenderSnapshot {
    /** ISO date string for the snapshot point, e.g. "2024-06-15" */
    date: string;
    /** Number of male members at this point in time */
    male: number;
    /** Number of female members at this point in time */
    female: number;
}

export interface GenderDistributionData {
    /** Monthly snapshots ordered by date ascending */
    snapshots: GenderSnapshot[];
    /** Current male member count */
    currentMale: number;
    /** Current female member count */
    currentFemale: number;
    /** Total members (all genders) */
    totalMembers: number;
}