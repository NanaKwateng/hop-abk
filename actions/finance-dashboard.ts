// actions/finance-dashboard.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import type {
    YearlyPaymentChartData,
    YearlyPaymentTotal,
    MonthlyPaymentChartData,
    MonthlyPaymentTotal,
    GroupPaymentChartData,
    GroupPaymentDistribution,
    FullyPaidMembersData,
    FullyPaidMember,
} from "@/lib/types/finance-dashboard";

// Same month names as actions/payments.ts
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// Group display config — matches dashboard-analytics.ts pattern
const GROUP_LABELS: Record<string, string> = {
    youth: "Youth",
    men: "Men's Fellowship",
    women: "Women's Fellowship",
    children: "Children",
    seniors: "Seniors",
    young_adults: "Young Adults",
    couples: "Couples",
    singles: "Singles",
    unassigned: "Unassigned",
};

const GROUP_COLORS: Record<string, string> = {
    youth: "var(--chart-1)",
    men: "var(--chart-2)",
    women: "var(--chart-3)",
    children: "var(--chart-4)",
    seniors: "var(--chart-5)",
    young_adults: "var(--chart-1)",
    couples: "var(--chart-2)",
    singles: "var(--chart-3)",
    unassigned: "var(--chart-4)",
};

// ── Auth helper (same pattern as actions/payments.ts) ──

async function getAuth() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");
    return { supabase, user };
}

// ══════════════════════════════════════════════════════════
// BAR CHART: Yearly payment totals across all members
// ══════════════════════════════════════════════════════════
//
// Fetches ALL paid records, groups by year, sums amounts.
// The current year gets a distinct fill color (active bar).
// Returns sorted ascending so chart reads left-to-right.
// ══════════════════════════════════════════════════════════

export async function fetchYearlyPaymentTotals(): Promise<YearlyPaymentChartData> {
    const { supabase } = await getAuth();

    // Step 1: Fetch all paid payment records
    const { data, error } = await supabase
        .from("member_payments")
        .select("year, amount, status")
        .eq("status", "paid");

    if (error) {
        console.error("FETCH YEARLY TOTALS ERROR:", error);
        throw new Error(error.message);
    }

    const rows = data ?? [];
    const currentYear = new Date().getFullYear();

    // Step 2: Aggregate by year
    const yearMap = new Map<number, { totalAmount: number; totalPayments: number }>();

    for (const row of rows) {
        const existing = yearMap.get(row.year) ?? {
            totalAmount: 0,
            totalPayments: 0,
        };
        existing.totalAmount += row.amount ?? 0;
        existing.totalPayments += 1;
        yearMap.set(row.year, existing);
    }

    // Ensure current year exists even with 0 payments
    if (!yearMap.has(currentYear)) {
        yearMap.set(currentYear, { totalAmount: 0, totalPayments: 0 });
    }

    // Step 3: Build sorted array
    const years: YearlyPaymentTotal[] = Array.from(yearMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([year, data]) => ({
            year: year.toString(),
            totalAmount: data.totalAmount,
            totalPayments: data.totalPayments,
            isCurrentYear: year === currentYear,
            fill:
                year === currentYear
                    ? "var(--chart-1)"
                    : "var(--chart-2)",
        }));

    // Step 4: Find peak year
    let peakYear = currentYear.toString();
    let peakAmount = 0;
    for (const y of years) {
        if (y.totalAmount > peakAmount) {
            peakAmount = y.totalAmount;
            peakYear = y.year;
        }
    }

    // Step 5: Year-over-year change
    const currentYearData = yearMap.get(currentYear);
    const prevYearData = yearMap.get(currentYear - 1);
    let yearOverYearChange = 0;

    if (prevYearData && prevYearData.totalAmount > 0) {
        yearOverYearChange = Math.round(
            (((currentYearData?.totalAmount ?? 0) - prevYearData.totalAmount) /
                prevYearData.totalAmount) *
            100
        );
    } else if ((currentYearData?.totalAmount ?? 0) > 0) {
        yearOverYearChange = 100;
    }

    return {
        years,
        currentYear,
        yearOverYearChange,
        peakYear,
        peakAmount,
    };
}

// ══════════════════════════════════════════════════════════
// LINE CHART: Monthly payment totals for current year
// ══════════════════════════════════════════════════════════
//
// For each month (Jan–Dec), sums ALL paid amounts across
// every member. Shows collection volume per month.
// ══════════════════════════════════════════════════════════

