// components/dashboard/tasks/task-create-trigger.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { CreateTaskDialog } from "./create-task-dialog";

export function TaskCreateTrigger() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <HoverBorderGradient
                containerClassName="rounded-md"
                as="button"
                className="dark:bg-black p-0 bg-white text-black dark:text-white flex items-center space-x-2 px-3 py-2 text-sm"
                onClick={() => setOpen(true)}
                aria-label="Create new task"
            >
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                New Task
            </HoverBorderGradient>
            <CreateTaskDialog open={open} onOpenChange={setOpen} />
        </>
    );
}