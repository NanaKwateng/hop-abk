// src/app/admin/users/loading.tsx
// ============================================================
// Next.js loading file — shown automatically while page loads.
// ============================================================
"use client"
import { UserTableSkeleton } from "@/components/dashboard/users/user-table-skeleton";

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="h-9 w-48 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-96 animate-pulse rounded bg-muted" />
                </div>
                <UserTableSkeleton />
            </div>
        </div>
    );
}