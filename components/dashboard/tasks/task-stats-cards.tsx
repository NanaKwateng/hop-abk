// components/dashboard/tasks/task-stats-cards.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    BarChart3,
    CheckCircle2,
    Clock,
    CreditCard,
    Users,
    TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/task-utils";
import type { TaskDetail } from "@/lib/types/task";

interface TaskStatsCardsProps {
    task: TaskDetail;
    totalActivities: number;
    completedActivities: number;
    pendingActivities: number;
    totalPayments: number;
    processedMembers: number;
}

export function TaskStatsCards({
    task,
    totalActivities,
    completedActivities,
    pendingActivities,
    totalPayments,
    processedMembers,
}: TaskStatsCardsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Activities */}
            <Card>
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total Activities</p>
                        <p className="text-lg font-bold tabular-nums">{totalActivities}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Completed */}
            <Card>
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                        <p className="text-lg font-bold tabular-nums">
                            {completedActivities}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Pending */}
            <Card>
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-950/50">
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-lg font-bold tabular-nums">
                            {pendingActivities}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Payment/Progress */}
            <Card>
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
                        {task.purpose === "payments" ? (
                            <CreditCard className="h-4 w-4 text-blue-600" />
                        ) : (
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">
                            {task.purpose === "payments" ? "Total Amount" : "Progress"}
                        </p>
                        <p className="text-lg font-bold tabular-nums">
                            {task.purpose === "payments"
                                ? formatCurrency(totalPayments)
                                : `${Math.round(task.completionRate)}%`}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}