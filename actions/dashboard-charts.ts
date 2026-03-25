"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service"; // ✅ Imported Service Client
import { withAnalyticsCache } from "@/lib/utils/cache-helpers";
import type {
    RegistrationChartData,
    MonthlyRegistration,
    GroupDistributionData,
    GroupDistribution,
    PaymentCollectionData,
    MonthlyPaymentCollection,
    GenderDistributionData,
    GenderSnapshot,
} from "@/lib/types/dashboard-analytics";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// ── AUTHENTICATION (Uses cookies) ──
async function getAuth() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return { user };
}

// ══════════════════════════════════════════════════════════
// CHART 1: REGISTRATION DATA
// ══════════════════════════════════════════════════════════

// ── CACHED LOGIC (NO COOKIES! Uses Service Client) ──
async function _fetchRegistrationData(year: number): Promise<RegistrationChartData> {
    const supabase = createServiceClient(); // ✅ Safe for caching

    const yearStart = `${year}-01-01T00:00:00.000Z`;
    const yearEnd = `${year}-12-31T23:59:59.999Z`;

    const { data: currentYearMembers, error: currentError } = await supabase
        .from("members").select("created_at")
        .gte("created_at", yearStart).lte("created_at", yearEnd);

    if (currentError) throw new Error(currentError.message);

    const monthlyCounts = new Array(12).fill(0);
    for (const member of currentYearMembers ?? []) {
        if (!member.created_at) continue;
        const monthIndex = new Date(member.created_at).getMonth();
        monthlyCounts[monthIndex]++;
    }

    const { count: membersBeforeThisYear } = await supabase
        .from("members").select("*", { count: "exact", head: true })
        .lt("created_at", yearStart);

    let runningTotal = membersBeforeThisYear ?? 0;
    const months: MonthlyRegistration[] = MONTHS.map((name, i) => {
        runningTotal += monthlyCounts[i];
        return { month: i + 1, monthName: name, totalRegistered: monthlyCounts[i], cumulativeTotal: runningTotal };
    });

    const { count: totalActive } = await supabase.from("members").select("*", { count: "exact", head: true });

    const currentMonth = new Date().getMonth();
    const registeredThisYear = (currentYearMembers ?? []).length;
    const prevYearStart = `${year - 1}-01-01T00:00:00.000Z`;
    const prevYearEnd = `${year - 1}-${String(currentMonth + 1).padStart(2, "0")}-31T23:59:59.999Z`;

    const { data: prevYearMembers } = await supabase.from("members").select("created_at")
        .gte("created_at", prevYearStart).lte("created_at", prevYearEnd);

    const prevYearCount = (prevYearMembers ?? []).length;
    let yearOverYearChange = 0;
    if (prevYearCount > 0) yearOverYearChange = Math.round(((registeredThisYear - prevYearCount) / prevYearCount) * 100);
    else if (registeredThisYear > 0) yearOverYearChange = 100;

    return { year, months, totalActiveMembers: totalActive ?? 0, registeredThisYear, yearOverYearChange };
}

// ── EXPORTED ACTION (Authenticates OUTSIDE the cache) ──
export async function fetchRegistrationData(year: number) {
    await getAuth(); // ✅ Validates cookies first
    const cachedFn = withAnalyticsCache(() => _fetchRegistrationData(year), ['registration-data', year.toString()], 60);
    return await cachedFn();
}

// ══════════════════════════════════════════════════════════
// CHART 2: GROUP DISTRIBUTION
// ══════════════════════════════════════════════════════════

const GROUP_CONFIG: Record<string, { label: string; color: string }> = {
    youth: { label: "Youth", color: "var(--chart-1)" },
    men: { label: "Men", color: "var(--chart-2)" },
    women: { label: "Women", color: "var(--chart-3)" },
};

async function _fetchGroupDistribution(): Promise<GroupDistributionData> {
    const supabase = createServiceClient(); // ✅ Safe for caching
    const { data, error } = await supabase.from("members").select("member_group");

    if (error) throw new Error(error.message);

    const members = data ?? [];
    const groupCounts = new Map<string, number>();

    for (const member of members) {
        const group = member.member_group?.toLowerCase().trim() || "unassigned";
        groupCounts.set(group, (groupCounts.get(group) ?? 0) + 1);
    }

    const groups: GroupDistribution[] = Array.from(groupCounts.entries())
        .map(([group, count]) => {
            const config = GROUP_CONFIG[group] ?? {
                label: group.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                color: "var(--chart-4)",
            };
            return { group, label: config.label, count, fill: config.color };
        }).sort((a, b) => b.count - a.count);

    return { groups, totalMembers: members.length };
}

export async function fetchGroupDistribution() {
    await getAuth(); // ✅ Validates cookies first
    const cachedFn = withAnalyticsCache(_fetchGroupDistribution, ['group-distribution'], 60);
    return await cachedFn();
}

// ══════════════════════════════════════════════════════════
// CHART 3: PAYMENT COLLECTIONS
// ══════════════════════════════════════════════════════════

