// actions/payments.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service"; // ✅ Added missing import here
import { withActionRetry } from "@/lib/utils/action-resilience";
import { withAnalyticsCache } from "@/lib/utils/cache-helpers";
import type { PaymentRow, MonthPayment, YearlyPaymentSummary, PaymentAnalytics } from "@/lib/types/payments";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

async function getAuth() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return { supabase, user };
}

// Fetch member payments (Not heavily cached so UI updates instantly for individual members)
export async function fetchMemberPayments(memberId: string, year: number): Promise<MonthPayment[]> {
    const { supabase } = await getAuth();
    const { data, error } = await supabase
        .from("member_payments")
        .select("*")
        .eq("member_id", memberId)
        .eq("year", year)
        .order("month", { ascending: true });

    if (error) throw new Error(error.message);

    const paymentMap = new Map<number, PaymentRow>();
    for (const row of (data ?? []) as PaymentRow[]) paymentMap.set(row.month, row);

    return Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const payment = paymentMap.get(month);
        return {
            month,
            monthName: MONTHS[i],
            status: payment?.status ?? "unpaid",
            amount: payment?.amount ?? null,
            paidAt: payment?.paid_at ?? null,
            paymentId: payment?.id ?? null,
        };
    });
}

// ✅ WRAPPED IN RETRY: Protects multiple admins writing simultaneously
export async function markMonthsPaid(
    memberId: string,
    year: number,
    months: number[],
    amount?: number,
    notes?: string
): Promise<void> {
    return withActionRetry(async () => {
        const { supabase, user } = await getAuth();

        if (months.length > 3) throw new Error("Cannot process more than 3 months at a time.");
        if (months.length === 0) throw new Error("Please select at least one month.");
        for (const m of months) if (m < 1 || m > 12) throw new Error(`Invalid month: ${m}`);

        const now = new Date().toISOString();
        const rows = months.map((month) => ({
            member_id: memberId,
            year,
            month,
            status: "paid" as const,
            amount: amount ?? null,
            paid_at: now,
            notes: notes ?? null,
            created_by: user.id,
        }));

        const { error } = await supabase.from("member_payments").upsert(rows, { onConflict: "member_id,year,month" });
        if (error) throw new Error(error.message);

        revalidatePath(`/admin/users/${memberId}`);
    });
}

// ✅ WRAPPED IN RETRY
export async function markMonthUnpaid(memberId: string, year: number, month: number): Promise<void> {
    return withActionRetry(async () => {
        const { supabase } = await getAuth();
        const { error } = await supabase.from("member_payments").upsert(
            { member_id: memberId, year, month, status: "unpaid", amount: null, paid_at: null, notes: null },
            { onConflict: "member_id,year,month" }
        );
        if (error) throw new Error(error.message);
        revalidatePath(`/admin/users/${memberId}`);
    });
}

// ── INTERNAL ANALYTICS LOGIC (Heavy Query) ──
async function _fetchPaymentAnalytics(memberId: string): Promise<PaymentAnalytics> {
    const supabase = createServiceClient(); // ✅ No Cookies inside cache scope
    const { data, error } = await supabase.from("member_payments").select("*").eq("member_id", memberId).order("year", { ascending: true }).order("month", { ascending: true });

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as PaymentRow[];
    const currentYear = new Date().getFullYear();
    const yearMap = new Map<number, PaymentRow[]>();
    for (const row of rows) {
        const existing = yearMap.get(row.year) ?? [];
        existing.push(row);
        yearMap.set(row.year, existing);
    }

    function buildYearSummary(year: number): YearlyPaymentSummary {
        const yearRows = yearMap.get(year) ?? [];
        const paymentMap = new Map<number, PaymentRow>();
        for (const row of yearRows) paymentMap.set(row.month, row);

        const months: MonthPayment[] = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const payment = paymentMap.get(month);
            return {
                month, monthName: MONTHS[i],
                status: payment?.status ?? "unpaid", amount: payment?.amount ?? null,
                paidAt: payment?.paid_at ?? null, paymentId: payment?.id ?? null,
            };
        });

        const paidMonths = months.filter((m) => m.status === "paid");
        return {
            year, totalPaid: paidMonths.length, totalUnpaid: 12 - paidMonths.length,
            totalAmount: paidMonths.reduce((sum, m) => sum + (m.amount ?? 0), 0), months,
        };
    }

    const currentYearSummary = buildYearSummary(currentYear);
    const allYears = Array.from(yearMap.keys()).sort();
    const previousYears = allYears.filter((y) => y !== currentYear).map(buildYearSummary).reverse();

    const allPaid = rows.filter((r) => r.status === "paid");
    const totalMonthsTracked = allYears.length * 12 || 12;
    const overallPaidPercentage = totalMonthsTracked > 0 ? Math.round((allPaid.length / totalMonthsTracked) * 100) : 0;
    const totalAllTimeAmount = allPaid.reduce((sum, r) => sum + (r.amount ?? 0), 0);

    let streakMonths = 0;
    const today = new Date();
    let checkYear = today.getFullYear(), checkMonth = today.getMonth() + 1;
    for (let i = 0; i < 120; i++) {
        if (!rows.find((r) => r.year === checkYear && r.month === checkMonth && r.status === "paid")) break;
        streakMonths++;
        checkMonth--;
        if (checkMonth < 1) { checkMonth = 12; checkYear--; }
    }

    return { currentYear: currentYearSummary, previousYears, overallPaidPercentage, totalAllTimeAmount, streakMonths };
}

// ✅ EXPORTED ACTION (Authenticates OUTSIDE the cache)
export async function fetchPaymentAnalytics(memberId: string) {
    await getAuth(); // ✅ Validates cookies first
    const cachedFn = withAnalyticsCache(() => _fetchPaymentAnalytics(memberId), ['payment-analytics', memberId], 30);
    return await cachedFn();
}

export async function fetchPaymentYears(memberId: string): Promise<number[]> {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.from("member_payments").select("year").eq("member_id", memberId).order("year", { ascending: false });
    if (error) throw new Error(error.message);

    const years = [...new Set((data ?? []).map((r: any) => r.year))];
    const currentYear = new Date().getFullYear();
    if (!years.includes(currentYear)) years.unshift(currentYear);
    return years.sort((a, b) => b - a);
}