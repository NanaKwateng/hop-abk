// components/member-location/member-location-skeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";

export function MemberLocationSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <div className="rounded-lg border p-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <div className="rounded-lg border p-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
            </div>
        </div>
    );
}