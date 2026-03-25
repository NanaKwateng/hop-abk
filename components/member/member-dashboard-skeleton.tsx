// components/member/member-dashboard-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function MemberDashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Profile card */}
                    <Card className="lg:col-span-1">
                        <CardContent className="flex flex-col items-center gap-4 pt-6">
                            <Skeleton className="h-28 w-28 rounded-full" />
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-24" />
                            <div className="w-full space-y-3 pt-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Analytics */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i}>
                                    <CardContent className="p-4">
                                        <Skeleton className="h-16 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-5 w-36" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[250px] w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}