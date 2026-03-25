// components/finance/finance-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function FinanceSkeleton() {
    return (
        <div className="space-y-6">
            {/* ── Page header ── */}
            <div className="space-y-1">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* ── Summary cards ── */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-3 w-28" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── Tabs skeleton ── */}
            <div className="space-y-6">
                {/* Tab list */}
                <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1 rounded-md" />
                    <Skeleton className="h-9 flex-1 rounded-md" />
                    <Skeleton className="h-9 flex-1 rounded-md" />
                    <Skeleton className="h-9 flex-1 rounded-md" />
                </div>

                {/* Chart card */}
                <Card>
                    <CardHeader className="space-y-2">
                        <Skeleton className="h-5 w-44" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Chart area */}
                        <div className="flex items-end gap-3 h-[250px] pt-8">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="flex-1 rounded-t-lg"
                                    style={{
                                        height: `${40 + Math.random() * 50}%`,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="space-y-2 pt-4 border-t">
                            <Skeleton className="h-4 w-56" />
                            <Skeleton className="h-3 w-44" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}