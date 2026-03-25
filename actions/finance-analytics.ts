// actions/finance-analytics.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import type {
    YearlyChartData,
    YearlyPaymentBar,
    MonthlyChartData,
    MonthlyPaymentPoint,
    GroupChartData,
    GroupPaymentSlice,
    MembersProgressData,
    MemberPaymentProgress,
} from "@/lib/types/finance-analytics";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const CHART_COLORS = [
    "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
    "var(--chart-4)", "var(--chart-5)",
];

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

// ── Auth helper (same pattern as your other actions) ──

async function getAuth() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return { supabase, user };
}

// ══════════════════════════════════════════════════════════
// 1. BAR CHART — Yearly payment totals
// ══════════════════════════════════════════════════════════
//
// Fetches ALL "paid" records from member_payments, groups by
// year, sums amounts, and identifies the current year as the
// "active" bar. Returns year-over-year change %.
// ══════════════════════════════════════════════════════════

export async function fetchYearlyPaymentTotals(): Promise<YearlyChartData> {
    const { supabase } = await getAuth();

    const { data, error } = await supabase
        .from("member_payments")
        .select("year, amount, member_id, status")
        .eq("status", "paid");

    if (error) {
        console.error("FETCH YEARLY TOTALS ERROR:", error);
        throw new Error(error.message);
    }

    const rows = data ?? [];
    const currentYear = new Date().getFullYear();

    // ── Group by year ──
    const yearMap = new Map<
        number,
        { totalAmount: number; totalPayments: number; memberIds: Set<string> }
    >();

    for (const row of rows) {
        const existing = yearMap.get(row.year) ?? {
            totalAmount: 0,
            totalPayments: 0,
            memberIds: new Set<string>(),
        };
        existing.totalAmount += row.amount ?? 0;
        existing.totalPayments += 1;
        existing.memberIds.add(row.member_id);
        yearMap.set(row.year, existing);
    }

    // Ensure current year always appears
    if (!yearMap.has(currentYear)) {
        yearMap.set(currentYear, {
            totalAmount: 0,
            totalPayments: 0,
            memberIds: new Set(),
        });
    }

    // ── Build sorted bar data ──
    const sortedYears = Array.from(yearMap.keys()).sort((a, b) => a - b);

    const bars: YearlyPaymentBar[] = sortedYears.map((year, i) => {
        const d = yearMap.get(year)!;
        return {
            year: year.toString(),
            totalAmount: d.totalAmount,
            totalPayments: d.totalPayments,
            memberCount: d.memberIds.size,
            fill: `var(--color-${year})`,
        };
    });

    const currentYearIndex = bars.findIndex(
        (b) => b.year === currentYear.toString()
    );

    const currentYearAmount =
        yearMap.get(currentYear)?.totalAmount ?? 0;
    const previousYearAmount =
        yearMap.get(currentYear - 1)?.totalAmount ?? 0;

    let yearOverYearChange = 0;
    if (previousYearAmount > 0) {
        yearOverYearChange = Math.round(
            ((currentYearAmount - previousYearAmount) / previousYearAmount) *
            100
        );
    } else if (currentYearAmount > 0) {
        yearOverYearChange = 100;
    }

    return {
        bars,
        currentYearIndex,
        currentYearAmount,
        previousYearAmount,
        yearOverYearChange,
    };
}

// ══════════════════════════════════════════════════════════
// 2. LINE CHART — Monthly payment totals for a given year
// ══════════════════════════════════════════════════════════
//
// For each month (1-12), sums the total amount collected
// across ALL members and counts distinct members who paid.
// Returns YTD total, average, and best month.
// ══════════════════════════════════════════════════════════

