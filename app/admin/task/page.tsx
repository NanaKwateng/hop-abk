// app/admin/task/page.tsx

import { Suspense } from "react";
import { getTasks } from "@/actions/task";
import { TasksList } from "@/components/dashboard/tasks/tasks-list";
import { TaskListSkeleton } from "@/components/dashboard/tasks/task-skeleton";
import type { TaskWithStats } from "@/lib/types/task";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Tasks",
    description: "Manage member tasks, activities, and progress tracking.",
};

export default function TasksPage() {
    return (
        <Suspense fallback={<TaskListSkeleton />}>
            <TasksData />
        </Suspense>
    );
}

async function TasksData() {
    let tasks: TaskWithStats[] = [];
    try {
        tasks = await getTasks();
    } catch (error) {
        console.error("[TASKS PAGE] Fetch failed:", error);
        tasks = [];
    }

    return <TasksList initialTasks={tasks} />;
}