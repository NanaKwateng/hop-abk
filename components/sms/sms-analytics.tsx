// components/sms/sms-analytics.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { Mail, Users, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";

// Mock analytics - replace with actual data fetching
async function getSMSAnalytics() {
    // In production, this would fetch from your analytics endpoint
    return {
        totalSent: 1250,
        totalDelivered: 1180,
        totalFailed: 45,
        totalPending: 25,
        monthlyData: [
            { month: "Jan", sent: 120, delivered: 115 },
            { month: "Feb", sent: 150, delivered: 142 },
            { month: "Mar", sent: 180, delivered: 170 },
            { month: "Apr", sent: 200, delivered: 188 },
            { month: "May", sent: 220, delivered: 205 },
            { month: "Jun", sent: 380, delivered: 360 },
        ],
        statusDistribution: [
            { name: "Delivered", value: 1180 },
            { name: "Failed", value: 45 },
            { name: "Pending", value: 25 },
        ],
        topGroups: [
            { name: "Men's Fellowship", count: 320 },
            { name: "Women's Fellowship", count: 280 },
            { name: "Youth Fellowship", count: 250 },
        ],
    };
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6"];

export function SMSAnalytics() {
    const { data, isLoading } = useQuery({
        queryKey: ["sms-analytics"],
        queryFn: getSMSAnalytics,
        staleTime: 60 * 1000,
    });

    if (isLoading) {
        return <SMSAnalyticsSkeleton />;
    }

    if (!data) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    No analytics data available
                </CardContent>
            </Card>
        );
    }

    const deliveryRate = data.totalSent > 0
        ? Math.round((data.totalDelivered / data.totalSent) * 100)
        : 0;

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
                        <div className="text-2xl font-bold text-green-600">{deliveryRate}%</div>
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
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="delivered" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Status Distribution</CardTitle>
                        <CardDescription>Breakdown by delivery status</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Groups */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Top Recipient Groups</CardTitle>
                        <CardDescription>Most active recipient groups</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.topGroups.map((group, index) => (
                                <div key={group.name} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{group.name}</span>
                                        <span className="text-muted-foreground">{group.count} members</span>
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