async function _fetchPaymentCollectionData(year: number): Promise<PaymentCollectionData> {
    const supabase = createServiceClient(); // ✅ Safe for caching

    const { data: payments, error: paymentError } = await supabase
        .from("member_payments").select("member_id, month, amount, status")
        .eq("year", year).eq("status", "paid").order("month", { ascending: true });

    if (paymentError) throw new Error(paymentError.message);

    const { data: allMembers, error: membersError } = await supabase.from("members").select("created_at");
    if (membersError) throw new Error(membersError.message);

    const memberCountsByMonth: number[] = [];
    for (let m = 0; m < 12; m++) {
        const monthEnd = new Date(year, m + 1, 0, 23, 59, 59, 999);
        const count = (allMembers ?? []).filter((member) => {
            if (!member.created_at) return false;
            return new Date(member.created_at) <= monthEnd;
        }).length;
        memberCountsByMonth.push(count);
    }

    const monthlyData = new Map<number, { memberIds: Set<string>; totalAmount: number }>();
    for (const payment of payments ?? []) {
        const existing = monthlyData.get(payment.month) ?? { memberIds: new Set<string>(), totalAmount: 0 };
        existing.memberIds.add(payment.member_id);
        existing.totalAmount += payment.amount ?? 0;
        monthlyData.set(payment.month, existing);
    }

    const months: MonthlyPaymentCollection[] = MONTHS.map((name, i) => {
        const month = i + 1;
        const data = monthlyData.get(month);
        return {
            month, monthName: name,
            membersPaid: data?.memberIds.size ?? 0,
            amountCollected: data?.totalAmount ?? 0,
            totalMembers: memberCountsByMonth[i],
        };
    });

    const totalYearAmount = months.reduce((sum, m) => sum + m.amountCollected, 0);
    const currentDate = new Date();
    const monthsPassed = year === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
    const averageMonthly = monthsPassed > 0 ? totalYearAmount / monthsPassed : 0;

    const totalPossible = months.slice(0, monthsPassed).reduce((sum, m) => sum + m.totalMembers, 0);
    const totalPaidInstances = months.slice(0, monthsPassed).reduce((sum, m) => sum + m.membersPaid, 0);
    const overallComplianceRate = totalPossible > 0 ? Math.round((totalPaidInstances / totalPossible) * 100) : 0;

    const currentMonthIndex = currentDate.getMonth();
    const currentMonthPaid = year === currentDate.getFullYear() ? months[currentMonthIndex]?.membersPaid ?? 0 : months[11]?.membersPaid ?? 0;
    const previousMonthPaid = currentMonthIndex > 0 ? months[currentMonthIndex - 1]?.membersPaid ?? 0 : 0;

    let monthOverMonthChange = 0;
    if (previousMonthPaid > 0) monthOverMonthChange = Math.round(((currentMonthPaid - previousMonthPaid) / previousMonthPaid) * 100);
    else if (currentMonthPaid > 0) monthOverMonthChange = 100;

    return { year, months, totalYearAmount, averageMonthly, overallComplianceRate, monthOverMonthChange };
}

export async function fetchPaymentCollectionData(year: number) {
    await getAuth(); // ✅ Validates cookies first
    const cachedFn = withAnalyticsCache(() => _fetchPaymentCollectionData(year), ['payment-collections', year.toString()], 60);
    return await cachedFn();
}

// ══════════════════════════════════════════════════════════
// CHART 4: GENDER DISTRIBUTION
// ══════════════════════════════════════════════════════════

async function _fetchGenderDistribution(range: "12m" | "6m" | "3m"): Promise<GenderDistributionData> {
    const supabase = createServiceClient(); // ✅ Safe for caching
    const now = new Date();
    let startDate: Date;

    switch (range) {
        case "3m": startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1); break;
        case "6m": startDate = new Date(now.getFullYear(), 0, 1); break;
        case "12m": default: startDate = new Date(now.getFullYear() - 4, 0, 1); break;
    }

    const snapshotDates: Date[] = [];
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (cursor <= now) {
        const snapshotDate = new Date(cursor.getFullYear(), cursor.getMonth(), 15);
        if (snapshotDate <= now) snapshotDates.push(new Date(snapshotDate));
        cursor.setMonth(cursor.getMonth() + 1);
    }

    const { data: allMembers, error } = await supabase.from("members").select("created_at, gender").order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const parsedMembers = (allMembers ?? []).map((m) => ({
        createdAt: new Date(m.created_at),
        gender: (m.gender?.toLowerCase().trim() ?? "") as string,
    }));

    const snapshots: GenderSnapshot[] = snapshotDates.map((snapshotDate) => {
        let male = 0; let female = 0;
        for (const member of parsedMembers) {
            if (member.createdAt <= snapshotDate) {
                if (member.gender === "male") male++;
                else if (member.gender === "female") female++;
            }
        }
        return { date: snapshotDate.toISOString().split("T")[0], male, female };
    });

    const currentMale = parsedMembers.filter((m) => m.gender === "male").length;
    const currentFemale = parsedMembers.filter((m) => m.gender === "female").length;

    return { snapshots, currentMale, currentFemale, totalMembers: allMembers.length };
}

export async function fetchGenderDistribution(range: "12m" | "6m" | "3m") {
    await getAuth(); // ✅ Validates cookies first
    const cachedFn = withAnalyticsCache(() => _fetchGenderDistribution(range), ['gender-dist', range], 60);
    return await cachedFn();
}