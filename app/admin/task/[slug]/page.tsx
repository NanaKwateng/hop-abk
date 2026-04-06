// app/admin/task/[slug]/page.tsx

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTaskBySlug } from "@/actions/task";
import { TaskDetailPage } from "@/components/dashboard/tasks/task-detail-page";
import { TaskDetailSkeleton } from "@/components/dashboard/tasks/task-skeleton";

export const dynamic = "force-dynamic";

interface TaskPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TaskPageProps) {
    const { slug } = await params;

    const task = await getTaskBySlug(slug).catch(() => null);

    if (!task) {
        return {
            title: "Task Not Found",
            description: "The requested task could not be found.",
        };
    }

    return {
        title: `${task.name} — Task`,
        description: `Manage ${task.purpose} task with ${task.stats.totalMembers} members`,
    };
}

export default function TaskPage({ params }: TaskPageProps) {
    return (
        <Suspense fallback={<TaskDetailSkeleton />}>
            <TaskDataLoader params={params} />
        </Suspense>
    );
}

async function TaskDataLoader({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    console.log("[TaskDataLoader] slug received:", slug);

    const task = await getTaskBySlug(slug);

    console.log("[TaskDataLoader] task result:", task ? "Found" : "Not found");

    if (!task) {
        notFound();
    }

    return <TaskDetailPage task={task} />;
}