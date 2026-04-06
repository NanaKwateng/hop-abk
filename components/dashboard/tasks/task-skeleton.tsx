// components/dashboard/tasks/task-skeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function TaskListSkeleton() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-10 flex-1 max-w-sm" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="rounded-3xl overflow-hidden">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-12 w-12 rounded-2xl" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-6 w-48 mt-4" />
                            <Skeleton className="h-4 w-full mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-6 w-28 rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-3 flex-col gap-2">
                            <div className="flex justify-between w-full">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-3 w-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export function TaskDetailSkeleton() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-9 w-36" />

            {/* Header */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-lg" />
                            <div className="space-y-1">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-6 w-12" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent className="p-0">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-4 w-56 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-10 w-32" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[300px] w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}