export async function fetchMonthlyPaymentTotals(): Promise<MonthlyPaymentChartData> {
    const { supabase } = await getAuth();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-indexed

    // Step 1: Fetch all paid payments for current year
    const { data: payments, error: paymentError } = await supabase
        .from("member_payments")
        .select("month, amount, member_id, status")
        .eq("year", currentYear)
        .eq("status", "paid");

    if (paymentError) {
        console.error("FETCH MONTHLY TOTALS ERROR:", paymentError);
        throw new Error(paymentError.message);
    }

    // Step 2: Get total member count per month
    // (members who existed by end of each month)
    const { data: allMembers, error: memberError } = await supabase
        .from("members")
        .select("created_at");

    if (memberError) {
        console.error("FETCH MEMBERS FOR MONTHLY ERROR:", memberError);
        throw new Error(memberError.message);
    }

    // Step 3: Aggregate payments by month
    const monthlyAgg = new Map<
        number,
        { totalAmount: number; memberIds: Set<string> }
    >();

    for (const p of payments ?? []) {
        const existing = monthlyAgg.get(p.month) ?? {
            totalAmount: 0,
            memberIds: new Set<string>(),
        };
        existing.totalAmount += p.amount ?? 0;
        existing.memberIds.add(p.member_id);
        monthlyAgg.set(p.month, existing);
    }

    // Step 4: Build 12-month array
    const months: MonthlyPaymentTotal[] = MONTHS.map((name, i) => {
        const month = i + 1;
        const agg = monthlyAgg.get(month);

        // Count members existing by end of this month
        const monthEnd = new Date(currentYear, month, 0, 23, 59, 59, 999);
        const totalMembers = (allMembers ?? []).filter((m) => {
            if (!m.created_at) return false;
            return new Date(m.created_at) <= monthEnd;
        }).length;

        return {
            month,
            monthName: name,
            totalAmount: agg?.totalAmount ?? 0,
            membersPaid: agg?.memberIds.size ?? 0,
            totalMembers,
        };
    });

    // Step 5: Summary stats
    const totalYearAmount = months.reduce(
        (sum, m) => sum + m.totalAmount,
        0
    );

    const averageMonthly =
        currentMonth > 0
            ? totalYearAmount / currentMonth
            : 0;

    const currentMonthAmount = months[currentMonth - 1]?.totalAmount ?? 0;
    const prevMonthAmount =
        currentMonth > 1
            ? months[currentMonth - 2]?.totalAmount ?? 0
            : 0;

    let monthOverMonthChange = 0;
    if (prevMonthAmount > 0) {
        monthOverMonthChange = Math.round(
            ((currentMonthAmount - prevMonthAmount) / prevMonthAmount) * 100
        );
    } else if (currentMonthAmount > 0) {
        monthOverMonthChange = 100;
    }

    return {
        year: currentYear,
        months,
        totalYearAmount,
        averageMonthly,
        monthOverMonthChange,
    };
}

// ══════════════════════════════════════════════════════════
// PIE CHART: Payment distribution by member group
// ══════════════════════════════════════════════════════════
//
// For the current month & year, counts:
//   - How many members in each group have paid
//   - How many have NOT paid
// Label format: "X paid / Y total"
// ══════════════════════════════════════════════════════════

