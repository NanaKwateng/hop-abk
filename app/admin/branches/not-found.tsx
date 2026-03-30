// app/admin/branches/not-found.tsx

import Link from "next/link";
import { GitBranchPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BranchesNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <GitBranchPlus className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Branch Not Found</h2>
                <p className="text-muted-foreground max-w-md">
                    The branch you're looking for doesn't exist or may have been removed.
                </p>
            </div>
            <Button asChild>
                <Link href="/admin/branches">Back to Branches</Link>
            </Button>
        </div>
    );
}