export async function fetchMonthlyPaymentTotals(
    year: number
): Promise<MonthlyChartData> {
    const { supabase } = await getAuth();

    const { data, error } = await supabase
        .from("member_payments")
        .select("month, amount, member_id")
        .eq("year", year)
        .eq("status", "paid");

    if (error) {
        console.error("FETCH MONTHLY TOTALS ERROR:", error);
        throw new Error(error.message);
    }

    const rows = data ?? [];

    // ── Aggregate by month ──
    const monthMap = new Map<
        number,
        { totalAmount: number; memberIds: Set<string> }
    >();

    for (const row of rows) {
        const existing = monthMap.get(row.month) ?? {
            totalAmount: 0,
            memberIds: new Set<string>(),
        };
        existing.totalAmount += row.amount ?? 0;
        existing.memberIds.add(row.member_id);
        monthMap.set(row.month, existing);
    }

    // ── Build all 12 months ──
    const points: MonthlyPaymentPoint[] = MONTHS.map((name, i) => {
        const month = i + 1;
        const d = monthMap.get(month);
        return {
            month: name,
            shortMonth: name.slice(0, 3),
            totalAmount: d?.totalAmount ?? 0,
            membersPaid: d?.memberIds.size ?? 0,
        };
    });

    // ── Summary stats ──
    const now = new Date();
    const monthsElapsed =
        year === now.getFullYear() ? now.getMonth() + 1 : 12;

    const ytdPoints = points.slice(0, monthsElapsed);
    const totalCollectedYTD = ytdPoints.reduce(
        (sum, p) => sum + p.totalAmount,
        0
    );
    const averageMonthly =
        monthsElapsed > 0 ? totalCollectedYTD / monthsElapsed : 0;

    // Best month by amount
    let bestMonth = points[0]?.month ?? "";
    let bestMonthAmount = 0;
    for (const p of points) {
        if (p.totalAmount > bestMonthAmount) {
            bestMonthAmount = p.totalAmount;
            bestMonth = p.month;
        }
    }

    return {
        points,
        totalCollectedYTD,
        averageMonthly,
        bestMonth,
        bestMonthAmount,
        currentYear: year,
    };
}

// ══════════════════════════════════════════════════════════
// 3. PIE CHART — Group payment distribution
// ══════════════════════════════════════════════════════════
//
// For each member group, counts how many members have made
// at least ONE payment this year vs those with zero payments.
// Pie slice size = number of paid members per group.
// ══════════════════════════════════════════════════════════

export async function fetchGroupPaymentDistribution(
    year: number
): Promise<GroupChartData> {
    const { supabase } = await getAuth();

    // ── All members with their groups ──
    const { data: members, error: membersError } = await supabase
        .from("members")
        .select("id, member_group");

    if (membersError) {
        console.error("FETCH MEMBERS FOR GROUPS ERROR:", membersError);
        throw new Error(membersError.message);
    }

    // ── All paid payments this year ──
    const { data: payments, error: paymentsError } = await supabase
        .from("member_payments")
        .select("member_id, amount")
        .eq("year", year)
        .eq("status", "paid");

    if (paymentsError) {
        console.error("FETCH PAYMENTS FOR GROUPS ERROR:", paymentsError);
        throw new Error(paymentsError.message);
    }

    // ── Build set of members who have paid + their totals ──
    const memberAmounts = new Map<string, number>();
    for (const p of payments ?? []) {
        const current = memberAmounts.get(p.member_id) ?? 0;
        memberAmounts.set(p.member_id, current + (p.amount ?? 0));
    }

    // ── Group members ──
    const groupMap = new Map<
        string,
        { paid: number; total: number; amount: number }
    >();

    for (const member of members ?? []) {
        const group =
            member.member_group?.toLowerCase().trim() || "unassigned";
        const existing = groupMap.get(group) ?? {
            paid: 0,
            total: 0,
            amount: 0,
        };
        existing.total++;

        if (memberAmounts.has(member.id)) {
            existing.paid++;
            existing.amount += memberAmounts.get(member.id) ?? 0;
        }

        groupMap.set(group, existing);
    }

    // ── Build slices sorted by paid count descending ──
    const slices: GroupPaymentSlice[] = Array.from(groupMap.entries())
        .map(([group, data], i) => ({
            group,
            label:
                GROUP_LABELS[group] ??
                group
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase()),
            paidMembers: data.paid,
            totalMembers: data.total,
            totalAmount: data.amount,
            fill: `var(--color-${group})`,
        }))
        .sort((a, b) => b.paidMembers - a.paidMembers);

    const totalMembers = (members ?? []).length;
    const totalPaidMembers = memberAmounts.size;
    const bestGroup =
        slices.length > 0 ? slices[0].label : "N/A";

    return {
        slices,
        totalMembers,
        totalPaidMembers,
        bestGroup,
        currentYear: year,
    };
}