export async function fetchGroupPaymentDistribution(): Promise<GroupPaymentChartData> {
    const { supabase } = await getAuth();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthName = MONTHS[currentMonth - 1];

    // Step 1: Fetch all members with their groups
    const { data: members, error: memberError } = await supabase
        .from("members")
        .select("id, member_group");

    if (memberError) {
        console.error("FETCH MEMBERS FOR GROUP DIST ERROR:", memberError);
        throw new Error(memberError.message);
    }

    // Step 2: Fetch paid payments for current month/year
    const { data: payments, error: paymentError } = await supabase
        .from("member_payments")
        .select("member_id, status")
        .eq("year", currentYear)
        .eq("month", currentMonth)
        .eq("status", "paid");

    if (paymentError) {
        console.error("FETCH PAYMENTS FOR GROUP DIST ERROR:", paymentError);
        throw new Error(paymentError.message);
    }

    // Step 3: Build set of paid member IDs
    const paidMemberIds = new Set(
        (payments ?? []).map((p) => p.member_id)
    );

    // Step 4: Group members and count paid/unpaid
    const groupMap = new Map<
        string,
        { paid: number; unpaid: number; total: number }
    >();

    for (const member of members ?? []) {
        const group =
            member.member_group?.toLowerCase().trim() || "unassigned";

        const existing = groupMap.get(group) ?? {
            paid: 0,
            unpaid: 0,
            total: 0,
        };

        existing.total += 1;
        if (paidMemberIds.has(member.id)) {
            existing.paid += 1;
        } else {
            existing.unpaid += 1;
        }

        groupMap.set(group, existing);
    }

    // Step 5: Build sorted array (highest total first)
    const groups: GroupPaymentDistribution[] = Array.from(
        groupMap.entries()
    )
        .map(([group, counts]) => ({
            group,
            label:
                GROUP_LABELS[group] ??
                group
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase()),
            paidCount: counts.paid,
            unpaidCount: counts.unpaid,
            totalCount: counts.total,
            fill:
                GROUP_COLORS[group] ?? "var(--chart-4)",
        }))
        .sort((a, b) => b.totalCount - a.totalCount);

    // Step 6: Totals
    let totalPaid = 0;
    let totalMembers = 0;
    for (const g of groups) {
        totalPaid += g.paidCount;
        totalMembers += g.totalCount;
    }

    return {
        groups,
        currentMonth: currentMonthName,
        currentYear,
        totalPaidAllGroups: totalPaid,
        totalMembersAllGroups: totalMembers,
    };
}

// ══════════════════════════════════════════════════════════
// AVATAR + TABLE: Fully paid members
// ══════════════════════════════════════════════════════════
//
// "Fully paid" = has paid EVERY month from January up to
// and including the current month of the current year.
//
// e.g., If we're in March 2025, a fully paid member has
// paid Jan, Feb, AND Mar 2025.
//
// Returns member details + progress data for the table.
// ══════════════════════════════════════════════════════════

export async function fetchFullyPaidMembers(): Promise<FullyPaidMembersData> {
    const { supabase } = await getAuth();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthName = MONTHS[currentMonth - 1];

    // Step 1: Fetch all members
    const { data: members, error: memberError } = await supabase
        .from("members")
        .select("id, first_name, last_name, avatar_url, membership_id, member_group");

    if (memberError) {
        console.error("FETCH MEMBERS FOR FULLY PAID ERROR:", memberError);
        throw new Error(memberError.message);
    }

    // Step 2: Fetch all paid payments for current year
    const { data: payments, error: paymentError } = await supabase
        .from("member_payments")
        .select("member_id, month, amount, status")
        .eq("year", currentYear)
        .eq("status", "paid");

    if (paymentError) {
        console.error("FETCH PAYMENTS FOR FULLY PAID ERROR:", paymentError);
        throw new Error(paymentError.message);
    }

    // Step 3: Group payments by member
    const memberPaymentMap = new Map<
        string,
        { paidMonths: Set<number>; totalAmount: number }
    >();

    for (const p of payments ?? []) {
        const existing = memberPaymentMap.get(p.member_id) ?? {
            paidMonths: new Set<number>(),
            totalAmount: 0,
        };
        existing.paidMonths.add(p.month);
        existing.totalAmount += p.amount ?? 0;
        memberPaymentMap.set(p.member_id, existing);
    }

    // Step 4: Identify fully paid members
    // A member is "fully paid" if they have paid ALL months
    // from 1 through currentMonth (inclusive).
    const fullyPaidMembers: FullyPaidMember[] = [];

    for (const member of members ?? []) {
        const paymentData = memberPaymentMap.get(member.id);
        if (!paymentData) continue;

        // Check if every month 1..currentMonth is in the paid set
        let isFullyPaid = true;
        for (let m = 1; m <= currentMonth; m++) {
            if (!paymentData.paidMonths.has(m)) {
                isFullyPaid = false;
                break;
            }
        }

        if (isFullyPaid) {
            fullyPaidMembers.push({
                id: member.id,
                firstName: member.first_name,
                lastName: member.last_name,
                avatarUrl: member.avatar_url,
                membershipId: member.membership_id,
                memberGroup: member.member_group,
                monthsPaid: paymentData.paidMonths.size,
                monthsElapsed: currentMonth,
                totalAmount: paymentData.totalAmount,
            });
        }
    }

    // Sort by name
    fullyPaidMembers.sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
        )
    );

    return {
        fullyPaidMembers,
        totalFullyPaid: fullyPaidMembers.length,
        totalMembers: (members ?? []).length,
        currentMonth: currentMonthName,
        currentYear,
        monthsElapsed: currentMonth,
    };
}