// src/app/admin/users/[id]/loading.tsx

import { UserDetailSkeleton } from "@/components/dashboard/users/user-detail-skeleton";

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <UserDetailSkeleton />
        </div>
    );
}