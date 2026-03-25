// app/admin/workflows/[slug]/page.tsx

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getWorkflowBySlug } from "@/actions/workflow";
import { WorkflowDetailPage } from "@/components/dashboard/workflow/workflow-detail-page";
import { WorkflowDetailSkeleton } from "@/components/dashboard/workflow/workflow-skeleton";

export const dynamic = "force-dynamic";

interface WorkflowPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: WorkflowPageProps) {
    const { slug } = await params;

    const workflow = await getWorkflowBySlug(slug).catch(() => null);

    if (!workflow) {
        return {
            title: "Workflow Not Found",
            description: "The requested workflow could not be found.",
        };
    }

    return {
        title: `${workflow.name} — Workflow`,
        description: `Manage ${workflow.type} workflow with ${workflow.memberCount} members`,
    };
}

export default function WorkflowPage({ params }: WorkflowPageProps) {
    return (
        <Suspense fallback={<WorkflowDetailSkeleton />}>
            <WorkflowDataLoader params={params} />
        </Suspense>
    );
}

async function WorkflowDataLoader({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    if (!slug || slug.length < 2) {
        notFound();
    }

    const workflow = await getWorkflowBySlug(slug);

    if (!workflow) {
        notFound();
    }

    return <WorkflowDetailPage workflow={workflow} />;
}