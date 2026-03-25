// components/users/user-detail-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function UserDetailSkeleton() {
    return (
        <div className="space-y-6">
            {/* Back button */}
            <Skeleton className="h-9 w-36" />

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile card skeleton */}
                <Card className="md:col-span-1">
                    <CardContent className="flex flex-col items-center gap-4 pt-6">
                        <Skeleton className="size-32 rounded-full" />
                        <div className="space-y-2 text-center">
                            <Skeleton className="mx-auto h-7 w-48" />
                            <Skeleton className="mx-auto h-4 w-24" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex w-full flex-col gap-2">
                            <Skeleton className="h-9 w-full" />
                            <Skeleton className="h-9 w-full" />
                            <Skeleton className="h-9 w-full" />
                        </div>
                    </CardContent>
                </Card>

                {/* Details card skeleton */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Skeleton className="size-10 rounded-lg" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}