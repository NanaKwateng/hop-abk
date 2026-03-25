// lib/types/payments.ts

export interface PaymentRow {
    id: string;
    member_id: string;
    year: number;
    month: number;
    amount: number | null;
    status: "paid" | "unpaid";
    paid_at: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string | null;
}

export interface Payment {
    id: string;
    memberId: string;
    year: number;
    month: number;
    amount: number | null;
    status: "paid" | "unpaid";
    paidAt: string | null;
    notes: string | null;
    createdAt: string | null;
}

export interface MonthPayment {
    month: number;
    monthName: string;
    status: "paid" | "unpaid";
    amount: number | null;
    paidAt: string | null;
    paymentId: string | null;
}

export interface YearlyPaymentSummary {
    year: number;
    totalPaid: number;
    totalUnpaid: number;
    totalAmount: number;
    months: MonthPayment[];
}

export interface PaymentAnalytics {
    currentYear: YearlyPaymentSummary;
    previousYears: YearlyPaymentSummary[];
    overallPaidPercentage: number;
    totalAllTimeAmount: number;
    streakMonths: number;
}

export const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;