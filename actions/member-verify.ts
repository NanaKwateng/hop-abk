// actions/member-verify.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import type { Member } from "@/lib/types";
import type { PaymentAnalytics } from "@/lib/types/payments";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const COOKIE_NAME = "member_session";
const COOKIE_MAX_AGE = 60 * 60 * 2; // 2 hours

// ══════════════════════════════════════════════════════════
// VERIFY — Check membership ID and create session
// ══════════════════════════════════════════════════════════
//
// This is a PUBLIC action — no admin auth required.
// Uses the service role client to bypass RLS on the members table.
//
// Security considerations:
//   - httpOnly cookie prevents JS access
//   - 2-hour expiry limits exposure window
//   - We re-verify the member exists on every dashboard load
//   - Read-only access — member cannot modify any data
//
// Production recommendation: Add rate limiting (e.g., 5 attempts
// per IP per 15 minutes) to prevent brute-force guessing.
// ══════════════════════════════════════════════════════════

export async function verifyMembershipId(
    membershipId: string
): Promise<{ success: boolean; error?: string }> {
    // ── Validate input ──
    const trimmed = membershipId.trim();

    if (!trimmed) {
        return { success: false, error: "Please enter your Membership ID." };
    }

    if (trimmed.length < 2 || trimmed.length > 50) {
        return { success: false, error: "Invalid Membership ID format." };
    }

    console.log("[MEMBER VERIFY] Attempting verification for:", trimmed);

    // ── Look up member by membership_id ──
    const supabase = createServiceClient();

    const { data: member, error } = await supabase
        .from("members")
        .select("id, first_name, last_name, membership_id")
        .eq("membership_id", trimmed)
        .single();

    if (error || !member) {
        console.log("[MEMBER VERIFY] Not found:", trimmed);
        return {
            success: false,
            error:
                "No member found with this ID. Please check and try again.",
        };
    }

    console.log(
        "[MEMBER VERIFY] Found:",
        member.first_name,
        member.last_name,
        "→ setting cookie"
    );

    // ── Set session cookie ──
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, member.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
    });

    return { success: true };
}

// ══════════════════════════════════════════════════════════
// GET SESSION — Read the verified member from cookie
// ══════════════════════════════════════════════════════════
//
// Called by the dashboard page to get the member's data.
// Returns null if not verified or session expired.
// ══════════════════════════════════════════════════════════

export async function getVerifiedMember(): Promise<Member | null> {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME);

    if (!session?.value) {
        console.log("[MEMBER VERIFY] No session cookie found");
        return null;
    }

    const memberId = session.value;
    const supabase = createServiceClient();

    const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", memberId)
        .single();

    if (error || !data) {
        console.log("[MEMBER VERIFY] Member not found for session:", memberId);
        // Clear invalid cookie
        cookieStore.delete(COOKIE_NAME);
        return null;
    }

    // Map snake_case → camelCase (same as your rowToMember pattern)
    return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        gender: data.gender,
        phone: data.phone,
        phoneCountry: data.phone_country,
        placeOfStay: data.place_of_stay,
        houseNumber: data.house_number,
        memberPosition: data.member_position,
        addressComments: data.address_comments,
        memberGroup: data.member_group,
        occupationType: data.occupation_type,
        roleComments: data.role_comments,
        email: data.email,
        avatarUrl: data.avatar_url,
        membershipId: data.membership_id,
        createdAt: data.created_at,
    } as Member;
}

// ══════════════════════════════════════════════════════════
// FETCH ANALYTICS — Member's payment data (read-only)
// ══════════════════════════════════════════════════════════
//
// Same aggregation logic as actions/payments.ts fetchPaymentAnalytics,
// but uses the service client (no admin auth needed).
// ══════════════════════════════════════════════════════════

export async function fetchMemberAnalytics(
    memberId: string
): Promise<PaymentAnalytics> {
    const supabase = createServiceClient();

    const { data, error } = await supabase
        .from("member_payments")
        .select("*")
        .eq("member_id", memberId)
        .order("year", { ascending: true })
        .order("month", { ascending: true });

    if (error) {
        console.error("[MEMBER ANALYTICS] Error:", error.message);
        throw new Error(error.message);
    }

    const rows = data ?? [];
    const currentYear = new Date().getFullYear();

    // ── Group by year ──
    const yearMap = new Map<number, typeof rows>();
    for (const row of rows) {
        const existing = yearMap.get(row.year) ?? [];
        existing.push(row);
        yearMap.set(row.year, existing);
    }

    // ── Build yearly summaries ──
    function buildYearSummary(year: number) {
        const yearRows = yearMap.get(year) ?? [];
        const paymentMap = new Map<number, (typeof rows)[0]>();
        for (const row of yearRows) {
            paymentMap.set(row.month, row);
        }

        const months = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const payment = paymentMap.get(month);
            return {
                month,
                monthName: MONTHS[i],
                status: (payment?.status ?? "unpaid") as "paid" | "unpaid",
                amount: payment?.amount != null ? Number(payment.amount) : null,
                paidAt: payment?.paid_at ?? null,
                paymentId: payment?.id ?? null,
            };
        });

        const paidMonths = months.filter((m) => m.status === "paid");
        const totalAmount = paidMonths.reduce(
            (sum, m) => sum + (m.amount ?? 0),
            0
        );

        return {
            year,
            totalPaid: paidMonths.length,
            totalUnpaid: 12 - paidMonths.length,
            totalAmount,
            months,
        };
    }

    const currentYearSummary = buildYearSummary(currentYear);

    const allYears = Array.from(yearMap.keys()).sort();
    const previousYears = allYears
        .filter((y) => y !== currentYear)
        .map(buildYearSummary)
        .reverse();

    // ── Overall stats ──
    const allPaid = rows.filter((r) => r.status === "paid");
    const totalMonthsTracked = allYears.length * 12 || 12;
    const overallPaidPercentage =
        totalMonthsTracked > 0
            ? Math.round((allPaid.length / totalMonthsTracked) * 100)
            : 0;

    const totalAllTimeAmount = allPaid.reduce(
        (sum, r) => sum + (Number(r.amount) || 0),
        0
    );

    // ── Streak ──
    let streakMonths = 0;
    const today = new Date();
    let checkYear = today.getFullYear();
    let checkMonth = today.getMonth() + 1;

    for (let i = 0; i < 120; i++) {
        const found = rows.find(
            (r) =>
                r.year === checkYear &&
                r.month === checkMonth &&
                r.status === "paid"
        );
        if (!found) break;
        streakMonths++;
        checkMonth--;
        if (checkMonth < 1) {
            checkMonth = 12;
            checkYear--;
        }
    }

    return {
        currentYear: currentYearSummary,
        previousYears,
        overallPaidPercentage,
        totalAllTimeAmount,
        streakMonths,
    };
}

// ══════════════════════════════════════════════════════════
// SIGN OUT — Clear the session cookie
// ══════════════════════════════════════════════════════════

export async function memberSignOut(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}