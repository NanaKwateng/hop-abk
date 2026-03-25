// components/dashboard/workflow/workflow-create-trigger.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateWorkflowDrawer } from "./create-workflow-dialog";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

export function WorkflowCreateTrigger() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <HoverBorderGradient
                containerClassName="rounded-md"
                as="button"
                className="dark:bg-black p-0 bg-white text-black dark:text-white flex items-center space-x-2 px-2 py-2 text-xs"
                onClick={() => setOpen(true)}
            >

                <Plus className="mr-2 h-4 w-4" />
                New Workflow

            </HoverBorderGradient>
            <CreateWorkflowDrawer open={open} onOpenChange={setOpen} />
        </>
    );
}