// ══════════════════════════════════════════════════════════
// 4. MEMBERS TABLE — Payment progress per member
// ══════════════════════════════════════════════════════════
//
// For each member, counts how many months they've paid in
// the given year. "Fully paid" = paid every month from
// January up to the current month.
// ══════════════════════════════════════════════════════════

export async function fetchMembersPaymentProgress(
    year: number
): Promise<MembersProgressData> {
    const { supabase } = await getAuth();

    // ── All members ──
    const { data: members, error: membersError } = await supabase
        .from("members")
        .select("id, first_name, last_name, avatar_url, membership_id, member_group")
        .order("first_name", { ascending: true });

    if (membersError) {
        console.error("FETCH MEMBERS PROGRESS ERROR:", membersError);
        throw new Error(membersError.message);
    }

    // ── All payments this year ──
    const { data: payments, error: paymentsError } = await supabase
        .from("member_payments")
        .select("member_id, month, amount, status")
        .eq("year", year);

    if (paymentsError) {
        console.error("FETCH PAYMENTS PROGRESS ERROR:", paymentsError);
        throw new Error(paymentsError.message);
    }

    // ── Build per-member payment info ──
    const paymentMap = new Map<
        string,
        { months: Set<number>; totalAmount: number }
    >();

    for (const p of payments ?? []) {
        if (p.status !== "paid") continue;
        const existing = paymentMap.get(p.member_id) ?? {
            months: new Set<number>(),
            totalAmount: 0,
        };
        existing.months.add(p.month);
        existing.totalAmount += p.amount ?? 0;
        paymentMap.set(p.member_id, existing);
    }

    const now = new Date();
    const currentMonthNumber =
        year === now.getFullYear() ? now.getMonth() + 1 : 12;
    const currentMonthName = MONTHS[currentMonthNumber - 1];

    // ── Build progress for each member ──
    const allMembers: MemberPaymentProgress[] = (members ?? []).map(
        (member) => {
            const info = paymentMap.get(member.id);
            const paidMonths = info?.months.size ?? 0;

            // "Fully paid" = has paid every month from 1..currentMonthNumber
            let isFullyPaid = true;
            if (!info || info.months.size < currentMonthNumber) {
                isFullyPaid = false;
            } else {
                for (let m = 1; m <= currentMonthNumber; m++) {
                    if (!info.months.has(m)) {
                        isFullyPaid = false;
                        break;
                    }
                }
            }

            return {
                id: member.id,
                firstName: member.first_name,
                lastName: member.last_name,
                avatarUrl: member.avatar_url,
                membershipId: member.membership_id,
                memberGroup: member.member_group,
                paidMonths,
                currentMonthNumber,
                totalAmount: info?.totalAmount ?? 0,
                isFullyPaid,
            };
        }
    );

    // Sort: fully paid first, then by paid months descending
    allMembers.sort((a, b) => {
        if (a.isFullyPaid !== b.isFullyPaid)
            return a.isFullyPaid ? -1 : 1;
        return b.paidMonths - a.paidMonths;
    });

    const fullyPaidMembers = allMembers.filter((m) => m.isFullyPaid);

    return {
        allMembers,
        fullyPaidMembers,
        totalCount: allMembers.length,
        fullyPaidCount: fullyPaidMembers.length,
        currentYear: year,
        currentMonthName,
        currentMonthNumber,
    };
}