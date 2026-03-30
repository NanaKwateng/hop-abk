// app/admin/branches/page.tsx

import { Suspense } from "react";
import { getBranches } from "@/actions/branch";
import { BranchesList } from "@/components/dashboard/branches/branches-list";
import { BranchesListSkeleton } from "@/components/dashboard/branches/branch-skeleton";
import type { Branch } from "@/lib/types/branch";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Branches",
    description: "Manage all church branches and their leaders.",
};

export default function BranchesPage() {
    return (
        <Suspense fallback={<BranchesListSkeleton />}>
            <BranchesData />
        </Suspense>
    );
}

async function BranchesData() {
    let branches: Branch[] = [];
    try {
        branches = await getBranches();
    } catch (error) {
        console.error("[BRANCHES PAGE] Fetch failed:", error);
        branches = [];
    }
    return <BranchesList initialBranches={branches} />;
}