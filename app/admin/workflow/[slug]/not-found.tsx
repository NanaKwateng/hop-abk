// app/admin/workflows/[slug]/not-found.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft, Plus } from "lucide-react";

export default function WorkflowNotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>

            <div className="space-y-2 max-w-md">
                <h1 className="text-2xl font-bold tracking-tight">
                    Workflow Not Found
                </h1>
                <p className="text-muted-foreground">
                    This workflow doesn&apos;t exist or may have been deleted.
                    Check the URL or return to your workflows.
                </p>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" asChild>
                    <Link href="/admin/workflow">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        All Workflows
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/admin/workflow">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New
                    </Link>
                </Button>
            </div>
        </div>
    );
}