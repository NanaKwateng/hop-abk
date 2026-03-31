// app/member-dashboard/page.tsx
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
    getVerifiedMember,
    fetchMemberAnalytics,
} from "@/actions/member-verify";
import { MemberDashboardPage } from "@/components/member/member-dashboard-page";
import { MemberDashboardSkeleton } from "@/components/member/member-dashboard-skeleton";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "My Dashboard",
    description: "View your payment records and analytics.",
};

export default function Page() {
    return (
        <Suspense fallback={<MemberDashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    );
}

async function DashboardContent() {
    const member = await getVerifiedMember();

    if (!member) {
        redirect("/verify");
    }

    let analytics;
    try {
        analytics = await fetchMemberAnalytics(member.id);
    } catch (error) {
        console.error("[MEMBER DASHBOARD] Analytics fetch failed:", error);
        analytics = {
            currentYear: {
                year: new Date().getFullYear(),
                totalPaid: 0,
                totalUnpaid: 12,
                totalAmount: 0,
                months: Array.from({ length: 12 }, (_, i) => ({
                    month: i + 1,
                    monthName: [
                        "January", "February", "March", "April",
                        "May", "June", "July", "August",
                        "September", "October", "November", "December",
                    ][i],
                    status: "unpaid" as const,
                    amount: null,
                    paidAt: null,
                    paymentId: null,
                })),
            },
            previousYears: [],
            overallPaidPercentage: 0,
            totalAllTimeAmount: 0,
            streakMonths: 0,
        };
    }

    return <MemberDashboardPage member={member} analytics={analytics} />;
}