// app/admin/finance/page.tsx
import { Suspense } from "react";
import { FinancePage } from "./finance-page";
import { FinanceSkeleton } from "./finance-skeleton";
import {
    fetchYearlyPaymentTotals,
    fetchMonthlyPaymentTotals,
    fetchGroupPaymentDistribution,
    fetchMembersPaymentProgress,
} from "@/actions/finance-analytics";

export const metadata = {
    title: "Finance & Payments",
    description: "Track member payments, compliance, and financial analytics.",
};

export default function FinancePageServer() {
    return (
        <Suspense fallback={<FinanceSkeleton />}>
            <FinancePageData />
        </Suspense>
    );
}

async function FinancePageData() {
    const currentYear = new Date().getFullYear();

    const [yearlyData, monthlyData, groupData, membersData] =
        await Promise.all([
            fetchYearlyPaymentTotals(),
            fetchMonthlyPaymentTotals(currentYear),
            fetchGroupPaymentDistribution(currentYear),
            fetchMembersPaymentProgress(currentYear),
        ]);

    return (
        <FinancePage
            yearlyData={yearlyData}
            monthlyData={monthlyData}
            groupData={groupData}
            membersData={membersData}
        />
    );
}