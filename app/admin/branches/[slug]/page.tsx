// app/admin/branches/[slug]/page.tsx

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBranchBySlug } from "@/actions/branch";
import { BranchDetailPage } from "@/components/dashboard/branches/branch-detail-page";
import { BranchDetailSkeleton } from "@/components/dashboard/branches/branch-skeleton";

export const dynamic = "force-dynamic";

interface BranchPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BranchPageProps) {
    const { slug } = await params;
    const branch = await getBranchBySlug(slug).catch(() => null);

    if (!branch) {
        return { title: "Branch Not Found" };
    }

    return {
        title: `${branch.name} — Branch(Assembly)`,
        description: `Manage ${branch.name} branch in ${branch.location}`,
    };
}

export default function BranchPage({ params }: BranchPageProps) {
    return (
        <Suspense fallback={<BranchDetailSkeleton />}>
            <BranchDataLoader params={params} />
        </Suspense>
    );
}

async function BranchDataLoader({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    if (!slug || slug.length < 2) notFound();

    const branch = await getBranchBySlug(slug);
    if (!branch) notFound();

    return <BranchDetailPage branch={branch} />;
}