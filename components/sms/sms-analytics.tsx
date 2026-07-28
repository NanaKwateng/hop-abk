// components/sms/sms-analytics.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import { getSMSAnalytics } from "@/actions/sms/get-sms-analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { Mail, Users, CheckCircle2, XCircle, Clock, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6"];

export function SMSAnalytics() {
    const [refreshing, setRefreshing] = useState(false);

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["sms-analytics"],
        queryFn: getSMSAnalytics,
        staleTime: 60000,
        retry: 1,
    });

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch();
            toast.success("Analytics refreshed");
        } catch (err) {
            toast.error("Failed to refresh analytics");
        } finally {
            setRefreshing(false);
        }
    };

    if (isError) {
        return (
            <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-destructive/10 p-3 mb-4">
                        <XCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Failed to load analytics</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-4">
                        {error instanceof Error ? error.message : "There was an error loading the analytics"}
                    </p>
                    <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return <SMSAnalyticsSkeleton />;
    }

    if (!data || data.totalSent === 0) {
        return (
            <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                        <Mail className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No SMS data yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Start sending messages to see analytics here
                    </p>
                </CardContent>
            </Card>
        );
    }

    const statusData = data.statusDistribution.filter((s) => s.value > 0);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalSent.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">All time messages</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data.deliveryRate}%</div>
                        <p className="text-xs text-muted-foreground">{data.totalDelivered} delivered</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{data.totalFailed}</div>
                        <p className="text-xs text-muted-foreground">Delivery failures</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{data.totalPending}</div>
                        <p className="text-xs text-muted-foreground">Waiting for delivery</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Monthly Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Trend</CardTitle>
                        <CardDescription>Messages sent over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {data.monthlyData.length > 0 ? (
                            <ChartContainer
                                config={{
                                    sent: { label: "Sent", color: "hsl(var(--primary))" },
                                    delivered: { label: "Delivered", color: "hsl(var(--success))" },
                                }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="sent" fill="var(--color-sent)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="delivered" fill="var(--color-delivered)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                No monthly data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Status Distribution</CardTitle>
                        <CardDescription>Breakdown by delivery status</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                No status data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Groups */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Top Recipient Groups</CardTitle>
                        <CardDescription>Most active recipient groups</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.topGroups.length > 0 ? (
                            <div className="space-y-4">
                                {data.topGroups.map((group, index) => (
                                    <div key={group.name} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{group.name}</span>
                                            <span className="text-muted-foreground">{group.count} messages</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all"
                                                style={{
                                                    width: `${(group.count / data.topGroups[0].count) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-4">
                                No group data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function SMSAnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-20 mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <Skeleton className="h-full w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}