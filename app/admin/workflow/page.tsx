// app/admin/workflows/page.tsx
import { Suspense } from "react";
import { getWorkflows } from "@/actions/workflow";
import { WorkflowsList } from "@/components/dashboard/workflow/workflows-list";
import { WorkflowListSkeleton } from "@/components/dashboard/workflow/workflow-skeleton";
import type { Workflow } from "@/lib/types/workflow";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Workflows",
    description: "Manage bulk member tasks, payments, and records.",
};

export default function WorkflowsPage() {
    return (
        <Suspense fallback={<WorkflowListSkeleton />}>
            <WorkflowsData />
        </Suspense>
    );
}

async function WorkflowsData() {
    let workflows: Workflow[] = [];
    try {
        workflows = await getWorkflows();
    } catch (error) {
        console.error("[WORKFLOWS PAGE] Fetch failed:", error);
        workflows = [];
    }

    return <WorkflowsList initialWorkflows={workflows} />;
}